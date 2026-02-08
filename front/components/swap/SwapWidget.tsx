'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { VersionedTransaction } from '@solana/web3.js'
import Card from '@/components/ui/Card'
import AmountInput from './AmountInput'
import SwapDirectionButton from './SwapDirectionButton'
import SwapButton from './SwapButton'
import SlippagePopover from './SlippagePopover'
import ExchangeRate from './ExchangeRate'
import PriceImpact from './PriceImpact'
import RouteInfo from './RouteInfo'
import TokenSelector from './TokenSelector'
import { Token } from '@/types'
import { MOCK_TOKENS } from '@/data/mock'
import { DEFAULT_SLIPPAGE } from '@/lib/constants'
import { getSwapOrder, executeSwap, OrderResponse } from '@/lib/api'

interface SwapWidgetProps {
  initialFromToken?: Token
  initialToToken?: Token
  compact?: boolean
}

export default function SwapWidget({ initialFromToken, initialToToken, compact }: SwapWidgetProps) {
  const defaultFrom = initialFromToken || MOCK_TOKENS.find(t => t.symbol === 'SOL')!
  const defaultTo = initialToToken || MOCK_TOKENS.find(t => t.symbol === 'USDC')!

  const wallet = useWallet()
  const { setVisible } = useWalletModal()
  const SOL_MINT = 'So11111111111111111111111111111111111111112'

  const [tokenFrom, setTokenFrom] = useState<Token>(defaultFrom)
  const [tokenTo, setTokenTo] = useState<Token>(defaultTo)
  const [amountFrom, setAmountFrom] = useState('')
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE)
  const [selectorOpen, setSelectorOpen] = useState<'from' | 'to' | null>(null)

  const [quote, setQuote] = useState<OrderResponse | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState('')
  const [swapping, setSwapping] = useState(false)
  const [swapResult, setSwapResult] = useState<string | null>(null)
  const [balances, setBalances] = useState<Record<string, number>>({})
  const [balanceRefresh, setBalanceRefresh] = useState(0)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const outputAmount = quote
    ? (parseInt(quote.outAmount) / Math.pow(10, tokenTo.decimals)).toFixed(
        tokenTo.decimals >= 6 ? 6 : tokenTo.decimals
      )
    : ''

  const exchangeRate = quote
    ? (parseInt(quote.outAmount) / Math.pow(10, tokenTo.decimals)) /
      (parseInt(quote.inAmount) / Math.pow(10, tokenFrom.decimals))
    : null

  const usdValueFrom = quote ? quote.inUsdValue : 0
  const priceImpact = quote ? Math.abs(quote.priceImpact) : 0
  const minReceived = quote
    ? (parseInt(quote.otherAmountThreshold) / Math.pow(10, tokenTo.decimals)).toFixed(
        tokenTo.decimals >= 6 ? 6 : tokenTo.decimals
      )
    : '0'
  const networkFee = quote
    ? ((quote.signatureFeeLamports + quote.prioritizationFeeLamports) / 1e9)
    : 0

  // USD value after fee: derive SOL price from quote to convert network fee to USD
  const solPriceUsd = quote && tokenFrom.address === SOL_MINT
    ? quote.inUsdValue / (parseInt(quote.inAmount) / 1e9)
    : quote && tokenTo.address === SOL_MINT
      ? quote.outUsdValue / (parseInt(quote.outAmount) / 1e9)
      : MOCK_TOKENS.find(t => t.symbol === 'SOL')?.price ?? 0
  const networkFeeUsd = networkFee * solPriceUsd
  const usdValueTo = quote ? quote.outUsdValue - networkFeeUsd : 0

  const taker = wallet.publicKey?.toBase58()

  // Fetch balances via server-side API route (avoids RPC CORS/403 issues)
  useEffect(() => {
    if (!wallet.publicKey) {
      setBalances({})
      return
    }

    const owner = wallet.publicKey.toBase58()
    const mints = tokenFrom.address === tokenTo.address
      ? [tokenFrom.address]
      : [tokenFrom.address, tokenTo.address]

    const loadBalances = async () => {
      try {
        const res = await fetch('/api/balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ owner, mints }),
        })
        const data = await res.json()

        if (data.balances) {
          setBalances(prev => ({ ...prev, ...data.balances }))
        }
      } catch (err) {
        console.error('[BALANCES] Failed to fetch:', err)
      }
    }

    loadBalances()
  }, [wallet.publicKey, tokenFrom.address, tokenTo.address, balanceRefresh])

  const fetchQuote = useCallback(async (amount: string, from: Token, to: Token, slip: number, takerAddress: string, silent = false) => {
    const input = parseFloat(amount)
    if (!input || input <= 0) {
      setQuote(null)
      setQuoteError('')
      return
    }

    const amountRaw = Math.round(input * Math.pow(10, from.decimals)).toString()
    const slippageBps = Math.round(slip * 100)

    if (!silent) setQuoteLoading(true)
    setQuoteError('')

    try {
      const res = await getSwapOrder({
        inputMint: from.address,
        outputMint: to.address,
        amount: amountRaw,
        taker: takerAddress,
        slippageBps,
      })
      setQuote(res)
    } catch (err: any) {
      if (!silent) setQuote(null)
      setQuoteError(err.message || 'Quote failed')
    } finally {
      if (!silent) setQuoteLoading(false)
    }
  }, [])

  // Debounce on user input change, then poll continuously
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)

    if (!taker) {
      setQuote(null)
      setQuoteError('')
      return
    }

    const input = parseFloat(amountFrom)
    if (!input || input <= 0) {
      setQuote(null)
      setQuoteError('')
      return
    }

    // First fetch after 500ms debounce
    debounceRef.current = setTimeout(() => {
      fetchQuote(amountFrom, tokenFrom, tokenTo, slippage, taker)

      // Then poll continuously every 3s (silent — no loading flash)
      intervalRef.current = setInterval(() => {
        fetchQuote(amountFrom, tokenFrom, tokenTo, slippage, taker, true)
      }, 1000)
    }, 500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [amountFrom, tokenFrom, tokenTo, slippage, taker, fetchQuote])

  const handleFlip = () => {
    setTokenFrom(tokenTo)
    setTokenTo(tokenFrom)
    setAmountFrom(outputAmount)
    setQuote(null)
  }

  const handleSelectToken = (token: Token) => {
    if (selectorOpen === 'from') {
      if (token.address === tokenTo.address) {
        setTokenTo(tokenFrom)
      }
      setTokenFrom(token)
    } else {
      if (token.address === tokenFrom.address) {
        setTokenFrom(tokenTo)
      }
      setTokenTo(token)
    }
  }

  const handleSwap = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) return

    setSwapping(true)
    setSwapResult(null)
    setQuoteError('')

    try {
      // 1. Re-fetch a fresh quote (quotes expire quickly)
      const amountRaw = Math.round(parseFloat(amountFrom) * Math.pow(10, tokenFrom.decimals)).toString()
      const slippageBps = Math.round(slippage * 100)

      const freshQuote = await getSwapOrder({
        inputMint: tokenFrom.address,
        outputMint: tokenTo.address,
        amount: amountRaw,
        taker: wallet.publicKey.toBase58(),
        slippageBps,
      })

      // 2. Deserialize the transaction from base64
      const txBuffer = Buffer.from(freshQuote.transaction, 'base64')
      const transaction = VersionedTransaction.deserialize(txBuffer)

      // 3. Sign via wallet adapter (triggers wallet popup)
      const signedTx = await wallet.signTransaction(transaction)

      // 4. Serialize the signed transaction to base64
      const signedTxBase64 = Buffer.from(signedTx.serialize()).toString('base64')

      // 5. Send signed TX to Jupiter for execution
      const result = await executeSwap(freshQuote.requestId, signedTxBase64)

      // 6. Show the on-chain signature
      setSwapResult(result.signature)
      setQuote(null)
      setAmountFrom('')

      // 7. Refresh balances after swap
      setBalanceRefresh(n => n + 1)
    } catch (err: any) {
      setQuoteError(err.message || 'Swap failed')
    } finally {
      setSwapping(false)
    }
  }

  const walletConnected = !!wallet.publicKey
  const hasAmount = parseFloat(amountFrom) > 0
  const canSwap = walletConnected && hasAmount && !!quote && !swapping

  const getButtonLabel = () => {
    if (!walletConnected) return 'Connect Wallet'
    if (!hasAmount) return 'Enter amount'
    return 'Swap'
  }

  const handleButtonClick = () => {
    if (!walletConnected) {
      setVisible(true)
      return
    }
    if (canSwap) {
      handleSwap()
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          glow={!compact}
          className={compact ? 'p-4' : 'p-5 w-full max-w-[460px] mx-auto'}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={compact ? 'text-base font-bold' : 'text-lg font-bold'}>
              {compact ? 'Quick Swap' : 'Swap'}
            </h2>
            <SlippagePopover slippage={slippage} onSlippageChange={setSlippage} />
          </div>

          <div className="space-y-1">
            <AmountInput
              label="You pay"
              token={tokenFrom}
              amount={amountFrom}
              onAmountChange={setAmountFrom}
              onTokenClick={() => setSelectorOpen('from')}
              usdValue={usdValueFrom}
              balance={walletConnected ? (balances[tokenFrom.address] ?? null) : null}
              onMaxClick={() => {
                const bal = balances[tokenFrom.address]
                if (bal && bal > 0) {
                  // Leave a small SOL reserve for fees if paying with SOL
                  const max = tokenFrom.address === SOL_MINT
                    ? Math.max(0, bal - 0.01)
                    : bal
                  setAmountFrom(max.toString())
                }
              }}
            />

            <SwapDirectionButton onClick={handleFlip} />

            <AmountInput
              label="You receive"
              token={tokenTo}
              amount={quoteLoading ? '...' : outputAmount}
              onTokenClick={() => setSelectorOpen('to')}
              readOnly
              usdValue={usdValueTo}
              balance={walletConnected ? (balances[tokenTo.address] ?? null) : null}
            />
          </div>

          {quoteError && (
            <p className="mt-2 text-xs text-red-400">{quoteError}</p>
          )}

          {swapResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
            >
              <p className="text-xs text-green-400 font-medium mb-1">Swap successful!</p>
              <a
                href={`https://solscan.io/tx/${swapResult}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-300 hover:text-green-200 underline font-mono break-all"
              >
                {swapResult}
              </a>
            </motion.div>
          )}

          {canSwap && quote && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 space-y-2 pt-3 border-t border-border"
            >
              <ExchangeRate tokenFrom={tokenFrom} tokenTo={tokenTo} rate={exchangeRate} />
              <PriceImpact impact={priceImpact} />
              <RouteInfo routePlan={quote.routePlan} />
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Min. received</span>
                <span className="font-mono text-gray-400">
                  {minReceived} {tokenTo.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Network fee</span>
                <span className="font-mono text-gray-400">
                  ~{networkFee.toFixed(6)} SOL
                </span>
              </div>
            </motion.div>
          )}

          <div className="mt-4">
            <SwapButton
              disabled={!canSwap}
              loading={quoteLoading || swapping}
              onClick={handleButtonClick}
              label={getButtonLabel()}
            />
          </div>
        </Card>
      </motion.div>

      <TokenSelector
        isOpen={selectorOpen !== null}
        onClose={() => setSelectorOpen(null)}
        onSelect={handleSelectToken}
        excludeToken={selectorOpen === 'from' ? tokenTo : tokenFrom}
      />
    </>
  )
}
