import { NextRequest, NextResponse } from 'next/server'
import { getAuditUsageStats } from '../../../../lib/auditLimits'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { detail: 'User ID is required' },
        { status: 400 }
      )
    }
    
    const usageStats = getAuditUsageStats(userId)
    
    return NextResponse.json(usageStats)
  } catch (error) {
    console.error('Error getting audit usage stats:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}

