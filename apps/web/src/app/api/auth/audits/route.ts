import { NextRequest, NextResponse } from 'next/server'
import { audits } from '../audits'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get audits for the specific user
    const userAudits = audits.filter(audit => audit.userId === userId)
    
    // Sort by creation date (newest first)
    userAudits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      audits: userAudits,
      total: userAudits.length
    })

  } catch (error) {
    console.error('Get audits error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, url, device = 'mobile' } = await request.json()

    if (!userId || !url) {
      return NextResponse.json(
        { message: 'User ID and URL are required' },
        { status: 400 }
      )
    }

    // Create new audit
    const newAudit = {
      id: Date.now().toString(),
      userId,
      url,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      device
    }

    audits.push(newAudit)

    return NextResponse.json({
      message: 'Audit created successfully',
      audit: newAudit
    }, { status: 201 })

  } catch (error) {
    console.error('Create audit error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
