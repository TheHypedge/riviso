import { NextRequest, NextResponse } from 'next/server'
import { auditQueries } from '../../../../lib/database'

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
    const userAudits = auditQueries.findByUserId.all(userId)
    
    // Sort by creation date (newest first)
    userAudits.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

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

    // Create new audit in database
    const auditId = Date.now().toString()
    const createdAt = new Date().toISOString()
    
    auditQueries.create.run(
      auditId,
      userId,
      url,
      'pending',
      createdAt,
      device
    )

    const newAudit = {
      id: auditId,
      userId,
      url,
      status: 'pending' as const,
      createdAt,
      device
    }

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

export async function PUT(request: NextRequest) {
  try {
    const { auditId, userId, status, completedAt } = await request.json()

    if (!auditId || !userId || !status) {
      return NextResponse.json(
        { message: 'Audit ID, User ID, and status are required' },
        { status: 400 }
      )
    }

    // Find and update the audit
    const audit = auditQueries.findById.get(auditId) as any
    
    if (!audit || audit.userId !== userId) {
      return NextResponse.json(
        { message: 'Audit not found' },
        { status: 404 }
      )
    }

    auditQueries.updateStatus.run(
      status,
      completedAt || new Date().toISOString(),
      null, // score (can be updated later)
      auditId
    )

    return NextResponse.json({
      message: 'Audit status updated successfully',
      audit: {
        ...audit,
        status: status as 'completed' | 'failed',
        completedAt: completedAt || new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Update audit error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
