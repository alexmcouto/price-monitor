# Price Monitor - Timor-Leste Market Intelligence

A professional-grade mobile web application for field workers to monitor and audit market prices in Timor-Leste. Built with Next.js 14, Supabase, and a retro 80s aesthetic.

## Features

- **Email/Password Authentication** with role-based access (Admin / Field Worker)
- **Price Audit Submission** with product, client, and competitor selection
- **Photo Upload** with automatic compression (max 500KB)
- **Sector-based Data** filtering (Central - Food Distribution, Ensul - Construction)
- **Admin Dashboard** with CRUD operations for products, clients, and competitors
- **Export to Excel** with date range and sector filters
- **Mobile-first Design** with retro 80s neon aesthetic
- **PWA Support** for "Add to Home Screen"

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Hosting**: Vercel (with GitHub CI/CD)

## Getting Started

### 1. Clone and Install

```bash
cd price-monitor
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings > API** and copy:
   - Project URL
   - Anon/Public key

3. Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Run Database Migrations

1. Go to Supabase Dashboard > **SQL Editor**
2. Copy and run the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the contents of `supabase/seed.sql` to populate test data

### 4. Set Up Storage Bucket

1. Go to Supabase Dashboard > **Storage**
2. Create a new bucket named `price-audit-photos`
3. Set the bucket to **Public** (for photo viewing)
4. Add the following policies:

**INSERT Policy** (Allow authenticated uploads):
```sql
CREATE POLICY "Users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'price-audit-photos' 
  AND auth.uid() IS NOT NULL
);
```

**SELECT Policy** (Allow public viewing):
```sql
CREATE POLICY "Public can view photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'price-audit-photos');
```

### 5. Create Test Users

1. Go to Supabase Dashboard > **Authentication > Users**
2. Click "Add User" and create test accounts:

| Email | Password | Metadata |
|-------|----------|----------|
| admin@central.tl | Test123! | `{"full_name": "Admin User", "role": "admin", "sector": "Central"}` |
| worker1@central.tl | Test123! | `{"full_name": "Maria Santos", "role": "field_worker", "sector": "Central"}` |
| worker1@ensul.tl | Test123! | `{"full_name": "João Silva", "role": "field_worker", "sector": "Ensul"}` |

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
price-monitor/
├── app/
│   ├── (auth)/              # Auth pages (login)
│   ├── (protected)/         # Protected routes
│   │   ├── dashboard/       # Field worker dashboard
│   │   ├── audit/          # Audit creation and history
│   │   └── admin/          # Admin dashboard and CRUD
│   ├── auth/callback/      # Auth callback handler
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # Reusable UI components
│   └── layout/             # Navigation components
├── lib/
│   ├── supabase/           # Supabase client utilities
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── supabase/
│   ├── migrations/         # Database schema
│   └── seed.sql           # Test data
└── public/                 # Static assets
```

## User Roles

### Field Worker
- View dashboard with personal stats
- Create new price audits
- View personal audit history
- Access products/clients/competitors for their sector

### Admin
- Full dashboard with system-wide stats
- View all audits from all users
- CRUD operations for products, clients, competitors
- Export data to Excel

## Database Schema

- **users**: User profiles linked to Supabase Auth
- **products**: Products by sector (Central/Ensul)
- **clients**: Client locations by sector
- **competitors**: Competitor companies by sector
- **price_audits**: Price audit records with photos

## Deployment to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

5. Update Supabase Auth redirect URLs:
   - Go to Supabase > Authentication > URL Configuration
   - Add your Vercel domain to "Redirect URLs"

## Mobile-First Design

The app is optimized for mobile field workers:
- Touch-friendly buttons (min 44px tap targets)
- Bottom navigation on mobile
- Camera integration for photo capture
- Automatic image compression

## Retro 80s Aesthetic

The UI features a distinctive retro 80s style with:
- Neon color palette (cyan, pink, purple)
- Orbitron and VT323 fonts
- Grid background patterns
- Glow effects and animations

## License

Private - All rights reserved
