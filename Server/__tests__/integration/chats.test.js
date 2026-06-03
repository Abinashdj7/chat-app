jest.mock('../../Cache', () => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(null),
    keys: { userChats: (id) => `chats:user:${id}`, chatMessages: () => '', allPosts: () => '' },
    TTL: { CHATS: 300, MESSAGES: 120, POSTS: 300 },
}))

process.env.JWT_SECRET = 'test-secret'

const request = require('supertest')
const createApp = require('../../createApp')
const { Chat } = require('../../Models/ChatModel')
const { connect, disconnect } = require('./setup')

let app
let tokenA, tokenB
let userAId, userBId

beforeAll(async () => {
    await connect()
    app = createApp()

    const resA = await request(app).post('/api/users').send({ name: 'Alice', email: 'alice@chat.com', password: 'pass123' })
    tokenA = resA.body.token
    userAId = resA.body._id

    const resB = await request(app).post('/api/users').send({ name: 'Bob', email: 'bob@chat.com', password: 'pass123' })
    tokenB = resB.body.token
    userBId = resB.body._id
})

afterAll(disconnect)
afterEach(() => Chat.deleteMany({}))

describe('POST /api/chats — access or create direct chat', () => {
    test('creates a new direct chat between two users', async () => {
        const res = await request(app)
            .post('/api/chats')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ userId: userBId })
        expect(res.status).toBe(200)
        expect(res.body.isGroupChat).toBe(false)
        const userIds = res.body.users.map(u => u._id.toString())
        expect(userIds).toContain(userAId)
        expect(userIds).toContain(userBId)
    })

    test('returns the existing chat on a second access', async () => {
        await request(app)
            .post('/api/chats')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ userId: userBId })
        const res = await request(app)
            .post('/api/chats')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ userId: userBId })
        expect(res.status).toBe(200)
        expect(res.body.isGroupChat).toBe(false)
    })

    test('returns 400 when userId is missing', async () => {
        const res = await request(app)
            .post('/api/chats')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({})
        expect(res.status).toBe(400)
    })

    test('returns 401 without a token', async () => {
        const res = await request(app).post('/api/chats').send({ userId: userBId })
        expect(res.status).toBe(401)
    })
})

describe('GET /api/chats — fetch user chats', () => {
    beforeEach(async () => {
        await request(app)
            .post('/api/chats')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ userId: userBId })
    })

    test('returns the list of chats for the logged-in user', async () => {
        const res = await request(app)
            .get('/api/chats')
            .set('Authorization', `Bearer ${tokenA}`)
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
        expect(res.body.length).toBeGreaterThan(0)
    })

    test('returns 401 without a token', async () => {
        const res = await request(app).get('/api/chats')
        expect(res.status).toBe(401)
    })
})

describe('POST /api/chats/group — create group chat', () => {
    let userCId, tokenC

    beforeAll(async () => {
        const resC = await request(app).post('/api/users').send({ name: 'Carol', email: 'carol@chat.com', password: 'pass123' })
        tokenC = resC.body.token
        userCId = resC.body._id
    })

    test('creates a group chat with 3+ users', async () => {
        const res = await request(app)
            .post('/api/chats/group')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ name: 'Dev Team', users: JSON.stringify([userBId, userCId]) })
        expect(res.status).toBe(200)
        expect(res.body.isGroupChat).toBe(true)
        expect(res.body.chatName).toBe('Dev Team')
        expect(res.body.users.length).toBe(3)
    })

    test('returns 400 when fewer than 2 other users are provided', async () => {
        const res = await request(app)
            .post('/api/chats/group')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ name: 'Too Small', users: JSON.stringify([userBId]) })
        expect(res.status).toBe(400)
    })

    test('returns 400 when name or users are missing', async () => {
        const res = await request(app)
            .post('/api/chats/group')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ name: 'No Users' })
        expect(res.status).toBe(400)
    })
})
