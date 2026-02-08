'use client'

import { useState, useMemo } from 'react'
import { Token } from '@/types'
import { MOCK_TOKENS, searchTokens } from '@/data/mock'

export function useTokenSearch() {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return MOCK_TOKENS
    return searchTokens(query)
  }, [query])

  return { query, setQuery, results }
}
