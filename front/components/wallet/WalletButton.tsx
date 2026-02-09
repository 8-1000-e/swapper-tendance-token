'use client'

import { useState, useEffect, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Wallet, ExternalLink } from 'lucide-react'
import dynamic from 'next/dynamic'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
)

const DEEPLINK_WALLETS = [
  {
    name: 'Phantom',
    color: '#AB9FF2',
    buildUrl: (url: string) =>
      `https://phantom.app/ul/browse/${encodeURIComponent(url)}`,
  },
  {
    name: 'Solflare',
    color: '#FC8E2A',
    buildUrl: (url: string) =>
      `https://solflare.com/ul/v1/browse/${encodeURIComponent(url)}`,
  },
]

export default function WalletButton() {
  const { connected, wallets } = useWallet()
  const { setVisible } = useWalletModal()
  const [isMobile, setIsMobile] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
  }, [])

  useEffect(() => {
    if (!showPicker) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showPicker])

  // Desktop → standard button (text always visible)
  if (!isMobile) {
    return <WalletMultiButton />
  }

  // Mobile + connected → standard button (wallet icon is shown by adapter)
  if (connected) {
    return <WalletMultiButton />
  }

  // Mobile + not connected → wallet icon button (always visible)
  const hasWallets = wallets.length > 0

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => hasWallets ? setVisible(true) : setShowPicker(v => !v)}
        className="flex items-center justify-center w-9 h-9 rounded-xl bg-[rgba(18,18,26,0.8)] border border-[#2A2A3E] hover:border-[rgba(191,64,191,0.4)] transition-colors"
      >
        <Wallet size={18} className="text-gray-400" />
      </button>

      {showPicker && !hasWallets && (
        <div className="absolute right-0 top-full mt-2 glass p-2 z-50 min-w-[200px]">
          <div className="px-3 pt-1 pb-2 text-[10px] uppercase tracking-wider text-gray-600">
            Open in...
          </div>
          {DEEPLINK_WALLETS.map(w => (
            <a
              key={w.name}
              href={w.buildUrl(window.location.href)}
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-hover transition-colors"
            >
              <div
                className="w-5 h-5 rounded-full shrink-0"
                style={{ background: w.color }}
              />
              <span className="text-sm font-medium text-white">{w.name}</span>
              <ExternalLink size={12} className="ml-auto text-gray-500" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
