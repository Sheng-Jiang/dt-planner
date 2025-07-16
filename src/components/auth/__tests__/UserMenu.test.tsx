import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import UserMenu from '../UserMenu'

// Mock the AuthContext
const mockLogout = jest.fn()
const mockAuthContext = {
  user: null,
  login: jest.fn(),
  logout: mockLogout,
  register: jest.fn(),
  resetPassword: jest.fn(),
  updatePassword: jest.fn(),
  isLoading: false,
  error: null,
}

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}))

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('UserMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mock context to default state
    mockAuthContext.user = null
    mockAuthContext.isLoading = false
    mockAuthContext.error = null
  })

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLoginAt: '2024-01-01T00:00:00.000Z'
  }

  it('should render user email and menu trigger when user is provided', () => {
    mockAuthContext.user = mockUser

    render(<UserMenu />)

    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('T')).toBeInTheDocument() // User initial
  })

  it('should not render when user is null', () => {
    mockAuthContext.user = null

    const { container } = render(<UserMenu />)

    expect(container.firstChild).toBeNull()
  })

  it('should call logout function when logout button is clicked', async () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isLoading = false
    mockLogout.mockResolvedValue(undefined)

    render(<UserMenu />)

    // First click to open the menu
    const menuTrigger = screen.getByRole('button')
    fireEvent.click(menuTrigger)

    // Wait for menu to open and then click logout
    await waitFor(() => {
      expect(screen.getByText('Signed in as')).toBeInTheDocument()
    })

    const logoutButton = screen.getByText(/sign out/i)
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('should show loading state during logout', async () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isLoading = true

    render(<UserMenu />)

    const menuTrigger = screen.getByRole('button')
    expect(menuTrigger).toBeDisabled()
  })

  it('should handle logout errors gracefully', async () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isLoading = false
    mockLogout.mockRejectedValue(new Error('Logout failed'))

    render(<UserMenu />)

    // Open menu and click logout
    const menuTrigger = screen.getByRole('button')
    fireEvent.click(menuTrigger)

    // Wait for menu to open
    await waitFor(() => {
      expect(screen.getByText('Signed in as')).toBeInTheDocument()
    })

    const logoutButton = screen.getByText(/sign out/i)
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1)
    })
  })

  it('should display user menu dropdown when clicked', async () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isLoading = false

    render(<UserMenu />)

    // Click the menu trigger
    const menuTrigger = screen.getByRole('button')
    fireEvent.click(menuTrigger)

    // Check if dropdown menu appears
    await waitFor(() => {
      expect(screen.getByText('Signed in as')).toBeInTheDocument()
      expect(screen.getByText(/sign out/i)).toBeInTheDocument()
    })
  })

  it('should show user initials in avatar', () => {
    const userWithLongEmail = {
      ...mockUser,
      email: 'very.long.email.address@example.com'
    }
    mockAuthContext.user = userWithLongEmail

    render(<UserMenu />)

    // Should show the first letter of email as initial
    expect(screen.getByText('V')).toBeInTheDocument()
  })

  it('should show user creation date in dropdown', async () => {
    mockAuthContext.user = mockUser
    mockAuthContext.isLoading = false

    render(<UserMenu />)

    // Open the menu
    const menuTrigger = screen.getByRole('button')
    fireEvent.click(menuTrigger)

    await waitFor(() => {
      expect(screen.getByText(/Member since/)).toBeInTheDocument()
    })
  })
})