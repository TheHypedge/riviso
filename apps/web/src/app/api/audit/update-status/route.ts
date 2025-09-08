import { NextRequest, NextResponse } from 'next/server'
import { auditQueries } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { auditId, status } = await request.json()

    if (!auditId || !status) {
      return NextResponse.json(
        { error: 'auditId and status are required' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    
    auditQueries.updateStatus.run(status, now, auditId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating audit status:', error)
    return NextResponse.json(
      { error: 'Failed to update audit status' },
      { status: 500 }
    )
  }
}
