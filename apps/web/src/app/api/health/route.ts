import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if audit API is reachable
    const auditApiUrl = process.env.AUDIT_API_URL || 'http://localhost:8000'
    const auditApiHealth = await fetch(`${auditApiUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000),
    }).catch(() => null)

    const isAuditApiHealthy = auditApiHealth?.ok || false

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        web: {
          status: 'healthy',
          version: process.env.npm_package_version || '1.0.0',
        },
        audit_api: {
          status: isAuditApiHealthy ? 'healthy' : 'unhealthy',
          url: auditApiUrl,
        },
      },
      environment: process.env.NODE_ENV || 'development',
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
