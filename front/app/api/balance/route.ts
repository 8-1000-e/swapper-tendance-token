import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

const SOL_MINT = 'So11111111111111111111111111111111111111112'
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
const connection = new Connection(RPC_URL, 'confirmed')

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { owner, mints } = body as { owner: string; mints: string[] }

  if (!owner || !mints || !Array.isArray(mints)) {
    return NextResponse.json({ error: 'Missing owner or mints' }, { status: 400 })
  }

  const ownerPubkey = new PublicKey(owner)
  const balances: Record<string, number> = {}

  const results = await Promise.allSettled(
    mints.map(async (mint) => {
      if (mint === SOL_MINT) {
        const lamports = await connection.getBalance(ownerPubkey)
        return { mint, balance: lamports / LAMPORTS_PER_SOL }
      }

      const accounts = await connection.getParsedTokenAccountsByOwner(
        ownerPubkey,
        { mint: new PublicKey(mint) }
      )

      if (accounts.value.length > 0) {
        const parsed = accounts.value[0].account.data.parsed?.info
        return { mint, balance: parsed?.tokenAmount?.uiAmount ?? 0 }
      }

      return { mint, balance: 0 }
    })
  )

  for (const result of results) {
    if (result.status === 'fulfilled') {
      balances[result.value.mint] = result.value.balance
    }
  }

  return NextResponse.json({ balances })
}
