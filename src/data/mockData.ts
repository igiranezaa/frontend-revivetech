
export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'User Management' },
  { id: 'inventory', label: 'Device Inventory' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'financing', label: 'Financing' },
  { id: 'sales', label: 'Sales Analytics' },
  { id: 'logs', label: 'System Logs' },
  { id: 'profile', label: 'Profile' },
]

export const SECTION_COPY = {
  overview: {
    title: 'Overview',
    subtitle: 'Monitor your ecosystem performance and marketplace health.',
  },
  users: {
    title: 'User Management',
    subtitle: 'Manage platform users, roles, access levels, and account activity across the marketplace.',
  },
  inventory: {
    title: 'Device Inventory',
    subtitle: 'Control device stock levels, warehouse allocation, refurbishment status, and replenishment alerts.',
  },
  pricing: {
    title: 'Pricing Updates',
    subtitle: 'Configure marketplace pricing, financing tiers, and promotional adjustments for certified devices.',
  },
  financing: {
    title: 'Financing Monitoring',
    subtitle: 'Track active loans, approval pipelines, delinquency risk, and settlement performance.',
  },
  sales: {
    title: 'Sales Analytics',
    subtitle: 'Analyze revenue performance, seller contributions, and regional sales trends.',
  },
  logs: {
    title: 'System Logs',
    subtitle: 'Audit platform events, security actions, integration jobs, and administrative changes.',
  },
  technician: {
    title: 'Technician Workbench',
    subtitle:
      'Refurbishment operations hub — track assigned devices, repair progress, faults, parts usage, and completion status.',
  },
  profile: {
    title: 'My Profile',
    subtitle: 'Manage your account information, security settings, and review your recent activity.',
  },
}

/** 3.8 Technician — assigned repairs (mock) */
export const REPAIR_TICKETS_SEED: any[] = []

/** Parts usage / bench stock (mock) */
export const TECH_PARTS_SEED: any[] = []

export const OVERVIEW_STATS: any[] = []

export const OVERVIEW_PIE_DATA: any[] = []

export const OVERVIEW_REVENUE_TREND: any[] = []

export const OVERVIEW_ORDERS_TREND: any[] = []

export const APPLICATIONS_SEED: any[] = []

export const USERS_SEED: any[] = []

export const DEVICES_SEED: any[] = []

export const PRICING_SEED: any[] = []

export const FINANCING_SEED: any[] = []

export const SALES_SEED: any[] = []

export const LOGS_SEED: any[] = []

export const TECHNICIAN_PROFILE = {
  name: 'Marcus Johnson',
  initials: 'MJ',
  role: 'Senior Technician',
  id: 'TECH-0042',
  email: 'marcus.j@certified.rw',
  phone: '+250 788 901 234',
  location: 'Kigali Central Workshop',
  since: 'March 2023',
  certifications: [
    'Apple Certified Repair Technician',
    'Samsung Authorized Service Pro',
    'Google Authorized Service Provider',
  ],
}

export const TECH_PERF_STATS: any[] = []

export const TECH_ACTIVITY_SEED: any[] = []

// ─── Admin Profile ───────────────────────────────────────────────────────────

export const ADMIN_PROFILE = {
  name: 'Liam Chen',
  initials: 'LC',
  role: 'Super Admin',
  id: 'USR-1001',
  email: 'liam.chen@revivetech.io',
  phone: '+250 788 001 002',
  location: 'Kigali HQ',
  since: 'August 2022',
  department: 'Platform Operations',
}

export const ADMIN_ACTIVITY_LOG: any[] = []

export const ADMIN_PLATFORM_STATS: any[] = []

// ─── Finance Officer Dashboard ───────────────────────────────────────────────

export const FO_OFFICER_PROFILE = {
  name: 'Amara Diallo',
  initials: 'AD',
  role: 'Senior Finance Officer',
  id: 'FIN-OFF-007',
  email: 'amara.diallo@finance.rw',
  phone: '+250 788 234 567',
  location: 'Kigali Finance Hub',
  since: 'January 2024',
}

export const FO_OVERVIEW_KPIS: any[] = []

export const FO_LOAN_STATUS_PIE: any[] = []

export const FO_MONTHLY_LOANS: any[] = []

export const FO_APPROVAL_TREND: any[] = []

export const FO_REQUESTS_SEED: any[] = []

export const FO_ACTIVE_LOANS_SEED: any[] = []

export const FO_DELINQUENT_SEED: any[] = []

export const FO_CUSTOMERS_SEED: any[] = []

export const FO_DEVICES_SEED: any[] = []

export const FO_REPORTS_REGIONAL: any[] = []

export const FO_SETTINGS_SEED = {
  interestRates: { standard: 14.5, premium: 13.8, business: 12.9 },
  loanTerms: [6, 12, 18, 24, 36],
  lateFeePercent: 1.5,
  gracePeriodDays: 5,
  autoReminder: true,
  reminderDaysBefore: 3,
  escalationThresholdDays: 30,
  language: 'en',
  currency: 'USD',
}

export const FO_ACTIVITY_LOG: any[] = []

export const NOTIFICATIONS_SEED: any[] = []
