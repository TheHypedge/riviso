import { NextRequest, NextResponse } from 'next/server'
import { auditQueries } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId, url, toolType, device } = await request.json()

    if (!url || !toolType) {
      return NextResponse.json(
        { error: 'URL and toolType are required' },
        { status: 400 }
      )
    }

    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    auditQueries.create.run(
      id,
      userId || null,
      url,
      toolType,
      'pending',
      now,
      device || 'mobile'
    )
    
    return NextResponse.json({ auditId: id })
  } catch (error) {
    console.error('Error creating audit record:', error)
    return NextResponse.json(
      { error: 'Failed to create audit record' },
      { status: 500 }
    )
  }
}
