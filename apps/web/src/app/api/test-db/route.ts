import { NextRequest, NextResponse } from 'next/server'
import { userQueries } from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DATABASE TEST ENDPOINT ===')
    
    // Check if database is available
    const dbStatus = {
      userQueriesExists: !!userQueries,
      findByEmailExists: !!userQueries.findByEmail,
      findByEmailType: typeof userQueries.findByEmail,
      createExists: !!userQueries.create,
      createType: typeof userQueries.create
    }
    
    console.log('Database status:', dbStatus)
    
    // Try to query the database
    let userCount = 0
    let testUser = null
    
    try {
      if (userQueries.findByEmail) {
        testUser = userQueries.findByEmail.get('iamakhileshsoni@gmail.com')
        console.log('Test user query result:', testUser ? 'Found' : 'Not found')
      }
      
      if (userQueries.getAll) {
        const allUsers = userQueries.getAll.all()
        userCount = allUsers.length
        console.log('Total users in database:', userCount)
      }
    } catch (queryError) {
      console.error('Database query error:', queryError)
    }
    
    return NextResponse.json({
      message: 'Database test completed',
      databaseStatus: dbStatus,
      userCount,
      testUser: testUser ? {
        id: testUser.id,
        email: testUser.email,
        role: testUser.role
      } : null,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        message: 'Database test failed',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
