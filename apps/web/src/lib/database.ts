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
      userId TEXT,
      url TEXT NOT NULL,
      tool_type TEXT NOT NULL DEFAULT 'website_analyzer',
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      completedAt TEXT,
      performance_score INTEGER,
      seo_score INTEGER,
      accessibility_score INTEGER,
      best_practices_score INTEGER,
      device TEXT NOT NULL DEFAULT 'mobile',
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE SET NULL
    )
  `)

  // Add missing columns if they don't exist (for existing databases)
  try {
    db.exec(`ALTER TABLE audits ADD COLUMN tool_type TEXT DEFAULT 'website_analyzer'`)
  } catch (e) {
    // Column already exists, ignore error
  }
  
  try {
    db.exec(`ALTER TABLE audits ADD COLUMN performance_score INTEGER`)
  } catch (e) {
    // Column already exists, ignore error
  }
  
  try {
    db.exec(`ALTER TABLE audits ADD COLUMN seo_score INTEGER`)
  } catch (e) {
    // Column already exists, ignore error
  }
  
  try {
    db.exec(`ALTER TABLE audits ADD COLUMN accessibility_score INTEGER`)
  } catch (e) {
    // Column already exists, ignore error
  }
  
  try {
    db.exec(`ALTER TABLE audits ADD COLUMN best_practices_score INTEGER`)
  } catch (e) {
    // Column already exists, ignore error
  }
  
  try {
    db.exec(`ALTER TABLE audits ADD COLUMN user_id TEXT`)
  } catch (e) {
    // Column already exists, ignore error
  }

  // Create daily_audit_usage table to track daily audit limits
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_audit_usage (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      date TEXT NOT NULL,
      auditCount INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(userId, date)
    )
  `)
}

// In-memory user store for production (when SQLite is not available)
const inMemoryUsers = new Map<string, any>()

// Persistent storage for production (using a simple file-based approach)
const PRODUCTION_DB_FILE = process.env.PRODUCTION_DB_FILE || '/tmp/riviso_users.json'

// Load users from persistent storage in production
const loadUsersFromFile = () => {
  if (process.env.NODE_ENV === 'production') {
    try {
      const fs = require('fs')
      if (fs.existsSync(PRODUCTION_DB_FILE)) {
        const data = fs.readFileSync(PRODUCTION_DB_FILE, 'utf8')
        const users = JSON.parse(data)
        users.forEach((user: any) => {
          inMemoryUsers.set(user.email, user)
        })
        console.log(`✅ Loaded ${users.length} users from persistent storage`)
      }
    } catch (error) {
      console.log('Could not load users from file:', error)
    }
  }
}

// Save users to persistent storage in production
const saveUsersToFile = () => {
  if (process.env.NODE_ENV === 'production') {
    try {
      const fs = require('fs')
      const users = Array.from(inMemoryUsers.values())
      fs.writeFileSync(PRODUCTION_DB_FILE, JSON.stringify(users, null, 2))
      console.log(`✅ Saved ${users.length} users to persistent storage`)
    } catch (error) {
      console.log('Could not save users to file:', error)
    }
  }
}

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
  
  // Also initialize the test user that was created
  const testUserPassword = bcrypt.hashSync('Admin@2025', 12)
  inMemoryUsers.set('akhilesh@thehypedge.com', {
    id: '1757088320106',
    firstName: 'akhilesh',
    lastName: 'soni',
    email: 'akhilesh@thehypedge.com',
    password: testUserPassword,
    role: 'user',
    plan: 'free',
    auditsUsed: 0,
    auditsLimit: 5,
    createdAt: '2025-09-05T16:05:20.106Z',
    lastLogin: null
  })
  
  console.log('✅ SUPER_ADMIN and test user accounts initialized in memory')
}

// Load users from persistent storage first
loadUsersFromFile()

