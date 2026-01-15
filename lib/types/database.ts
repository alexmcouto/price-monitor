// Database types for Supabase tables
// These types mirror the database schema

export type UserRole = 'admin' | 'field_worker';
export type Sector = 'Central' | 'Ensul';
export type ProductUnit = 'kg' | 'piece' | 'bag' | 'liter' | 'meter' | 'sheet';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  sector: Sector;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: ProductUnit;
  sector: Sector;
  is_active: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  location: string;
  contact_phone: string | null;
  sector: Sector;
  is_active: boolean;
  created_at: string;
}

export interface Competitor {
  id: string;
  name: string;
  location: string;
  sector: Sector;
  is_active: boolean;
  created_at: string;
}

export interface PriceAudit {
  id: string;
  user_id: string;
  product_id: string;
  client_id: string;
  competitor_id: string;
  our_price: number;
  competitor_price: number;
  photo_url: string | null;
  notes: string | null;
  audit_date: string;
  created_at: string;
}

// Extended types with relations for display
export interface PriceAuditWithRelations extends PriceAudit {
  user?: User;
  product?: Product;
  client?: Client;
  competitor?: Competitor;
}

// Form input types
export interface CreatePriceAuditInput {
  product_id: string;
  client_id: string;
  competitor_id: string;
  our_price: number;
  competitor_price: number;
  photo_url?: string;
  notes?: string;
  audit_date: string;
}

export interface CreateProductInput {
  name: string;
  category: string;
  unit: ProductUnit;
  sector: Sector;
}

export interface CreateClientInput {
  name: string;
  location: string;
  contact_phone?: string;
  sector: Sector;
}

export interface CreateCompetitorInput {
  name: string;
  location: string;
  sector: Sector;
}

// Database response type for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'is_active'>;
        Update: Partial<Omit<Product, 'id' | 'created_at'>>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'created_at' | 'is_active'>;
        Update: Partial<Omit<Client, 'id' | 'created_at'>>;
      };
      competitors: {
        Row: Competitor;
        Insert: Omit<Competitor, 'id' | 'created_at' | 'is_active'>;
        Update: Partial<Omit<Competitor, 'id' | 'created_at'>>;
      };
      price_audits: {
        Row: PriceAudit;
        Insert: Omit<PriceAudit, 'id' | 'created_at'>;
        Update: Partial<Omit<PriceAudit, 'id' | 'created_at'>>;
      };
    };
  };
}
