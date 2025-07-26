import { promises as fs } from 'fs'
import path from 'path'
import {
  createUser,
  getUserByEmail,
  getUserById,
  getUserRecordByEmail,
  updateUser,
  deleteUser,
  setResetToken,
  getUserByResetToken,
  clearResetToken,
} from '../userOperations'

// Mock the database path to use a test database
const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test-users.json')

// Mock the database module to use test database
jest.mock('../database', () => {
  const originalModule = jest.requireActual('../database')
  return {
    ...originalModule,
    readDatabase: jest.fn().mockImplementation(async () => {
      try {
        const data = await fs.readFile(TEST_DB_PATH, 'utf-8')
        return JSON.parse(data)
      } catch {
        return { users: [] }
      }
    }),
    writeDatabase: jest.fn().mockImplementation(async data => {
      const dataDir = path.dirname(TEST_DB_PATH)
      await fs.mkdir(dataDir, { recursive: true })
      await fs.writeFile(TEST_DB_PATH, JSON.stringify(data, null, 2))
    }),
    ensureDatabase: jest.fn().mockImplementation(async () => {
      const dataDir = path.dirname(TEST_DB_PATH)
      await fs.mkdir(dataDir, { recursive: true })
      try {
        await fs.access(TEST_DB_PATH)
      } catch {
        await fs.writeFile(TEST_DB_PATH, JSON.stringify({ users: [] }, null, 2))
      }
    }),
  }
})

describe('User Operations', () => {
  beforeEach(async () => {
    // Clean up test database before each test
    try {
      await fs.unlink(TEST_DB_PATH)
    } catch {
      // File doesn't exist, that's fine
    }
  })

  afterAll(async () => {
    // Clean up test database after all tests
    try {
      await fs.unlink(TEST_DB_PATH)
    } catch {
      // File doesn't exist, that's fine
    }
  })

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const email = 'test@example.com'
      const passwordHash = 'hashedpassword123'

      const user = await createUser(email, passwordHash)

      expect(user).toHaveProperty('id')
      expect(user.email).toBe(email)
      expect(user).toHaveProperty('createdAt')
      expect(user).toHaveProperty('lastLoginAt')
      expect(user).not.toHaveProperty('passwordHash')
    })

    it('should throw error if user already exists', async () => {
      const email = 'test@example.com'
      const passwordHash = 'hashedpassword123'

      await createUser(email, passwordHash)

      await expect(createUser(email, passwordHash)).rejects.toThrow(
        'User with this email already exists'
      )
    })
  })

  describe('getUserByEmail', () => {
    it('should return user without password hash', async () => {
      const email = 'test@example.com'
      const passwordHash = 'hashedpassword123'

      await createUser(email, passwordHash)
      const user = await getUserByEmail(email)

      expect(user).not.toBeNull()
      expect(user!.email).toBe(email)
      expect(user).not.toHaveProperty('passwordHash')
    })

    it('should return null for non-existent user', async () => {
      const user = await getUserByEmail('nonexistent@example.com')
      expect(user).toBeNull()
    })
  })

  describe('getUserRecordByEmail', () => {
    it('should return user record with password hash', async () => {
      const email = 'test@example.com'
      const passwordHash = 'hashedpassword123'

      await createUser(email, passwordHash)
      const userRecord = await getUserRecordByEmail(email)

      expect(userRecord).not.toBeNull()
      expect(userRecord!.email).toBe(email)
      expect(userRecord!.passwordHash).toBe(passwordHash)
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const email = 'test@example.com'
      const passwordHash = 'hashedpassword123'

      const user = await createUser(email, passwordHash)
      const updatedUser = await updateUser(user.id, {
        lastLoginAt: '2024-01-01T00:00:00.000Z',
      })

      expect(updatedUser).not.toBeNull()
      expect(updatedUser!.lastLoginAt).toBe('2024-01-01T00:00:00.000Z')
    })

    it('should return null for non-existent user', async () => {
      const result = await updateUser('nonexistent-id', { lastLoginAt: '2024-01-01T00:00:00.000Z' })
      expect(result).toBeNull()
    })
  })

  describe('reset token operations', () => {
    it('should set and retrieve reset token', async () => {
      const email = 'test@example.com'
      const passwordHash = 'hashedpassword123'
      const token = 'reset-token-123'
      const expiry = new Date(Date.now() + 3600000).toISOString() // 1 hour from now

      await createUser(email, passwordHash)
      const success = await setResetToken(email, token, expiry)
      expect(success).toBe(true)

      const userWithToken = await getUserByResetToken(token)
      expect(userWithToken).not.toBeNull()
      expect(userWithToken!.email).toBe(email)
      expect(userWithToken!.resetToken).toBe(token)
    })

    it('should return null for expired reset token', async () => {
      const email = 'test@example.com'
      const passwordHash = 'hashedpassword123'
      const token = 'reset-token-123'
      const expiry = new Date(Date.now() - 3600000).toISOString() // 1 hour ago (expired)

      await createUser(email, passwordHash)
      await setResetToken(email, token, expiry)

      const userWithToken = await getUserByResetToken(token)
      expect(userWithToken).toBeNull()
    })

    it('should clear reset token', async () => {
      const email = 'test@example.com'
      const passwordHash = 'hashedpassword123'
      const token = 'reset-token-123'
      const expiry = new Date(Date.now() + 3600000).toISOString()

      await createUser(email, passwordHash)
      await setResetToken(email, token, expiry)

      const success = await clearResetToken(email)
      expect(success).toBe(true)

      const userRecord = await getUserRecordByEmail(email)
      expect(userRecord!.resetToken).toBeUndefined()
      expect(userRecord!.resetTokenExpiry).toBeUndefined()
    })
  })

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const email = 'test@example.com'
      const passwordHash = 'hashedpassword123'

      const user = await createUser(email, passwordHash)
      const success = await deleteUser(user.id)
      expect(success).toBe(true)

      const deletedUser = await getUserById(user.id)
      expect(deletedUser).toBeNull()
    })

    it('should return false for non-existent user', async () => {
      const success = await deleteUser('nonexistent-id')
      expect(success).toBe(false)
    })
  })
})
