import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auditId = params.id
    
    if (!auditId) {
      return NextResponse.json(
        { error: 'Audit ID is required' },
        { status: 400 }
      )
    }

    // Get the backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://riviso.onrender.com'
    
    // Call the backend API to get performance metrics
    const response = await fetch(`${backendUrl}/audits/${auditId}/performance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.detail || 'Failed to get performance metrics' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
