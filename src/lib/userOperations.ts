import { v4 as uuidv4 } from 'uuid'
import { UserRecord, User } from '@/types/auth'
import { readDatabase, writeDatabase } from './database'

/**
 * Creates a new user in the database
 */
export async function createUser(email: string, passwordHash: string): Promise<User> {
  const db = await readDatabase()

  // Check if user already exists
  const existingUser = db.users.find(user => user.email === email)
  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  const now = new Date().toISOString()
  const newUser: UserRecord = {
    id: uuidv4(),
    email,
    passwordHash,
    createdAt: now,
    lastLoginAt: now,
  }

  db.users.push(newUser)
  await writeDatabase(db)

  // Return user without password hash
  const { passwordHash: _, ...userWithoutPassword } = newUser
  return userWithoutPassword
}

/**
 * Updates an existing user in the database
 */
export async function updateUser(id: string, updates: Partial<UserRecord>): Promise<User | null> {
  const db = await readDatabase()

  const userIndex = db.users.findIndex(user => user.id === id)
  if (userIndex === -1) {
    return null
  }

  // Update user with provided fields
  db.users[userIndex] = { ...db.users[userIndex], ...updates }
  await writeDatabase(db)

  // Return user without password hash
  const { passwordHash: _, ...userWithoutPassword } = db.users[userIndex]
  return userWithoutPassword
}

/**
 * Deletes a user from the database
 */
export async function deleteUser(id: string): Promise<boolean> {
  const db = await readDatabase()

  const userIndex = db.users.findIndex(user => user.id === id)
  if (userIndex === -1) {
    return false
  }

  db.users.splice(userIndex, 1)
  await writeDatabase(db)
  return true
}

/**
 * Gets all users from the database (without password hashes)
 */
export async function getAllUsers(): Promise<User[]> {
  const db = await readDatabase()

  return db.users.map(({ passwordHash: _, ...user }) => user)
} /**

 * Finds a user by email address
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await readDatabase()

  const user = db.users.find(user => user.email === email)
  if (!user) {
    return null
  }

  // Return user without password hash
  const { passwordHash: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

/**
 * Finds a user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const db = await readDatabase()

  const user = db.users.find(user => user.id === id)
  if (!user) {
    return null
  }

  // Return user without password hash
  const { passwordHash: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

/**
 * Gets a user record with password hash by email (for authentication)
 */
export async function getUserRecordByEmail(email: string): Promise<UserRecord | null> {
  const db = await readDatabase()

  const user = db.users.find(user => user.email === email)
  return user || null
}

/**
 * Gets a user record with password hash by ID (for authentication)
 */
export async function getUserRecordById(id: string): Promise<UserRecord | null> {
  const db = await readDatabase()

  const user = db.users.find(user => user.id === id)
  return user || null
}

/**
 * Updates user's last login timestamp
 */
export async function updateLastLogin(id: string): Promise<void> {
  const db = await readDatabase()

  const userIndex = db.users.findIndex(user => user.id === id)
  if (userIndex !== -1) {
    db.users[userIndex].lastLoginAt = new Date().toISOString()
    await writeDatabase(db)
  }
}

/**
 * Sets password reset token for a user
 */
export async function setResetToken(
  email: string,
  token: string,
  expiry: string
): Promise<boolean> {
  const db = await readDatabase()

  const userIndex = db.users.findIndex(user => user.email === email)
  if (userIndex === -1) {
    return false
  }

  db.users[userIndex].resetToken = token
  db.users[userIndex].resetTokenExpiry = expiry
  await writeDatabase(db)
  return true
}

/**
 * Clears password reset token for a user
 */
export async function clearResetToken(email: string): Promise<boolean> {
  const db = await readDatabase()

  const userIndex = db.users.findIndex(user => user.email === email)
  if (userIndex === -1) {
    return false
  }

  delete db.users[userIndex].resetToken
  delete db.users[userIndex].resetTokenExpiry
  await writeDatabase(db)
  return true
}

/**
 * Finds a user by reset token
 */
export async function getUserByResetToken(token: string): Promise<UserRecord | null> {
  const db = await readDatabase()

  const user = db.users.find(user => user.resetToken === token)
  if (!user || !user.resetTokenExpiry) {
    return null
  }

  // Check if token is expired
  const expiry = new Date(user.resetTokenExpiry)
  const now = new Date()

  if (now > expiry) {
    // Token is expired, clear it
    await clearResetToken(user.email)
    return null
  }

  return user
}
