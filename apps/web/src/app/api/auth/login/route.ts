import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { userQueries } from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('=== LOGIN API CALLED ===')
    const { email, password } = await request.json()
    console.log('Request data:', { email, password: password ? '***' : 'missing' })

    // Validation
    if (!email || !password) {
      console.log('Validation failed: missing email or password')
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if database is available
    console.log('Database check:', { 
      userQueriesExists: !!userQueries, 
      findByEmailExists: !!userQueries.findByEmail,
      findByEmailType: typeof userQueries.findByEmail
    })
    
    if (!userQueries.findByEmail) {
      console.error('Database not available - userQueries.findByEmail is null')
      return NextResponse.json(
        { message: 'Database not available. Please try again later.' },
        { status: 500 }
      )
    }

    // Ensure SUPER_ADMIN account exists (for production environments)
    if (email === 'iamakhileshsoni@gmail.com') {
      console.log('Checking for SUPER_ADMIN account...')
      const existingAdmin = userQueries.findByEmail.get(email)
      console.log('Existing admin check:', { existingAdmin: !!existingAdmin })
      
      if (!existingAdmin) {
        console.log('Creating SUPER_ADMIN account...')
        try {
          const hashedPassword = await bcrypt.hash('Admin@2025', 12)
          console.log('Password hashed successfully')
          
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
          console.log('✅ SUPER_ADMIN account created during login: iamakhileshsoni@gmail.com')
        } catch (createError) {
          console.error('Error creating SUPER_ADMIN account:', createError)
        }
      } else {
        console.log('SUPER_ADMIN account already exists')
      }
    }

    // Find user in database
    const user = userQueries.findByEmail.get(email) as any
    console.log('Login attempt for:', email, 'User found:', !!user)
    
    if (!user) {
      console.log('User not found in database')
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    console.log('Verifying password...', { 
      providedPassword: password, 
      storedPasswordHash: user.password ? '***' : 'null',
      passwordLength: password.length 
    })
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log('Password verification result:', isValidPassword)
    
    if (!isValidPassword) {
      console.log('Password verification failed')
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Update last login
    userQueries.updateLastLogin.run(new Date().toISOString(), user.id)

    // Generate JWT token
    console.log('Generating JWT token...', { 
      userId: user.id, 
      email: user.email,
      jwtSecretExists: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
    })
    
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )
    console.log('JWT token generated successfully')

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
