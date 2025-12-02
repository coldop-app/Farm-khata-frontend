export const API_ENDPOINTS = {
  // Auth
  register: '/farmers/register',
  login: '/farmers/login',
  logout: '/farmers/logout',
  profile: '/farmers/profile',

  // Daybook
  daybook: '/daybook',
  daybookById: (id: string) => `/daybook/${id}`,

  // Inventory
  inventory: '/inventory',
  inventoryById: (id: string) => `/inventory/${id}`,
  inventoryTransactions: (id: string) => `/inventory/${id}/transactions`,
  inventoryAdjust: (id: string) => `/inventory/${id}/adjust`,

  // Suppliers
  suppliers: '/suppliers',
  supplierById: (id: string) => `/suppliers/${id}`,
  supplierPayments: (id: string) => `/suppliers/${id}/payments`,

  // Lands
  lands: '/lands',
  landById: (id: string) => `/lands/${id}`,
  landActivities: (id: string) => `/lands/${id}/activities`,

  // Activities
  activities: '/activities',
  activityById: (id: string) => `/activities/${id}`,
} as const;
