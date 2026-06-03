/// <reference types="@testing-library/jest-dom" />
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { MemoryRouter } from 'react-router-dom'
import { Login } from '../Authentication/Login'

// vi.mock factories are hoisted before variable declarations, so use vi.hoisted
// to ensure mockLogin is initialised before the factory runs
const mockLogin = vi.hoisted(() => vi.fn())
vi.mock('../services/api', () => ({
  authApi: { login: mockLogin },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockSetUser = vi.fn()
vi.mock('../ChatProvider', () => ({
  useChatContext: () => ({ setUser: mockSetUser }),
}))

const renderLogin = () =>
  render(
    <ChakraProvider>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </ChakraProvider>
  )

describe('Login component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('renders email, password inputs and login button', () => {
    renderLogin()
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  test('does not call API when fields are empty', async () => {
    renderLogin()
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled()
    })
  })

  test('calls login, stores user in localStorage and navigates on success', async () => {
    const fakeUser = { _id: 'u1', name: 'Abi', email: 'abi@test.com', token: 'tok123' }
    mockLogin.mockResolvedValue({ data: fakeUser })

    renderLogin()

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'abi@test.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'pass123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('abi@test.com', 'pass123')
      expect(mockSetUser).toHaveBeenCalledWith(fakeUser)
      expect(localStorage.getItem('userInfo')).toBe(JSON.stringify(fakeUser))
      expect(mockNavigate).toHaveBeenCalledWith('/chats')
    })
  })

  test('does not navigate when API returns an error', async () => {
    mockLogin.mockRejectedValue(new Error('401 Unauthorized'))

    renderLogin()

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'bad@test.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'wrongpass' },
    })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled()
      expect(localStorage.getItem('userInfo')).toBeNull()
    })
  })
})
