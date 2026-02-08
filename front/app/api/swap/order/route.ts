import { NextRequest, NextResponse } from 'next/server'

const JUPITER_ULTRA_URL = 'https://api.jup.ag/ultra/v1'

export async function POST(request: NextRequest) {
  const apiKey = process.env.JUPITER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const body = await request.json()
  const { inputMint, outputMint, amount, taker, receiver, slippageBps } = body

  if (!inputMint || !outputMint || !amount || !taker) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount,
    taker,
  })
  if (receiver) params.set('receiver', receiver)
  if (slippageBps) params.set('slippageBps', String(slippageBps))

  const res = await fetch(`${JUPITER_ULTRA_URL}/order?${params}`, {
    headers: { 'x-api-key': apiKey },
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }

  return NextResponse.json(data)
}
