jest.mock('express-async-handler', () => fn => fn)
jest.mock('jsonwebtoken')
jest.mock('../Models/UserModel', () => ({
  User: { findById: jest.fn() },
}))

const jwt = require('jsonwebtoken')
const { User } = require('../Models/UserModel')
const { protect } = require('../MiddleWare/AuthMiddleware')

process.env.JWT_SECRET = 'test-secret'

const mockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('protect middleware', () => {
  beforeEach(() => jest.clearAllMocks())

  test('throws 401 when no Authorization header is present', async () => {
    const req = { headers: {} }
    const res = mockRes()

    await expect(protect(req, res, jest.fn())).rejects.toThrow('Not authorized no token')
    expect(res.status).toHaveBeenCalledWith(401)
  })

  test('throws 401 when token is invalid', async () => {
    const req = { headers: { authorization: 'Bearer bad-token' } }
    const res = mockRes()
    jwt.verify.mockImplementation(() => { throw new Error('invalid token') })

    await expect(protect(req, res, jest.fn())).rejects.toThrow('Not authorized token failed')
    expect(res.status).toHaveBeenCalledWith(401)
  })

  test('calls next() and attaches user when token is valid', async () => {
    const req = { headers: { authorization: 'Bearer valid-token' } }
    const res = mockRes()
    const next = jest.fn()
    const mockUser = { _id: 'user123', name: 'Abi', email: 'abi@test.com' }

    jwt.verify.mockReturnValue({ id: 'user123' })
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) })

    await protect(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.user).toEqual(mockUser)
  })

  test('throws 401 when user is not found in DB', async () => {
    const req = { headers: { authorization: 'Bearer valid-token' } }
    const res = mockRes()
    jwt.verify.mockReturnValue({ id: 'ghost-id' })
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) })

    await expect(protect(req, res, jest.fn())).rejects.toThrow('Not authorized token failed')
  })
})
