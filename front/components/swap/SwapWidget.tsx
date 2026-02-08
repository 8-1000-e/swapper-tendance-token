'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { VersionedTransaction } from '@solana/web3.js'
import { ExternalLink, X, Check } from 'lucide-react'
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

  // Auto-dismiss swap result after 8 seconds
  useEffect(() => {
    if (!swapResult) return
    const timer = setTimeout(() => setSwapResult(null), 10000)
    return () => clearTimeout(timer)
  }, [swapResult])

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

          {/* TODO: remove — test button for tx notification */}
          <button
            onClick={() => setSwapResult('4sGjMW1sUnHzSxGspuhSqLDJmpVZ6jbLaNfGbnQTSd3TGEHqYxRcUmhFqqASjPFpFdNWoihHAQjTGPYyY2Namode')}
            className="mt-2 text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
          >
            [test tx notif]
          </button>

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

      {/* Celebratory swap success modal */}
      <AnimatePresence>
        {swapResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSwapResult(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

            {/* Floating particles */}
            {Array.from({ length: 20 }).map((_, i) => {
              const colors = ['#39FF14', '#BF40BF', '#FFD700', '#00FFFF', '#FF6EC7']
              const color = colors[Math.floor(Math.random() * colors.length)]
              return (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    y: 0,
                    x: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: [0, -200 - Math.random() * 300],
                    x: [0, (Math.random() - 0.5) * 400],
                    scale: [0, 1, 0.5],
                    rotate: [0, Math.random() * 720 - 360],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.8,
                    ease: 'easeOut',
                  }}
                  className="absolute z-0 pointer-events-none"
                  style={{
                    width: 4 + Math.random() * 8,
                    height: 4 + Math.random() * 8,
                    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                    background: color,
                    boxShadow: `0 0 6px ${color}`,
                  }}
                />
              )
            })}

            {/* Modal card */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.1 }}
              className="relative z-10 w-full max-w-[420px]"
              onClick={e => e.stopPropagation()}
            >
              {/* Subtle gradient border */}
              <div
                className="absolute -inset-[1px] rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, #BF40BF, #FF6EC7, #FFD700)',
                  opacity: 0.4,
                }}
              />

              <div className="relative bg-[#0D0D14] rounded-3xl p-8 overflow-hidden">
                {/* Close button */}
                <button
                  onClick={() => setSwapResult(null)}
                  className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors z-20"
                >
                  <X size={20} />
                </button>

                {/* Animated checkmark */}
                <div className="flex justify-center mb-6 pt-2">
                  <div className="relative">
                    {/* Outer ring pulse */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.3, 0] }}
                      transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-full border-2 border-neon-green"
                    />
                    {/* Second ring */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.8, 1.5], opacity: [0, 0.2, 0] }}
                      transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-full border border-neon-green"
                    />
                    {/* Checkmark circle */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                      className="relative w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(57,255,20,0.2) 0%, rgba(57,255,20,0.05) 100%)',
                        boxShadow: '0 0 30px rgba(57,255,20,0.25), inset 0 0 20px rgba(57,255,20,0.1)',
                        border: '2px solid rgba(57,255,20,0.4)',
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.5 }}
                      >
                        <Check size={36} strokeWidth={3} className="text-neon-green" />
                      </motion.div>
                    </motion.div>
                  </div>
                </div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-center mb-2"
                >
                  <h3 className="text-2xl font-bold text-white">Swap Successful</h3>
                </motion.div>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center text-sm text-gray-500 mb-6"
                >
                  Your transaction has been confirmed on Solana
                </motion.p>

                {/* Transaction hash */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mb-6"
                >
                  <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mb-1.5">Transaction ID</p>
                    <p className="text-xs font-mono text-gray-400 truncate">{swapResult}</p>
                  </div>
                </motion.div>

                {/* CTA Button */}
                <motion.a
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  href={`https://solscan.io/tx/${swapResult}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm text-black transition-all hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, #39FF14 0%, #2BD10F 100%)',
                    boxShadow: '0 0 20px rgba(57,255,20,0.3), 0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  View on Solscan
                  <ExternalLink size={14} />
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
