import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-primary mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="TendanceSwap" width={24} height={24} className="rounded-md" />
            <span className="text-sm font-semibold gradient-degen-text">TendanceSwap</span>
          </div>
          <p className="text-xs text-gray-600 text-center">
            Fast token swaps on Solana. Not financial advice. DYOR.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>Powered by Jupiter</span>
            <span>·</span>
            <span>Solana</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
