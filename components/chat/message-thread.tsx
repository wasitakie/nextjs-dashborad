'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { Conversation, Message } from '@/lib/data'
import { Bot, User, Info, Package } from 'lucide-react'

const fallbackAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'

interface MessageThreadProps {
  conversation: Conversation | null
  messages: Message[]
}

function formatMessageTime(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function MessageThread({ conversation, messages }: MessageThreadProps) {
  const locale = useLocale()
  const t = useTranslations('common')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <User className="w-8 h-8 opacity-40" />
        </div>
        <p className="text-sm font-medium">{t('selectConversationTitle')}</p>
        <p className="text-xs mt-1">{t('selectConversationDetail')}</p>
      </div>
    )
  }

  const messagesWithDivider = messages.map((message, index) => {
    const currentDate = new Date(message.createdAt).toDateString()
    const previousDate = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : ''

    return {
      message,
      showDateDivider: currentDate !== previousDate,
    }
  })

  return (
    <div className="flex flex-col h-full">
      {/* Thread Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <Image
            src={conversation.customer?.avatar ?? fallbackAvatar}
            alt={conversation.customer?.name ?? 'Customer avatar'}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              {conversation.customer?.name}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {conversation.subject}
            </p>
          </div>
          {conversation.orderRef && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <Package className="w-3.5 h-3.5" />
              Order {conversation.orderRef}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
        {messagesWithDivider.map(({ message: msg, showDateDivider }) => {
          const isAgent = msg.senderType === 'AGENT'
          const isSystem = msg.senderType === 'SYSTEM'

          return (
            <div key={msg.id}>
              {showDateDivider && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                  <span className="text-[10px] text-slate-400 font-medium px-2">
                    {formatDate(msg.createdAt, locale)}
                  </span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                </div>
              )}

              {isSystem ? (
                <div className="flex justify-center my-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    <Info className="w-3 h-3" />
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className={`flex gap-2.5 mb-3 ${isAgent ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isAgent && (
                    <Image
                      src={conversation.customer?.avatar ?? fallbackAvatar}
                      alt=""
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-1"
                    />
                  )}
                  {isAgent && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[70%] ${isAgent ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        isAgent
                          ? 'bg-blue-600 text-white rounded-tr-sm shadow-md shadow-blue-500/20'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {formatMessageTime(msg.createdAt, locale)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
