import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FinanceOfficerDashboard from '../features/dashboard/finance/FinanceOfficerDashboard'
import type { DashboardNotification } from '../features/dashboard/shared/types/dashboard.types'
import { getNotifications, markNotificationRead } from '../lib/api'

export default function FinancePage() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const [darkMode, setDarkMode]           = useState(false)
  const [notifications, setNotifications] = useState<DashboardNotification[]>([])

  useEffect(() => {
    getNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]))
  }, [])

  function handleBack() {
    logout()
    navigate('/', { replace: true })
  }

  function markNotifRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    markNotificationRead(id).catch(() => undefined)
  }

  return (
    <FinanceOfficerDashboard
      onBack={handleBack}
      darkMode={darkMode}
      onToggleDark={() => setDarkMode((v) => !v)}
      notifications={notifications}
      onMarkNotifRead={markNotifRead}
    />
  )
}
