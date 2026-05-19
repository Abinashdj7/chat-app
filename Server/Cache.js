const Redis = require('ioredis')

const client = new Redis(process.env.REDIS_URL || 'redis://redis:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
})

client.on('error', () => {})

const TTL = {
    CHATS:    300,
    MESSAGES: 120,
    POSTS:    300,
}

const keys = {
    userChats:    (userId)  => `chats:user:${userId}`,
    chatMessages: (chatId)  => `messages:chat:${chatId}`,
    allPosts:     ()        => 'posts:all',
}

async function get(key) {
    try {
        const val = await client.get(key)
        return val ? JSON.parse(val) : null
    } catch {
        return null
    }
}

async function set(key, value, ttl) {
    try {
        await client.set(key, JSON.stringify(value), 'EX', ttl)
    } catch {
    }
}

async function del(...cacheKeys) {
    try {
        const flat = cacheKeys.flat().filter(Boolean)
        if (flat.length > 0) await client.del(...flat)
    } catch {
    }
}

module.exports = { get, set, del, keys, TTL }
