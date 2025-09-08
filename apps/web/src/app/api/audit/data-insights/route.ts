import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || '20')
    const toolType = searchParams.get('tool_type') || ''
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    // Calculate offset
    const offset = (page - 1) * perPage

    // Build query
    let whereClause = ''
    const params: any[] = []
    let paramIndex = 1

    if (toolType && toolType !== 'all') {
      whereClause = 'WHERE tool_type = ?'
      params.push(toolType)
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM audits ${whereClause}`
    const countResult = database.prepare(countQuery).get(...params)
    const totalCount = countResult?.total || 0

    // Build sort clause
    const validSortColumns = ['created_at', 'url', 'tool_type', 'performance_score']
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at'
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC'
    const orderClause = `ORDER BY ${sortColumn} ${sortDirection}`

    // Get audits with pagination
    const auditsQuery = `
      SELECT 
        id,
        url,
        tool_type,
        created_at,
        user_id,
        status,
        performance_score,
        seo_score,
        accessibility_score,
        best_practices_score
      FROM audits 
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `
    
    const audits = database.prepare(auditsQuery).all(...params, perPage, offset)

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / perPage)

    return NextResponse.json({
      audits,
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