// Initialize SUPER_ADMIN if not already done
if (!inMemoryUsers.has('iamakhileshsoni@gmail.com')) {
  initializeSuperAdmin()
  saveUsersToFile()
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
      saveUsersToFile()
    }
  },
  findByEmail: { 
    get: (email: string) => inMemoryUsers.get(email) || null
  },
  findById: { 
    get: (id: string) => {
      for (const user of Array.from(inMemoryUsers.values())) {
        if (user.id === id) return user
      }
      return null
    }
  },
  updateLastLogin: { 
    run: (lastLogin: string, id: string) => {
      for (const [email, user] of Array.from(inMemoryUsers.entries())) {
        if (user.id === id) {
          user.lastLogin = lastLogin
          inMemoryUsers.set(email, user)
          saveUsersToFile()
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
      for (const [email, user] of Array.from(inMemoryUsers.entries())) {
        if (user.id === id) {
          user.auditsUsed = auditsUsed
          inMemoryUsers.set(email, user)
          saveUsersToFile()
          break
        }
      }
    }
  }
}

export const auditQueries = db ? {
  create: db.prepare(`
    INSERT INTO audits (id, userId, url, tool_type, status, createdAt, device)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  
  createWithScores: db.prepare(`
    INSERT INTO audits (id, userId, url, tool_type, status, createdAt, completedAt, performance_score, seo_score, accessibility_score, best_practices_score, device)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  
  findByUserId: db.prepare(`
    SELECT * FROM audits WHERE userId = ? ORDER BY createdAt DESC
  `),
  
  findById: db.prepare(`
    SELECT * FROM audits WHERE id = ?
  `),
  
  updateStatus: db.prepare(`
    UPDATE audits SET status = ?, completedAt = ? WHERE id = ?
  `),
  
  updateWithScores: db.prepare(`
    UPDATE audits SET status = ?, completedAt = ?, performance_score = ?, seo_score = ?, accessibility_score = ?, best_practices_score = ? WHERE id = ?
  `),
  
  getAll: db.prepare(`
    SELECT * FROM audits ORDER BY createdAt DESC
  `),
  
  getAllWithPagination: db.prepare(`
    SELECT 
      id,
      userId,
      url,
      tool_type,
      status,
      createdAt,
      completedAt,
      performance_score,
      seo_score,
      accessibility_score,
      best_practices_score
    FROM audits 
    ORDER BY createdAt DESC 
    LIMIT ? OFFSET ?
  `),
  
  getAllWithFilters: db.prepare(`
    SELECT 
      id,
      userId,
      url,
      tool_type,
      status,
      createdAt,
      completedAt,
      performance_score,
      seo_score,
      accessibility_score,
      best_practices_score
    FROM audits 
    WHERE tool_type = ?
    ORDER BY createdAt DESC 
    LIMIT ? OFFSET ?
  `),
  
  getCount: db.prepare(`
    SELECT COUNT(*) as total FROM audits
  `),
  
  getCountWithFilters: db.prepare(`
    SELECT COUNT(*) as total FROM audits WHERE tool_type = ?
  `),
  
  delete: db.prepare(`
    DELETE FROM audits WHERE id = ?
  `)
} : {
  create: { run: () => {} },
  createWithScores: { run: () => {} },
  findByUserId: { all: () => [] },
  findById: { get: () => null },
  updateStatus: { run: () => {} },
  updateWithScores: { run: () => {} },
  getAll: { all: () => [] },
  getAllWithPagination: { all: () => [] },
  getAllWithFilters: { all: () => [] },
  getCount: { get: () => ({ total: 0 }) },
  getCountWithFilters: { get: () => ({ total: 0 }) },
  delete: { run: () => {} }
}

export const dailyAuditUsageQueries = db ? {
  create: db.prepare(`
    INSERT INTO daily_audit_usage (id, userId, date, auditCount, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `),
  
  findByUserAndDate: db.prepare(`
    SELECT * FROM daily_audit_usage WHERE userId = ? AND date = ?
  `),
  
  incrementAuditCount: db.prepare(`
    UPDATE daily_audit_usage SET auditCount = auditCount + 1, updatedAt = ? WHERE userId = ? AND date = ?
  `),
  
  getTodayUsage: db.prepare(`
    SELECT auditCount FROM daily_audit_usage WHERE userId = ? AND date = ?
  `),
  
  resetDailyUsage: db.prepare(`
    DELETE FROM daily_audit_usage WHERE date < ?
  `)
} : {
  create: { run: () => {} },
  findByUserAndDate: { get: () => null },
  incrementAuditCount: { run: () => {} },
  getTodayUsage: { get: () => null },
  resetDailyUsage: { run: () => {} }
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
