import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────
export interface SupportMessage {
  id: string
  sender: 'customer' | 'agent'
  senderName: string
  text: string
  timestamp: string
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface SupportTicket {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  subject: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  messages: SupportMessage[]
  createdAt: string
  updatedAt: string
  unreadByAgent: number
  unreadByCustomer: number
}

// ── Helpers ────────────────────────────────────────────────────────────────
function now(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

// ── Context ────────────────────────────────────────────────────────────────
interface SupportContextValue {
  tickets: SupportTicket[]
  createTicket: (params: { customerId: string; customerName: string; customerEmail: string; subject: string; category: string; firstMessage: string }) => SupportTicket
  sendCustomerMessage: (ticketId: string, customerName: string, text: string) => void
  sendAgentMessage: (ticketId: string, agentName: string, text: string) => void
  markReadByAgent: (ticketId: string) => void
  markReadByCustomer: (ticketId: string) => void
  getTicketById: (id: string) => SupportTicket | undefined
  getTicketsForCustomer: (customerId: string) => SupportTicket[]
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void
  updateTicketPriority: (ticketId: string, priority: TicketPriority) => void
}

const SupportContext = createContext<SupportContextValue | null>(null)

export function SupportProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<SupportTicket[]>([])

  const createTicket = useCallback((params: {
    customerId: string
    customerName: string
    customerEmail: string
    subject: string
    category: string
    firstMessage: string
  }): SupportTicket => {
    const ticket: SupportTicket = {
      id: genId('TKT'),
      customerId: params.customerId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      subject: params.subject,
      category: params.category,
      priority: 'medium',
      status: 'open',
      messages: [
        {
          id: genId('MSG'),
          sender: 'customer',
          senderName: params.customerName,
          text: params.firstMessage,
          timestamp: now(),
        },
      ],
      createdAt: 'Just now',
      updatedAt: now(),
      unreadByAgent: 1,
      unreadByCustomer: 0,
    }
    setTickets((prev) => [ticket, ...prev])
    return ticket
  }, [])

  const sendCustomerMessage = useCallback((ticketId: string, customerName: string, text: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              messages: [
                ...t.messages,
                { id: genId('MSG'), sender: 'customer', senderName: customerName, text, timestamp: now() },
              ],
              updatedAt: now(),
              unreadByAgent: t.unreadByAgent + 1,
              status: t.status === 'resolved' || t.status === 'closed' ? 'open' : t.status,
            }
          : t
      )
    )
  }, [])

  const sendAgentMessage = useCallback((ticketId: string, agentName: string, text: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              messages: [
                ...t.messages,
                { id: genId('MSG'), sender: 'agent', senderName: agentName, text, timestamp: now() },
              ],
              updatedAt: now(),
              unreadByCustomer: t.unreadByCustomer + 1,
              status: t.status === 'open' ? 'in_progress' : t.status,
            }
          : t
      )
    )
  }, [])

  const markReadByAgent = useCallback((ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, unreadByAgent: 0 } : t))
    )
  }, [])

  const markReadByCustomer = useCallback((ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, unreadByCustomer: 0 } : t))
    )
  }, [])

  const getTicketById = useCallback(
    (id: string) => tickets.find((t) => t.id === id),
    [tickets]
  )

  const getTicketsForCustomer = useCallback(
    (customerId: string) => tickets.filter((t) => t.customerId === customerId),
    [tickets]
  )

  const updateTicketStatus = useCallback((ticketId: string, status: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: now() } : t))
    )
  }, [])

  const updateTicketPriority = useCallback((ticketId: string, priority: TicketPriority) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, priority, updatedAt: now() } : t))
    )
  }, [])

  return (
    <SupportContext.Provider
      value={{
        tickets,
        createTicket,
        sendCustomerMessage,
        sendAgentMessage,
        markReadByAgent,
        markReadByCustomer,
        getTicketById,
        getTicketsForCustomer,
        updateTicketStatus,
        updateTicketPriority,
      }}
    >
      {children}
    </SupportContext.Provider>
  )
}

export function useSupport() {
  const ctx = useContext(SupportContext)
  if (!ctx) throw new Error('useSupport must be used inside SupportProvider')
  return ctx
}
