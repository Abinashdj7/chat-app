import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import { Login } from '../Authentication/Login'

// --- mocks ---------------------------------------------------------------

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockSetUser = vi.fn()
vi.mock('../ChatProvider', () => ({
  useChatContext: () => ({ setUser: mockSetUser }),
}))

// silence window.location.reload in jsdom
Object.defineProperty(window, 'location', {
  value: { reload: vi.fn() },
  writable: true,
})

// --- helpers -------------------------------------------------------------

const renderLogin = () =>
  render(
    <ChakraProvider>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </ChakraProvider>
  )

// --- tests ---------------------------------------------------------------

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

  test('shows warning toast and does not call API when fields are empty', async () => {
    renderLogin()
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(mockedAxios.post).not.toHaveBeenCalled()
    })
  })

  test('calls API, stores user in localStorage and navigates on successful login', async () => {
    const fakeUser = { _id: 'u1', name: 'Abi', email: 'abi@test.com', token: 'tok123' }
    mockedAxios.post = vi.fn().mockResolvedValue({ data: fakeUser })

    renderLogin()

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'abi@test.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'pass123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5050/api/users/login',
        { email: 'abi@test.com', password: 'pass123' },
        expect.any(Object)
      )
      expect(mockSetUser).toHaveBeenCalledWith(fakeUser)
      expect(localStorage.getItem('userInfo')).toBe(JSON.stringify(fakeUser))
      expect(mockNavigate).toHaveBeenCalledWith('/chats')
    })
  })

  test('does not navigate when API returns an error', async () => {
    mockedAxios.post = vi.fn().mockRejectedValue(new Error('401 Unauthorized'))

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
