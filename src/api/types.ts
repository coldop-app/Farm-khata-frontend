// Daybook
export interface DaybookEntry {
  _id: string;
  type: 'cash_in' | 'cash_out';
  item_name: string;
  qty?: number;
  unit?: string;
  amount: number;
  payment_type: 'credit' | 'full' | 'partial';
  supplier_id?: string;
  buyer?: string;
  allocation: 'farm_inputs' | 'labour' | 'sold_stock' | 'other';
  linked_activity_id?: string;
  date: string;
  notes?: string;
  inventory_lines?: Array<{
    item_id: string;
    qty: number;
    unit_cost: number;
  }>;
  sold_lines?: Array<{
    item_id: string;
    qty: number;
  }>;
}

// Inventory
export interface InventoryItem {
  _id: string;
  name: string;
  category?: string;
  total_qty: number;
  unit: string;
  avg_cost: number;
  supplier_id?: string;
  last_purchase?: string;
}

// Supplier
export interface Supplier {
  _id: string;
  name: string;
  phone?: string;
  outstanding_amount: number;
  total_purchases?: number;
  total_paid?: number;
}

// Land
export interface Land {
  _id: string;
  name: string;
  area: number;
  area_unit: string;
  crop?: string;
  activity_count?: number;
  last_activity?: {
    date: string;
    category: string;
  };
}

// Activity
export interface Activity {
  _id: string;
  land_id: string;
  category: string;
  date: string;
  cycle_no: number;
  labour_cost: number;
  farm_inputs_used: Array<{
    item_id: string;
    qty: number;
    unit: string;
    unit_cost?: number;
  }>;
  photo_url?: string;
  notes?: string;
  created_daybook_id?: string;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Farmer
export interface Farmer {
  _id: string;
  name: string;
  mobileNumber: string;
  location: string;
  role: 'farmer' | 'admin';
}
