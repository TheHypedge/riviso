import { NextRequest, NextResponse } from 'next/server'
import { auditQueries } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { auditId, scores, status } = await request.json()

    if (!auditId || !status) {
      return NextResponse.json(
        { error: 'auditId and status are required' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    
    auditQueries.updateWithScores.run(
      status,
      now,
      scores.performanceScore || null,
      scores.seoScore || null,
      scores.accessibilityScore || null,
      scores.bestPracticesScore || null,
      auditId
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating audit with scores:', error)
    return NextResponse.json(
      { error: 'Failed to update audit record' },
      { status: 500 }
    )
  }
}
