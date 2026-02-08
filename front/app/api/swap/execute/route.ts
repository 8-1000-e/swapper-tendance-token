import { NextRequest, NextResponse } from 'next/server'

const JUPITER_ULTRA_URL = 'https://api.jup.ag/ultra/v1'

export async function POST(request: NextRequest) {
  const apiKey = process.env.JUPITER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const body = await request.json()
  const { requestId, signedTransaction } = body

  if (!requestId || !signedTransaction) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const res = await fetch(`${JUPITER_ULTRA_URL}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ requestId, signedTransaction }),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }

  return NextResponse.json(data)
}
