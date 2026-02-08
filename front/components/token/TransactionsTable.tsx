'use client'

import { useMemo } from 'react'
import { Token, Transaction } from '@/types'
import { generateTransactions } from '@/data/mock'
import { formatAddress, formatNumber, formatPrice, timeAgo, cn } from '@/lib/utils'
import Card from '@/components/ui/Card'

interface TransactionsTableProps {
  token: Token
}

export default function TransactionsTable({ token }: TransactionsTableProps) {
  const transactions = useMemo(() => generateTransactions(token, 25), [token])

  return (
    <Card className="p-4 overflow-hidden">
      <h3 className="text-sm font-semibold text-gray-400 mb-3">Recent Transactions</h3>
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-border">
              <th className="text-left pb-2 font-medium">Type</th>
              <th className="text-right pb-2 font-medium">Amount</th>
              <th className="text-right pb-2 font-medium">Price</th>
              <th className="text-right pb-2 font-medium">Total</th>
              <th className="text-right pb-2 font-medium hidden sm:table-cell">Wallet</th>
              <th className="text-right pb-2 font-medium">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-bg-hover/50 transition-colors">
                <td className="py-2">
                  <span
                    className={cn(
                      'font-semibold',
                      tx.type === 'buy' ? 'text-neon-green' : 'text-red-400'
                    )}
                  >
                    {tx.type === 'buy' ? 'Buy' : 'Sell'}
                  </span>
                </td>
                <td className="text-right py-2 font-mono text-gray-300">
                  {formatNumber(tx.amount)} {token.symbol}
                </td>
                <td className="text-right py-2 font-mono text-gray-300">
                  {formatPrice(tx.price)}
                </td>
                <td className="text-right py-2 font-mono text-white font-semibold">
                  ${formatNumber(tx.totalUsd)}
                </td>
                <td className="text-right py-2 font-mono text-gray-500 hidden sm:table-cell">
                  {formatAddress(tx.wallet)}
                </td>
                <td className="text-right py-2 text-gray-500">
                  {timeAgo(tx.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
