import { Token } from '@/types'

interface TokenDescriptionProps {
  token: Token
}

export default function TokenDescription({ token }: TokenDescriptionProps) {
  if (!token.description) return null

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <span className="text-[10px] uppercase tracking-wider text-gray-500">About</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-xs text-gray-400 leading-relaxed">
          {token.description}
        </p>
      </div>
    </div>
  )
}
