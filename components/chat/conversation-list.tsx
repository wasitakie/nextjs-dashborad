'use client'

import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { Conversation, ConversationStatus } from '@/lib/data'
import { MessageSquare, Clock, CheckCircle2 } from 'lucide-react'

const fallbackAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const statusConfig: Record<ConversationStatus, { bg: string; text: string; icon: typeof Clock }> = {
  OPEN: { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', icon: MessageSquare },
  PENDING: { bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', icon: Clock },
  RESOLVED: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', icon: CheckCircle2 },
}

function formatTime(dateStr: string, locale: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  const relativeTime = new Intl.RelativeTimeFormat(locale, {
    numeric: 'auto',
    style: 'narrow',
  })

  if (diffMins < 1) return relativeTime.format(0, 'minute')
  if (diffMins < 60) return relativeTime.format(-diffMins, 'minute')
  if (diffHours < 24) return relativeTime.format(-diffHours, 'hour')
  if (diffDays < 7) return relativeTime.format(-diffDays, 'day')
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  const locale = useLocale()
  const tCommon = useTranslations('common')
  const tStatus = useTranslations('status.conversation')

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs p-6 text-center">
        <MessageSquare className="w-10 h-10 mb-3 opacity-40" />
        <p>{tCommon('noConversations')}</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800/80 overflow-y-auto h-full">
      {conversations.map((conv) => {
        const isSelected = conv.id === selectedId
        const status = statusConfig[conv.status]
        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full text-left p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
              isSelected
                ? 'bg-blue-50 dark:bg-blue-950/30 border-l-2 border-l-blue-500'
                : 'border-l-2 border-l-transparent'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <Image
                  src={conv.customer?.avatar ?? fallbackAvatar}
                  alt={conv.customer?.name ?? 'Customer avatar'}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                />
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {conv.unreadCount}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                    {conv.customer?.name}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatTime(conv.lastMessageAt, locale)}
                  </span>
                </div>

                <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate mb-1">
                  {conv.subject}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-slate-400 truncate flex-1">
                    {conv.lastMessage}
                  </p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {conv.orderRef && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                        {conv.orderRef}
                      </span>
                    )}
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                      {tStatus(conv.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
