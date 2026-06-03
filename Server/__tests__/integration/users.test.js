jest.mock('../../Cache', () => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(null),
    keys: { userChats: () => '', chatMessages: () => '', allPosts: () => '' },
    TTL: { CHATS: 300, MESSAGES: 120, POSTS: 300 },
}))

process.env.JWT_SECRET = 'test-secret'

const request = require('supertest')
const createApp = require('../../createApp')
const { connect, disconnect, clearCollections } = require('./setup')

let app
let token

beforeAll(async () => {
    await connect()
    app = createApp()
    const res = await request(app).post('/api/users').send({
        name: 'Main User',
        email: 'main@test.com',
        password: 'pass123',
    })
    token = res.body.token
})

afterAll(disconnect)

describe('GET /api/users — search users', () => {
    beforeAll(async () => {
        await request(app).post('/api/users').send({ name: 'Alice Smith', email: 'alice@test.com', password: 'pass123' })
        await request(app).post('/api/users').send({ name: 'Bob Jones', email: 'bob@test.com', password: 'pass123' })
    })

    afterAll(clearCollections)

    test('returns 401 without a token', async () => {
        const res = await request(app).get('/api/users')
        expect(res.status).toBe(401)
    })

    test('returns all other users when no search query is given', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
        // should not include the requester themselves
        const emails = res.body.map(u => u.email)
        expect(emails).not.toContain('main@test.com')
    })

    test('returns matching users by name search', async () => {
        const res = await request(app)
            .get('/api/users?search=alice')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)
        expect(res.body.length).toBeGreaterThan(0)
        expect(res.body[0].name).toMatch(/alice/i)
    })

    test('returns matching users by email search', async () => {
        const res = await request(app)
            .get('/api/users?search=bob@test.com')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)
        expect(res.body[0].email).toBe('bob@test.com')
    })

    test('returns empty array when no user matches', async () => {
        const res = await request(app)
            .get('/api/users?search=zzznobody')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)
        expect(res.body).toEqual([])
    })
})
