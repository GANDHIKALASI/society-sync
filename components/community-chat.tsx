'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Send, Search, Smile, ShieldCheck, Users, Sparkles, MessageSquare,
  Building2, ArrowDown, Radio, Clock, CheckCheck, Trash2, Eye, User,
  Phone, Mail, MapPin, X, AlertCircle, Shield, CheckCircle2
} from 'lucide-react'

export interface ProfileData {
  id: string
  full_name: string
  role: 'super_admin' | 'resident' | 'employee'
  avatar_url?: string | null
  status?: string | null
  email?: string | null
  phone?: string | null
  block?: string | null
  flat_number?: string | null
  designation?: string | null
  occupancy_type?: string | null
  created_at?: string | null
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

  // State for Admin Profile Viewing Modal
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()
  const isAdmin = currentProfile.role === 'super_admin'

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
              status,
              email,
              phone,
              block,
              flat_number,
              designation,
              occupancy_type,
              created_at
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

    // 2. Real-time Subscription via Supabase Realtime (INSERT & DELETE)
    const channel = supabase
      .channel('society_community_chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        async (payload) => {
          const newMsg = payload.new as ChatMessage
          
          // Check if message is already in state
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            
            // Fetch sender profile asynchronously if missing
            supabase
              .from('profiles')
              .select('id, full_name, role, avatar_url, status, email, phone, block, flat_number, designation, occupancy_type, created_at')
              .eq('id', newMsg.sender_id)
              .maybeSingle()
              .then(({ data: senderProfile }) => {
                const fullMsg: ChatMessage = {
                  ...newMsg,
                  profiles: senderProfile || {
                    id: newMsg.sender_id,
                    full_name: 'Society Member',
                    role: 'resident'
                  }
                }
                setMessages((latest) => {
                  if (latest.some((m) => m.id === fullMsg.id)) return latest
                  return [...latest, fullMsg]
                })
                scrollToBottom()
              })

            return prev
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const deletedId = payload.old.id
          setMessages((prev) => prev.filter((m) => m.id !== deletedId))
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

  // Send New Message (Instant Optimistic Display)
  async function handleSendMessage(e: FormEvent) {
    e.preventDefault()
    const cleanText = inputText.trim()
    if (!cleanText || busy) return

    setBusy(true)
    setErrorMsg('')

    const tempId = 'temp-' + Date.now()
    const nowIso = new Date().toISOString()

    // 1. Create Optimistic Message Object
    const optimisticMsg: ChatMessage = {
      id: tempId,
      sender_id: currentProfile.id,
      message: cleanText,
      created_at: nowIso,
      profiles: currentProfile
    }

    // 2. Instantly append to chat state (no refresh required)
    setMessages((prev) => [...prev, optimisticMsg])
    setInputText('')
    setShowEmojis(false)
    scrollToBottom()

    try {
      // 3. Persist in database
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: currentProfile.id,
          message: cleanText,
          created_at: nowIso
        })
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
            status,
            email,
            phone,
            block,
            flat_number,
            designation,
            occupancy_type,
            created_at
          )
        `)
        .single()

      if (error) {
        // Rollback optimistic message if error occurs
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        setErrorMsg('Failed to send message: ' + error.message)
      } else if (data) {
        // Replace optimistic temp ID with real database record
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? (data as ChatMessage) : m))
        )
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setErrorMsg('Connection error sending message.')
    } finally {
      setBusy(false)
    }
  }

  // Delete Message (Admin Only)
  async function handleDeleteMessage(messageId: string) {
    if (!isAdmin) return
    if (!confirm('Are you sure you want to delete this message?')) return

    // Optimistically remove from state
    setMessages((prev) => prev.filter((m) => m.id !== messageId))

    try {
      const { error } = await supabase.from('chat_messages').delete().eq('id', messageId)
      if (error) {
        setErrorMsg('Could not delete message: ' + error.message)
      }
    } catch {
      setErrorMsg('Error deleting message.')
    }
  }

  // Open Profile Details Modal (Admin Only)
  async function handleOpenProfile(profile: ProfileData | null | undefined) {
    if (!isAdmin || !profile) return

    setProfileLoading(true)
    setSelectedProfile(profile)

    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url, status, email, phone, block, flat_number, designation, occupancy_type, created_at')
        .eq('id', profile.id)
        .maybeSingle()

      if (data) {
        setSelectedProfile(data as ProfileData)
      }
    } catch {
      // Fallback to basic profile
    } finally {
      setProfileLoading(false)
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

  // Format Date & Time in IST
  function formatTimestamp(isoStr: string) {
    if (!isoStr) return ''
    try {
      const d = new Date(isoStr)
      const todayIST = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' })
      const msgDateIST = d.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' })
      const timeIST = d.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })

      if (todayIST === msgDateIST) {
        return `Today at ${timeIST}`
      }
      return `${d.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' })} at ${timeIST}`
    } catch {
      return isoStr
    }
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
                className={`group flex gap-3 max-w-3xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* AVATAR WITH ONLINE GREEN PRESENCE DOT & ADMIN PROFILE CLICK */}
                <div
                  onClick={() => handleOpenProfile(msg.profiles || { id: msg.sender_id, full_name: senderName, role: 'resident' })}
                  className={`relative shrink-0 ${isAdmin ? 'cursor-pointer transition hover:scale-105' : ''}`}
                  title={isAdmin ? 'Click to view member security profile' : undefined}
                >
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
                    <span
                      onClick={() => handleOpenProfile(msg.profiles || { id: msg.sender_id, full_name: senderName, role: 'resident' })}
                      className={`font-bold opacity-90 ${isAdmin ? 'hover:underline cursor-pointer' : ''}`}
                    >
                      {senderName}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold border ${roleInfo.style}`}>
                      {roleInfo.label}
                    </span>
                    <span className="font-mono text-[10px] opacity-60">
                      {formatTimestamp(msg.created_at)}
                    </span>

