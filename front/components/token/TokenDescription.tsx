import { Token } from '@/types'

interface TokenDescriptionProps {
  token: Token
}

export default function TokenDescription({ token }: TokenDescriptionProps) {
  if (!token.description) return null

  return (
    <div className="mt-3">
      <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">
        {token.description}
      </p>
    </div>
  )
}
