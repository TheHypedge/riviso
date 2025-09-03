import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendWelcomeEmail } from '../emailService'
import { userQueries } from '../../../../lib/database'
import { UserRole } from '../../../../lib/roles'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await request.json()

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = userQueries.findByEmail.get(email)
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Determine user role - make iamakhileshsoni@gmail.com SUPER_ADMIN
    const userRole = email === 'iamakhileshsoni@gmail.com' ? UserRole.SUPER_ADMIN : UserRole.USER
    
    // Create user in database
    const userId = Date.now().toString()
    const createdAt = new Date().toISOString()
    
    userQueries.create.run(
      userId,
      firstName,
      lastName,
      email,
      hashedPassword,
      userRole,
      'free',
      0,
      5,
      createdAt
    )

    // Create user object for response
    const newUser = {
      id: userId,
      firstName,
      lastName,
      email,
      createdAt,
      plan: 'free' as const,
      auditsUsed: 0,
      auditsLimit: 5,
      role: userRole
    }

    // Send welcome email
    try {
      await sendWelcomeEmail({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email
      })
      console.log('Welcome email sent successfully to:', newUser.email)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the signup if email fails
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // Return user data (password is not included in newUser object)
    const userWithoutPassword = newUser

    return NextResponse.json({
      message: 'Account created successfully. Welcome email sent!',
      user: userWithoutPassword,
      token
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
