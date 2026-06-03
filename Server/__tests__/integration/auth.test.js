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

beforeAll(async () => {
    await connect()
    app = createApp()
})

afterAll(disconnect)
afterEach(clearCollections)

describe('POST /api/users — register', () => {
    test('creates a new user and returns 201 with token', async () => {
        const res = await request(app).post('/api/users').send({
            name: 'Test User',
            email: 'test@example.com',
            password: 'pass123',
        })
        expect(res.status).toBe(201)
        expect(res.body).toMatchObject({ name: 'Test User', email: 'test@example.com' })
        expect(res.body.token).toBeDefined()
        expect(res.body.password).toBeUndefined()
    })

    test('returns 400 when required fields are missing', async () => {
        const res = await request(app).post('/api/users').send({ name: 'No Email' })
        expect(res.status).toBe(400)
    })

    test('returns 400 when email is already registered', async () => {
        const body = { name: 'Dupe', email: 'dupe@test.com', password: 'pass123' }
        await request(app).post('/api/users').send(body)
        const res = await request(app).post('/api/users').send(body)
        expect(res.status).toBe(400)
        expect(res.body.message).toMatch(/already exists/i)
    })
})

describe('POST /api/users/login — auth', () => {
    beforeEach(async () => {
        await request(app).post('/api/users').send({
            name: 'Login User',
            email: 'login@test.com',
            password: 'pass123',
        })
    })

    test('returns 201 with token on valid credentials', async () => {
        const res = await request(app)
            .post('/api/users/login')
            .send({ email: 'login@test.com', password: 'pass123' })
        expect(res.status).toBe(201)
        expect(res.body.token).toBeDefined()
        expect(res.body.email).toBe('login@test.com')
    })

    test('returns 401 for wrong password', async () => {
        const res = await request(app)
            .post('/api/users/login')
            .send({ email: 'login@test.com', password: 'wrongpass' })
        expect(res.status).toBe(401)
        expect(res.body.message).toMatch(/invalid email or password/i)
    })

    test('returns 401 for unknown email', async () => {
        const res = await request(app)
            .post('/api/users/login')
            .send({ email: 'nobody@test.com', password: 'pass123' })
        expect(res.status).toBe(401)
    })
})
