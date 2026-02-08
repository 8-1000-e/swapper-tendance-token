import { Globe, MessageCircle } from 'lucide-react'
import { Token } from '@/types'
import Card from '@/components/ui/Card'

interface TokenDescriptionProps {
  token: Token
}

export default function TokenDescription({ token }: TokenDescriptionProps) {
  const links = [
    token.website && { label: 'Website', url: token.website, icon: Globe },
    token.twitter && { label: 'Twitter', url: `https://twitter.com/${token.twitter}`, icon: () => <span className="text-sm">𝕏</span> },
    token.telegram && { label: 'Telegram', url: `https://t.me/${token.telegram}`, icon: MessageCircle },
  ].filter(Boolean) as { label: string; url: string; icon: any }[]

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-2">About {token.name}</h3>
      <p className="text-sm text-gray-300 leading-relaxed mb-4">
        {token.description}
      </p>
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {links.map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated hover:bg-bg-hover border border-border hover:border-border-bright transition-all text-xs text-gray-400 hover:text-white"
            >
              <link.icon size={14} />
              {link.label}
            </a>
          ))}
        </div>
      )}
    </Card>
  )
}
