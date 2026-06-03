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
const { Post } = require('../../Models/PostModel')
const { connect, disconnect } = require('./setup')

let app
let token
let userId

beforeAll(async () => {
    await connect()
    app = createApp()
    const res = await request(app).post('/api/users').send({
        name: 'Post User',
        email: 'poster@test.com',
        password: 'pass123',
    })
    token = res.body.token
    userId = res.body._id
})

afterAll(disconnect)
afterEach(() => Post.deleteMany({}))

describe('POST /api/posts — create post', () => {
    test('creates a post and returns 200', async () => {
        const res = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Hello World', description: 'My first post', username: 'Post User', userId })
        expect(res.status).toBe(200)
        expect(res.body.title).toBe('Hello World')
        expect(res.body.description).toBe('My first post')
    })

    test('returns 401 without a token', async () => {
        const res = await request(app)
            .post('/api/posts')
            .send({ title: 'No auth', description: 'Should fail', username: 'x', userId })
        expect(res.status).toBe(401)
    })
})

describe('GET /api/posts — fetch posts', () => {
    beforeEach(async () => {
        await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Post A', description: 'Desc A', username: 'Post User', userId })
        await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Post B', description: 'Desc B', username: 'Post User', userId })
    })

    test('returns all posts as an array', async () => {
        const res = await request(app)
            .get('/api/posts')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
        expect(res.body.length).toBe(2)
    })

    test('returns 401 without a token', async () => {
        const res = await request(app).get('/api/posts')
        expect(res.status).toBe(401)
    })
})
