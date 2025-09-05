import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'success', 
    message: 'Simple test API is working',
    timestamp: new Date().toISOString()
  })
}

export async function POST() {
  return NextResponse.json({ 
    status: 'success', 
    message: 'Simple test POST is working',
    timestamp: new Date().toISOString()
  })
}
