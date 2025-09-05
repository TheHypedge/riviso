import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'success', 
    message: 'API route is working',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ 
    status: 'success', 
    message: 'POST method is working',
    receivedData: body,
    timestamp: new Date().toISOString()
  })
}
