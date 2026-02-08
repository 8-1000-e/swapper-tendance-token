export interface OrderParams {
  inputMint: string
  outputMint: string
  amount: string
  taker: string
  receiver?: string
  slippageBps?: number
}

export interface OrderResponse {
  requestId: string
  transaction: string
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  inUsdValue: number
  outUsdValue: number
  priceImpact: number
  swapMode: string
  slippageBps: number
  otherAmountThreshold: string
  feeBps: number
  prioritizationFeeLamports: number
  signatureFeeLamports: number
  rentFeeLamports: number
  gasless: boolean
  routePlan: RoutePlan[]
  expireAt: string
  errorCode?: number
  errorMessage?: string
}

export interface RoutePlan {
  swapInfo: {
    ammKey: string
    label: string
    inputMint: string
    outputMint: string
    inAmount: string
    outAmount: string
    feeAmount: string
    feeMint: string
  }
  percent: number
}

export interface ExecuteResponse {
  status: string
  signature: string
  error?: string
}

export async function getSwapOrder(params: OrderParams): Promise<OrderResponse> {
  const res = await fetch('/api/swap/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.errorMessage || data.error || 'Failed to get quote')
  }

  return data
}

export async function executeSwap(requestId: string, signedTransaction: string): Promise<ExecuteResponse> {
  const res = await fetch('/api/swap/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, signedTransaction }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to execute swap')
  }

  return data
}
