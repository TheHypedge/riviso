import { NextRequest, NextResponse } from 'next/server'
import { auditQueries } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || '20')
    const toolType = searchParams.get('tool_type') || ''
    const sortBy = searchParams.get('sort_by') || 'createdAt'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    // Calculate offset
    const offset = (page - 1) * perPage

    // Get total count
    let totalCount = 0
    if (toolType && toolType !== 'all') {
      const countResult = auditQueries.getCountWithFilters.get(toolType)
      totalCount = countResult?.total || 0
    } else {
      const countResult = auditQueries.getCount.get()
      totalCount = countResult?.total || 0
    }

    // Get audits with pagination
    let audits = []
    if (toolType && toolType !== 'all') {
      audits = auditQueries.getAllWithFilters.all(toolType, perPage, offset)
    } else {
      audits = auditQueries.getAllWithPagination.all(perPage, offset)
    }

    // Transform data to match expected format
    const transformedAudits = audits.map(audit => ({
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

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / perPage)

    return NextResponse.json({
      audits: transformedAudits,
      total_count: totalCount,
      page,
      per_page: perPage,
      total_pages: totalPages
    })

  } catch (error) {
    console.error('Error fetching audit data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit data' },
      { status: 500 }
    )
  }
}
