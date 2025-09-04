import path from 'path'

// Check if we're in a build environment or if better-sqlite3 is available
let Database: any
let db: any

try {
  Database = require('better-sqlite3')
  // Create database file in the project root
  const dbPath = path.join(process.cwd(), 'seo_audit.db')
  db = new Database(dbPath)
  console.log('✅ Database initialized successfully')
} catch (error) {
  console.log('❌ better-sqlite3 not available, using fallback mode:', error instanceof Error ? error.message : String(error))
  // Fallback mode for build environments
  db = null
}

// Initialize database only if available
if (db) {
  // Enable foreign keys
  db.pragma('foreign_keys = ON')

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      plan TEXT NOT NULL DEFAULT 'free',
      auditsUsed INTEGER NOT NULL DEFAULT 0,
      auditsLimit INTEGER NOT NULL DEFAULT 5,
      createdAt TEXT NOT NULL,
      lastLogin TEXT
    )
  `)

  // Create audits table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audits (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      completedAt TEXT,
      score INTEGER,
      device TEXT NOT NULL DEFAULT 'mobile',
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `)
}

// In-memory user store for production (when SQLite is not available)
const inMemoryUsers = new Map<string, any>()

// Initialize SUPER_ADMIN account in memory
const initializeSuperAdmin = () => {
  const bcrypt = require('bcryptjs')
  const hashedPassword = bcrypt.hashSync('Admin@2025', 12)
  
  inMemoryUsers.set('iamakhileshsoni@gmail.com', {
    id: '1',
    firstName: 'Akhilesh',
    lastName: 'Soni',
    email: 'iamakhileshsoni@gmail.com',
    password: hashedPassword,
    role: 'super_admin',
    plan: 'enterprise',
    auditsUsed: 0,
    auditsLimit: -1,
    createdAt: new Date().toISOString(),
    lastLogin: null
  })
  
  console.log('✅ SUPER_ADMIN account initialized in memory')
}

// Initialize SUPER_ADMIN if not already done
if (!inMemoryUsers.has('iamakhileshsoni@gmail.com')) {
  initializeSuperAdmin()
}

// Prepared statements for better performance (with fallbacks)
export const userQueries = db ? {
  create: db.prepare(`
    INSERT INTO users (id, firstName, lastName, email, password, role, plan, auditsUsed, auditsLimit, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  
  findByEmail: db.prepare(`
    SELECT * FROM users WHERE email = ?
  `),
  
  findById: db.prepare(`
    SELECT * FROM users WHERE id = ?
  `),
  
  updateLastLogin: db.prepare(`
    UPDATE users SET lastLogin = ? WHERE id = ?
  `),
  
  getAll: db.prepare(`
    SELECT id, firstName, lastName, email, role, plan, auditsUsed, auditsLimit, createdAt, lastLogin
    FROM users ORDER BY createdAt DESC
  `),
  
  updateAuditsUsed: db.prepare(`
    UPDATE users SET auditsUsed = ? WHERE id = ?
  `)
} : {
  // Fallback to in-memory store
  create: { 
    run: (id: string, firstName: string, lastName: string, email: string, password: string, role: string, plan: string, auditsUsed: number, auditsLimit: number, createdAt: string) => {
      inMemoryUsers.set(email, {
        id, firstName, lastName, email, password, role, plan, auditsUsed, auditsLimit, createdAt, lastLogin: null
      })
    }
  },
  findByEmail: { 
    get: (email: string) => inMemoryUsers.get(email) || null
  },
  findById: { 
    get: (id: string) => {
      for (const user of inMemoryUsers.values()) {
        if (user.id === id) return user
      }
      return null
    }
  },
  updateLastLogin: { 
    run: (lastLogin: string, id: string) => {
      for (const [email, user] of inMemoryUsers.entries()) {
        if (user.id === id) {
          user.lastLogin = lastLogin
          inMemoryUsers.set(email, user)
          break
        }
      }
    }
  },
  getAll: { 
    all: () => Array.from(inMemoryUsers.values()).map(({ password, ...user }) => user)
  },
  updateAuditsUsed: { 
    run: (auditsUsed: number, id: string) => {
      for (const [email, user] of inMemoryUsers.entries()) {
        if (user.id === id) {
          user.auditsUsed = auditsUsed
          inMemoryUsers.set(email, user)
          break
        }
      }
    }
  }
}

export const auditQueries = db ? {
  create: db.prepare(`
    INSERT INTO audits (id, userId, url, status, createdAt, device)
    VALUES (?, ?, ?, ?, ?, ?)
  `),
  
  findByUserId: db.prepare(`
    SELECT * FROM audits WHERE userId = ? ORDER BY createdAt DESC
  `),
  
  findById: db.prepare(`
    SELECT * FROM audits WHERE id = ?
  `),
  
  updateStatus: db.prepare(`
    UPDATE audits SET status = ?, completedAt = ?, score = ? WHERE id = ?
  `),
  
  getAll: db.prepare(`
    SELECT * FROM audits ORDER BY createdAt DESC
  `),
  
  delete: db.prepare(`
    DELETE FROM audits WHERE id = ?
  `)
} : {
  create: { run: () => {} },
  findByUserId: { all: () => [] },
  findById: { get: () => null },
  updateStatus: { run: () => {} },
  getAll: { all: () => [] },
  delete: { run: () => {} }
}

// Initialize with your SUPER_ADMIN account if it doesn't exist
if (db) {
  try {
    const existingAdmin = userQueries.findByEmail.get('iamakhileshsoni@gmail.com')
    if (!existingAdmin) {
      const bcrypt = require('bcryptjs')
      const hashedPassword = bcrypt.hashSync('Admin@2025', 12)
      
      userQueries.create.run(
        '1', // id
        'Akhilesh', // firstName
        'Soni', // lastName
        'iamakhileshsoni@gmail.com', // email
        hashedPassword, // password
        'super_admin', // role
        'enterprise', // plan
        0, // auditsUsed
        -1, // auditsLimit (unlimited)
        new Date().toISOString() // createdAt
      )
      
      console.log('✅ SUPER_ADMIN account created: iamakhileshsoni@gmail.com')
    }
  } catch (error) {
    // Ignore errors during build time - user might already exist
    console.log('Database initialization skipped during build')
  }
}

export default db
