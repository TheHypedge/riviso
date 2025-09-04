import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { userQueries } from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if database is available
    if (!userQueries.findByEmail) {
      console.error('Database not available - userQueries.findByEmail is null')
      return NextResponse.json(
        { message: 'Database not available. Please try again later.' },
        { status: 500 }
      )
    }

    // Ensure SUPER_ADMIN account exists (for production environments)
    if (email === 'iamakhileshsoni@gmail.com') {
      const existingAdmin = userQueries.findByEmail.get(email)
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('Admin@2025', 12)
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
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

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
