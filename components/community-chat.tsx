'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Send, Search, Smile, ShieldCheck, Users, Sparkles, MessageSquare,
  Building2, ArrowDown, Radio, Clock, CheckCheck
} from 'lucide-react'

export interface ProfileData {
  id: string
  full_name: string
  role: 'super_admin' | 'resident' | 'employee'
  avatar_url?: string | null
  status?: string | null
}

export interface ChatMessage {
  id: string
  sender_id: string
  message: string
  created_at: string
  society_id?: string | null
  profiles?: ProfileData | null
}

const QUICK_EMOJIS = ['😀', '😂', '👍', '🎉', '⚠️', '🚗', '🔧', '📋', '🚨', '❤️', '🏢', '💡', '👋', '✅', '🔥', '👏']

export function CommunityChat({ currentProfile }: { currentProfile: ProfileData }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<Record<string, any>>({})
  const [showEmojis, setShowEmojis] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  // 1. Fetch initial message history
  useEffect(() => {
    async function loadMessages() {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select(`
            id,
            sender_id,
            message,
            created_at,
            society_id,
            profiles:sender_id (
              id,
              full_name,
              role,
              avatar_url,
              status
            )
          `)
          .order('created_at', { ascending: true })

        if (error) {
          setErrorMsg('Could not fetch message history.')
          return
        }

        if (data) {
          setMessages(data as any[])
          scrollToBottom()
        }
      } catch {
        setErrorMsg('Network error loading community chat.')
      }
    }

    loadMessages()

    // 2. Real-time Subscription via Supabase Realtime
    const channel = supabase
      .channel('society_community_chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        async (payload) => {
          const newMsg = payload.new as ChatMessage
          // Fetch sender profile for the new payload
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('id, full_name, role, avatar_url, status')
            .eq('id', newMsg.sender_id)
            .maybeSingle()

          const fullMessage: ChatMessage = {
            ...newMsg,
            profiles: senderProfile || {
              id: newMsg.sender_id,
              full_name: 'Society Member',
              role: 'resident'
            }
          }

          setMessages((prev) => [...prev, fullMessage])
          scrollToBottom()
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setOnlineUsers(state)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentProfile.id,
            name: currentProfile.full_name,
            role: currentProfile.role,
            online_at: new Date().toISOString()
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentProfile.id, currentProfile.full_name, currentProfile.role])

  function scrollToBottom() {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Send New Message
  async function handleSendMessage(e: FormEvent) {
    e.preventDefault()
    const cleanText = inputText.trim()
    if (!cleanText || busy) return

    setBusy(true)
    setErrorMsg('')

    try {
      const { error } = await supabase.from('chat_messages').insert({
        sender_id: currentProfile.id,
        message: cleanText,
        created_at: new Date().toISOString()
      })

      if (error) {
        setErrorMsg('Failed to send message: ' + error.message)
      } else {
        setInputText('')
        setShowEmojis(false)
        scrollToBottom()
      }
    } catch {
      setErrorMsg('Connection error sending message.')
    } finally {
      setBusy(false)
    }
  }

  function addEmoji(emoji: string) {
    setInputText((prev) => prev + emoji)
  }

  // Filter messages by search query
  const filteredMessages = messages.filter((msg) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    const text = msg.message.toLowerCase()
    const sender = (msg.profiles?.full_name || '').toLowerCase()
    const role = (msg.profiles?.role || '').toLowerCase()
    return text.includes(query) || sender.includes(query) || role.includes(query)
  })

  // Format Date & Time
  function formatTimestamp(isoStr: string) {
    if (!isoStr) return ''
    const d = new Date(isoStr)
    const today = new Date()
    const isToday = d.toDateString() === today.toDateString()

    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (isToday) {
      return `Today at ${timeStr}`
    }
    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} at ${timeStr}`
  }

  // Helper for role badge styling
  function getRoleBadge(roleStr?: string) {
    switch (roleStr) {
      case 'super_admin':
        return { label: 'Super Admin', style: 'bg-[#21F1A8]/20 text-[#21F1A8] border-[#21F1A8]/30' }
      case 'employee':
        return { label: 'Staff / Employee', style: 'bg-[#FFC6A8]/20 text-[#FFC6A8] border-[#FFC6A8]/30' }
      default:
        return { label: 'Resident', style: 'bg-[#D7F36B]/20 text-[#D7F36B] border-[#D7F36B]/30' }
    }
  }

  const onlineCount = Object.keys(onlineUsers).length || 1

  return (
    <div className="surface-card relative flex h-[calc(100vh-9.5rem)] min-h-[620px] flex-col overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-3xl">
      {/* 1. CHAT HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-current/15 bg-black/20 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--primary)] text-[var(--secondary)] font-bold shadow-lg">
            <MessageSquare className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold tracking-tight">Society Community Chat</h2>
              <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-300">
                <Radio className="size-3 animate-pulse text-emerald-400" /> {onlineCount} Online
              </span>
            </div>
            <p className="text-xs opacity-75">
              Official All-Member Channel • Super Admin, Admin, Staff & Residents
            </p>
          </div>
        </div>

        {/* SEARCH BOX */}
        <div className="relative flex items-center min-w-[240px]">
          <Search className="absolute left-3 size-4 opacity-60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="theme-input h-10 w-full pl-9 pr-4 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-xs opacity-60 hover:opacity-100"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 2. MESSAGES LIST */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((msg) => {
            const isMe = msg.sender_id === currentProfile.id
            const senderName = isMe ? 'You (' + (currentProfile.full_name.split(' ')[0] || 'Me') + ')' : (msg.profiles?.full_name || 'Society Member')
            const roleInfo = getRoleBadge(msg.profiles?.role || (isMe ? currentProfile.role : 'resident'))
            const avatarUrl = msg.profiles?.avatar_url

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* AVATAR WITH ONLINE GREEN PRESENCE DOT */}
                <div className="relative shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={senderName}
                      className="size-10 rounded-2xl object-cover border border-white/20"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-black/40 border border-white/20 font-bold text-sm">
                      {senderName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  {/* GREEN PRESENCE INDICATOR */}
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-black bg-emerald-400 ring-2 ring-emerald-400/30" />
                </div>

                {/* MESSAGE BODY */}
                <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 px-1 text-xs">
                    <span className="font-bold opacity-90">{senderName}</span>
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold border ${roleInfo.style}`}>
                      {roleInfo.label}
                    </span>
                    <span className="font-mono text-[10px] opacity-60">
                      {formatTimestamp(msg.created_at)}
                    </span>
                  </div>

                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg max-w-xl break-words ${
                      isMe
                        ? 'bg-[var(--primary)] text-[var(--secondary)] font-medium rounded-tr-none'
                        : 'border border-white/20 bg-black/30 backdrop-blur-xl text-current rounded-tl-none'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-dashed border-current/20 text-center p-8">
            <MessageSquare className="size-10 opacity-50" />
            <h3 className="mt-3 text-lg font-bold">
              {searchQuery ? `No messages found matching "${searchQuery}"` : 'Welcome to Society Community Chat'}
            </h3>
            <p className="mt-1 max-w-sm text-xs opacity-75">
              {searchQuery ? 'Try searching for a different keyword or member name.' : 'Start the conversation! Every message posted here is visible to all society members.'}
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. EMOJI SELECTOR BAR */}
      {showEmojis && (
        <div className="border-t border-current/15 bg-black/40 p-3 backdrop-blur-2xl flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="text-xs font-mono uppercase tracking-wider opacity-75 self-center mr-2">Quick Emojis:</span>
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="text-lg p-1.5 rounded-xl hover:bg-white/20 transition hover:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* 4. CHAT INPUT FORM */}
      <form onSubmit={handleSendMessage} className="border-t border-current/15 bg-black/20 p-4 backdrop-blur-xl">
        {errorMsg && (
          <p className="mb-2 text-xs font-semibold text-red-300 bg-red-500/20 p-2 rounded-xl border border-red-500/30">
            {errorMsg}
          </p>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmojis(!showEmojis)}
            className="rounded-xl border border-current/20 p-2.5 opacity-80 hover:bg-white/10 hover:opacity-100 transition"
            title="Add Emoji"
          >
            <Smile className="size-5 text-amber-300" />
          </button>

          <input
            required
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message to Society Community Chat..."
            className="theme-input min-w-0 flex-1 h-12 text-sm bg-black/40"
          />

          <button
            disabled={busy || !inputText.trim()}
            type="submit"
            className="theme-button-primary h-12 px-5 flex items-center justify-center gap-2 text-sm shadow-xl disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
