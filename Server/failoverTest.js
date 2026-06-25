/**
 * MongoDB Replica Set Failover Test
 *
 * Run from chat-app/Server:   npm run test:failover
 * Requires the Docker stack:  docker compose up -d
 *
 * Uses directConnection=true on each port so no replica-set hostname
 * discovery happens — works from the host without any /etc/hosts changes.
 */

const { MongoClient } = require('mongodb');
const { execSync }    = require('child_process');
const path            = require('path');

const COMPOSE_FILE = path.resolve(__dirname, '../docker-compose.yml');
const TEST_DB      = 'chatapp_failover_test';
const TEST_COL     = 'failover_docs';
const DOC_COUNT    = 100;

const NODES = [
  { service: 'mongo1', port: 27017 },
  { service: 'mongo2', port: 27018 },
  { service: 'mongo3', port: 27019 },
];

function directUri(port) {
  return `mongodb://localhost:${port}/?directConnection=true`;
}

async function withClient(port, fn) {
  const client = new MongoClient(directUri(port), { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    return await fn(client);
  } finally {
    await client.close().catch(() => {});
  }
}

async function getNodeState(port) {
  try {
    return await withClient(port, async client => {
      const status = await client.db('admin').command({ replSetGetStatus: 1 });
      const self   = status.members.find(m => m.self);
      return self ? self.stateStr : null;
    });
  } catch (_) {
    return null;
  }
}

async function findPrimary(excludeService = null) {
  for (const node of NODES) {
    if (node.service === excludeService) continue;
    const state = await getNodeState(node.port);
    if (state === 'PRIMARY') return node;
  }
  return null;
}

function docker(cmd) {
  return execSync(`docker compose -f "${COMPOSE_FILE}" ${cmd}`, {
    stdio: 'pipe', encoding: 'utf8',
  }).trim();
}

function line(label, value) {
  console.log(`  ${label.padEnd(38)} ${value}`);
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const totalStart = Date.now();

  console.log('\n========================================');
  console.log('  MongoDB Replica Set Failover Test');
  console.log('========================================\n');

  // ── Step 1: Replica set layout ─────────────────────────────────────────
  console.log('[1/5] Replica set status');

  const states = {};
  for (const node of NODES) {
    states[node.service] = await getNodeState(node.port);
    const label = states[node.service] ?? 'UNREACHABLE';
    console.log(`  ${label.padEnd(12)} ${node.service} (localhost:${node.port})`);
  }

  const primaryNode    = NODES.find(n => states[n.service] === 'PRIMARY');
  const secondaryNodes = NODES.filter(n => states[n.service] === 'SECONDARY');

  if (!primaryNode) {
    console.error('\n  No primary found — is the replica set initialised?');
    process.exit(1);
  }

  // ── Step 2: Write documents ────────────────────────────────────────────
  console.log(`\n[2/5] Writing ${DOC_COUNT} documents (writeConcern: majority)`);

  const docs = Array.from({ length: DOC_COUNT }, (_, i) => ({
    index: i, payload: `failover-doc-${i}`, createdAt: new Date(),
  }));

  const writeStart = Date.now();
  const insertedCount = await withClient(primaryNode.port, async client => {
    const col = client.db(TEST_DB).collection(TEST_COL);
    await col.deleteMany({});
    const r = await col.insertMany(docs, { writeConcern: { w: 'majority' } });
    return r.insertedCount;
  });
  const writeMs = Date.now() - writeStart;

  console.log(`  Inserted  : ${insertedCount} documents`);
  console.log(`  Write time: ${writeMs} ms`);
  console.log(`  w:majority — data confirmed on ≥2 nodes before ack`);

  // ── Step 3: Pre-failover read ──────────────────────────────────────────
  console.log('\n[3/5] Pre-failover read check');
  const preFail = await withClient(primaryNode.port, client =>
    client.db(TEST_DB).collection(TEST_COL).countDocuments()
  );
  console.log(`  Documents readable before failover: ${preFail}`);

  // ── Step 4: Kill the primary ───────────────────────────────────────────
  console.log(`\n[4/5] Stopping primary: ${primaryNode.service} (localhost:${primaryNode.port})`);
  docker(`stop ${primaryNode.service}`);
  console.log(`  ${primaryNode.service} stopped at t=0`);

  // ── Step 5: Wait for election ──────────────────────────────────────────
  console.log('\n[5/5] Waiting for election...\n');
  const electionStart = Date.now();
  let newPrimaryNode = null;
  let pollCount      = 0;

  while (!newPrimaryNode) {
    await sleep(500);
    pollCount++;
    const elapsed = Date.now() - electionStart;
    process.stdout.write(`\r  t=${elapsed}ms  polls=${pollCount}  waiting...   `);
    newPrimaryNode = await findPrimary(primaryNode.service);
  }

  const electionMs = Date.now() - electionStart;
  console.log(`\n\n  New primary: ${newPrimaryNode.service} (localhost:${newPrimaryNode.port})`);
  console.log(`  Election time: ${electionMs} ms  (${pollCount} polls × 500 ms)`);

  // ── Step 6: Read back from new primary ────────────────────────────────
  const readStart  = Date.now();
  const afterCount = await withClient(newPrimaryNode.port, client =>
    client.db(TEST_DB).collection(TEST_COL).countDocuments()
  );
  const readMs   = Date.now() - readStart;
  const dataLoss = DOC_COUNT - afterCount;
  const totalMs  = Date.now() - totalStart;

  // ── Cleanup ────────────────────────────────────────────────────────────
  await withClient(newPrimaryNode.port, client =>
    client.db(TEST_DB).collection(TEST_COL).drop().catch(() => {})
  );

  // ── Restart stopped node ───────────────────────────────────────────────
  console.log(`\n  Restarting ${primaryNode.service} (rejoins as secondary)...`);
  docker(`start ${primaryNode.service}`);
  console.log(`  ${primaryNode.service} restarted`);

  // ── Report ─────────────────────────────────────────────────────────────
  console.log('\n========================================');
  console.log('  RESULTS');
  console.log('========================================\n');

  line('Initial primary:',           `${primaryNode.service} (localhost:${primaryNode.port})`);
  line('Initial secondaries:',       secondaryNodes.map(n => `${n.service}:${n.port}`).join(', '));
  line('Documents written:',         `${insertedCount}`);
  line('Write time:',                `${writeMs} ms`);
  line('Documents before failover:', `${preFail}`);
  line('Container stopped:',         primaryNode.service);
  line('Election time:',             `${electionMs} ms`);
  line('Poll attempts:',             `${pollCount}`);
  line('New primary:',               `${newPrimaryNode.service} (localhost:${newPrimaryNode.port})`);
  line('Documents after failover:',  `${afterCount}`);
  line('Read time after failover:',  `${readMs} ms`);
  line('Data loss:',                 `${dataLoss} documents`);
  line('Total test duration:',       `${totalMs} ms`);

  console.log('');
  if (dataLoss === 0) {
    console.log('  RESULT: PASS — zero data loss, failover successful');
  } else {
    console.log(`  RESULT: FAIL — ${dataLoss} document(s) lost`);
  }
  console.log('\n========================================\n');

  process.exit(dataLoss === 0 ? 0 : 1);
}

main().catch(err => {
  console.error('\nTest error:', err.message);
  process.exit(1);
});
