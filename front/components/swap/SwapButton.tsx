'use client'

import { motion } from 'framer-motion'
import { Zap, Wallet } from 'lucide-react'

interface SwapButtonProps {
  disabled: boolean
  loading?: boolean
  onClick?: () => void
  label?: string
}

export default function SwapButton({ disabled, loading, onClick, label }: SwapButtonProps) {
  const text = label || 'Swap'
  const isConnectWallet = text === 'Connect Wallet'

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      disabled={disabled && !isConnectWallet}
      onClick={onClick}
      className="w-full py-4 rounded-xl font-bold text-base gradient-degen text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity"
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Swapping...</span>
        </>
      ) : isConnectWallet ? (
        <>
          <Wallet size={18} />
          <span>{text}</span>
        </>
      ) : (
        <>
          <Zap size={18} />
          <span>{text}</span>
        </>
      )}
    </motion.button>
  )
}