                    {/* DELETE BUTTON (SUPER ADMIN ONLY) */}
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="ml-1 opacity-0 group-hover:opacity-100 p-1 text-red-300 hover:text-red-100 hover:bg-red-500/20 rounded-lg transition"
                        title="Delete message (Admin action)"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
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
            disabled={!inputText.trim()}
            type="submit"
            className="theme-button-primary h-12 px-5 flex items-center justify-center gap-2 text-sm shadow-xl disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="size-4" />
          </button>
        </div>
      </form>

      {/* 5. ADMIN PROFILE DETAILS MODAL */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in">
          <div className="surface-card w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/20 bg-white/10 backdrop-blur-3xl text-current">
            <div className="flex items-center justify-between border-b border-current/15 pb-4">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-emerald-300 font-bold">
                <ShieldCheck className="size-4" /> Member Security Profile
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="rounded-xl p-1.5 hover:bg-white/10 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {profileLoading ? (
              <div className="py-12 text-center text-sm opacity-75">Loading profile details…</div>
            ) : (
              <div className="mt-5 flex flex-col items-center text-center">
                {/* PROFILE PICTURE */}
                {selectedProfile.avatar_url ? (
                  <img
                    src={selectedProfile.avatar_url}
                    alt={selectedProfile.full_name}
                    className="size-20 rounded-3xl object-cover border-2 border-white/30 shadow-xl"
                  />
                ) : (
                  <div className="flex size-20 items-center justify-center rounded-3xl bg-black/50 border-2 border-white/30 font-bold text-3xl text-white shadow-xl">
                    {selectedProfile.full_name.slice(0, 1).toUpperCase()}
                  </div>
                )}

                <h3 className="mt-4 text-2xl font-extrabold">{selectedProfile.full_name}</h3>
                
                <span className={`mt-1 rounded-full px-3 py-0.5 font-mono text-xs font-bold border ${getRoleBadge(selectedProfile.role).style}`}>
                  {getRoleBadge(selectedProfile.role).label}
                </span>

                {/* DETAILED INFORMATION GRID */}
                <div className="mt-6 w-full rounded-2xl border border-current/15 bg-black/25 p-4 flex flex-col gap-3 text-left text-xs font-mono">
                  {selectedProfile.role === 'resident' && (
                    <>
                      <div className="flex justify-between border-b border-current/10 pb-2">
                        <span className="opacity-70">Flat Number:</span>
                        <span className="font-bold text-white">{selectedProfile.flat_number || 'A-101'}</span>
                      </div>
                      <div className="flex justify-between border-b border-current/10 pb-2">
                        <span className="opacity-70">Block / Tower:</span>
                        <span className="font-bold text-white">{selectedProfile.block || 'Block A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-current/10 pb-2">
                        <span className="opacity-70">Occupancy Type:</span>
                        <span className="font-bold capitalize text-emerald-300">{selectedProfile.occupancy_type || 'Owner'}</span>
                      </div>
                    </>
                  )}

                  {selectedProfile.role === 'employee' && (
                    <div className="flex justify-between border-b border-current/10 pb-2">
                      <span className="opacity-70">Designation / Role:</span>
                      <span className="font-bold text-amber-300">{selectedProfile.designation || 'Staff'}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-b border-current/10 pb-2">
                    <span className="opacity-70">Email Address:</span>
                    <span className="font-bold text-white">{selectedProfile.email || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between border-b border-current/10 pb-2">
                    <span className="opacity-70">Phone Number:</span>
                    <span className="font-bold text-white">{selectedProfile.phone || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between border-b border-current/10 pb-2">
                    <span className="opacity-70">Account Status:</span>
                    <span className="font-bold uppercase text-emerald-300">{selectedProfile.status || 'Approved'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="opacity-70">Member Since:</span>
                    <span className="opacity-90">{selectedProfile.created_at ? new Date(selectedProfile.created_at).toLocaleDateString() : 'Active Member'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProfile(null)}
                  className="mt-6 w-full rounded-xl bg-[var(--primary)] text-[var(--secondary)] py-2.5 text-xs font-bold shadow-lg"
                >
                  Close Profile Details
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
