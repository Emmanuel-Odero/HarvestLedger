// API proxy routes for Vercel deployment
// This file is excluded during Docker builds via the build script

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'DELETE')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PATCH')
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/')
    const url = `${BACKEND_URL}/${path}`
    
    // Get the request body if it exists
    let body: string | undefined
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text()
      } catch {
        // No body or already consumed
      }
    }
    
    // Forward headers (excluding host and other problematic headers)
    const headers = new Headers()
    request.headers.forEach((value, key) => {
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers.set(key, value)
      }
    })
    
    // Add CORS headers
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    const response = await fetch(url, {
      method,
      headers,
      body,
    })
    
    // Get response data
    const responseData = await response.text()
    
    // Create response with original status and headers
    const proxyResponse = new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
    })
    
    // Copy response headers
    response.headers.forEach((value, key) => {
      proxyResponse.headers.set(key, value)
    })
    
    // Ensure CORS headers are set
    proxyResponse.headers.set('Access-Control-Allow-Origin', '*')
    proxyResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    proxyResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return proxyResponse
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}