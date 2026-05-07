const { registerUser, authUser } = require('../Controllers/UserController')

// make asyncHandler a passthrough so we can call controllers directly
jest.mock('express-async-handler', () => fn => fn)

jest.mock('../Models/UserModel', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}))

jest.mock('../MiddleWare/GenerateToken', () => jest.fn(() => 'mock-token'))

const { User } = require('../Models/UserModel')

const mockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('registerUser', () => {
  beforeEach(() => jest.clearAllMocks())

  test('returns 400 when required fields are missing', async () => {
    const req = { body: { name: '', email: '', password: '' } }
    const res = mockRes()

    await expect(registerUser(req, res)).rejects.toThrow('Please enter all details')
    expect(res.status).toHaveBeenCalledWith(400)
  })

  test('returns 400 when user already exists', async () => {
    const req = { body: { name: 'Abi', email: 'abi@test.com', password: 'pass123' } }
    const res = mockRes()
    User.findOne.mockResolvedValue({ email: 'abi@test.com' })

    await expect(registerUser(req, res)).rejects.toThrow('User already exists')
    expect(res.status).toHaveBeenCalledWith(400)
  })

  test('creates user and returns 201 with token on success', async () => {
    const req = { body: { name: 'Abi', email: 'abi@test.com', password: 'pass123', pic: null } }
    const res = mockRes()
    User.findOne.mockResolvedValue(null)
    User.create.mockResolvedValue({
      _id: 'user123',
      name: 'Abi',
      email: 'abi@test.com',
      isAdmin: false,
      pic: null,
    })

    await registerUser(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'mock-token', email: 'abi@test.com' })
    )
  })
})

describe('authUser', () => {
  beforeEach(() => jest.clearAllMocks())

  test('returns 401 when user is not found', async () => {
    const req = { body: { email: 'nobody@test.com', password: 'wrong' } }
    const res = mockRes()
    User.findOne.mockResolvedValue(null)

    await expect(authUser(req, res)).rejects.toThrow('Invalid email or password')
    expect(res.status).toHaveBeenCalledWith(401)
  })

  test('returns 401 when password does not match', async () => {
    const req = { body: { email: 'abi@test.com', password: 'wrongpass' } }
    const res = mockRes()
    User.findOne.mockResolvedValue({
      _id: 'user123',
      matchPassword: jest.fn().mockResolvedValue(false),
    })

    await expect(authUser(req, res)).rejects.toThrow('Invalid email or password')
    expect(res.status).toHaveBeenCalledWith(401)
  })

  test('returns 201 with token on valid credentials', async () => {
    const req = { body: { email: 'abi@test.com', password: 'pass123' } }
    const res = mockRes()
    User.findOne.mockResolvedValue({
      _id: 'user123',
      name: 'Abi',
      email: 'abi@test.com',
      isAdmin: false,
      pic: null,
      matchPassword: jest.fn().mockResolvedValue(true),
    })

    await authUser(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'mock-token', email: 'abi@test.com' })
    )
  })
})
