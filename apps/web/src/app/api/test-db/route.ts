import { NextRequest, NextResponse } from 'next/server'
import { auditQueries } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test DB API called')
    
    // Get all audits
    const allAudits = auditQueries.getAll.all()
    console.log('📋 All audits from DB:', allAudits)
    
    // Get count
    const countResult = auditQueries.getCount.get()
    console.log('📈 Count result:', countResult)
    
    // Get paginated audits
    const paginatedAudits = auditQueries.getAllWithPagination.all(10, 0)
    console.log('📄 Paginated audits:', paginatedAudits)
    
    return NextResponse.json({
      success: true,
      allAudits,
      count: countResult?.total || 0,
      paginatedAudits,
      message: 'Database test completed'
    })
    
  } catch (error) {
    console.error('❌ Database test error:', error)
    return NextResponse.json(
      { error: 'Database test failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}