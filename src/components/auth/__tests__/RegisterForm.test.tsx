import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import RegisterForm from '../RegisterForm'

// Mock the AuthContext
const mockRegister = jest.fn()
jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => ({
    login: jest.fn(),
    user: null,
    logout: jest.fn(),
    register: mockRegister,
    resetPassword: jest.fn(),
    updatePassword: jest.fn(),
    isLoading: false,
    error: null,
  }),
}))

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders registration form fields', () => {
    render(<RegisterForm />)

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    render(<RegisterForm />)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument()
    })
  })

  it('shows password strength indicator', async () => {
    render(<RegisterForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    fireEvent.change(passwordInput, { target: { value: 'weak' } })

    await waitFor(() => {
      expect(screen.getByText('Weak')).toBeInTheDocument()
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument()
    })
  })

  it('shows password mismatch error', async () => {
    render(<RegisterForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123!' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('calls register function with valid data', async () => {
    mockRegister.mockResolvedValue(undefined)

    render(<RegisterForm />)

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } })

    // Wait for password strength validation
    await waitFor(() => {
      expect(screen.getByText('Strong')).toBeInTheDocument()
    })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'Password123!', 'Password123!')
    })
  })
})
