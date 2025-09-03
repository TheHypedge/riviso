import path from 'path'

// Check if we're in a build environment or if better-sqlite3 is available
let Database: any
let db: any

try {
  Database = require('better-sqlite3')
  // Create database file in the project root
  const dbPath = path.join(process.cwd(), 'seo_audit.db')
  db = new Database(dbPath)
} catch (error) {
  console.log('better-sqlite3 not available, using fallback mode')
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
  create: { run: () => {} },
  findByEmail: { get: () => null },
  findById: { get: () => null },
  updateLastLogin: { run: () => {} },
  getAll: { all: () => [] },
  updateAuditsUsed: { run: () => {} }
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
