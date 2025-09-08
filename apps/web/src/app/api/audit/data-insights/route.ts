import { NextRequest, NextResponse } from 'next/server'
import { auditQueries } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Data Insights API called')
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || '20')
    const toolType = searchParams.get('tool_type') || ''
    const sortBy = searchParams.get('sort_by') || 'createdAt'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    console.log('📊 Request params:', { page, perPage, toolType, sortBy, sortOrder })

    // Calculate offset
    const offset = (page - 1) * perPage

    // Get total count
    let totalCount = 0
    if (toolType && toolType !== 'all') {
      const countResult = auditQueries.getCountWithFilters.get(toolType)
      totalCount = countResult?.total || 0
      console.log('📈 Total count with filters:', totalCount)
    } else {
      const countResult = auditQueries.getCount.get()
      totalCount = countResult?.total || 0
      console.log('📈 Total count:', totalCount)
    }

    // Get audits with pagination
    let audits = []
    if (toolType && toolType !== 'all') {
      audits = auditQueries.getAllWithFilters.all(toolType, perPage, offset)
      console.log('🔍 Audits with filters:', audits.length)
    } else {
      audits = auditQueries.getAllWithPagination.all(perPage, offset)
      console.log('🔍 All audits:', audits.length)
    }

    console.log('📋 Raw audits data:', audits)

    // Transform data to match expected format
    const transformedAudits = audits.map((audit: any) => ({
      id: audit.id,
      url: audit.url,
      tool_type: audit.tool_type || 'website_analyzer',
      created_at: audit.createdAt,
      user_id: audit.userId,
      status: audit.status,
      performance_score: audit.performance_score,
      seo_score: audit.seo_score,
      accessibility_score: audit.accessibility_score,
      best_practices_score: audit.best_practices_score
    }))

    console.log('🔄 Transformed audits:', transformedAudits)

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / perPage)

    const response = {
      audits: transformedAudits,
      total_count: totalCount,
      page,
      per_page: perPage,
      total_pages: totalPages
    }

    console.log('📤 Final response:', response)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching audit data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit data' },
      { status: 500 }
    )
  }
}
