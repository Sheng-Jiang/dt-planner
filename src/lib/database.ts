import { promises as fs } from 'fs'
import path from 'path'
import { UserRecord } from '@/types/auth'

/**
 * Database structure for user storage
 */
interface Database {
  users: UserRecord[]
}

const DB_PATH = path.join(process.cwd(), 'data', 'users.json')

/**
 * Ensures the data directory and database file exist
 */
async function ensureDatabase(): Promise<void> {
  try {
    const dataDir = path.dirname(DB_PATH)
    await fs.mkdir(dataDir, { recursive: true })

    // Check if database file exists
    try {
      await fs.access(DB_PATH)
    } catch {
      // File doesn't exist, create it with empty structure
      const initialData: Database = { users: [] }
      await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2))
    }
  } catch (error) {
    throw new Error(`Failed to initialize database: ${error}`)
  }
}

/**
 * Reads the database file and returns parsed data
 */
async function readDatabase(): Promise<Database> {
  try {
    await ensureDatabase()
    const data = await fs.readFile(DB_PATH, 'utf-8')
    return JSON.parse(data) as Database
  } catch (error) {
    throw new Error(`Failed to read database: ${error}`)
  }
}

/**
 * Writes data to the database file atomically
 */
async function writeDatabase(data: Database): Promise<void> {
  try {
    await ensureDatabase()
    const tempPath = `${DB_PATH}.tmp`

    // Write to temporary file first
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2))

    // Atomically move temp file to actual database file
    await fs.rename(tempPath, DB_PATH)
  } catch (error) {
    throw new Error(`Failed to write database: ${error}`)
  }
}

export { readDatabase, writeDatabase, ensureDatabase }
export type { Database }
