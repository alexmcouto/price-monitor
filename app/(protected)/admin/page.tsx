import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card } from '@/components/ui';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Get counts
  const [
    { count: totalAudits },
    { count: centralAudits },
    { count: ensulAudits },
    { count: productsCount },
    { count: clientsCount },
    { count: competitorsCount },
    { count: usersCount },
  ] = await Promise.all([
    supabase.from('price_audits').select('*', { count: 'exact', head: true }),
    supabase.from('price_audits').select('*', { count: 'exact', head: true })
      .eq('user_id', supabase.from('users').select('id').eq('sector', 'Central')),
    supabase.from('price_audits').select('*', { count: 'exact', head: true })
      .eq('user_id', supabase.from('users').select('id').eq('sector', 'Ensul')),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('competitors').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ]);

  // Get today's audits
  const today = new Date().toISOString().split('T')[0];
  const { count: todayAudits } = await supabase
    .from('price_audits')
    .select('*', { count: 'exact', head: true })
    .gte('audit_date', today);

  // Get recent audits
  const { data: recentAudits } = await supabase
    .from('price_audits')
    .select(`
      *,
      user:users(full_name, sector),
      product:products(name),
      client:clients(name),
      competitor:competitors(name)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  const quickLinks = [
    { href: '/admin/audits', label: 'All Audits', icon: '📊', count: totalAudits },
    { href: '/admin/products', label: 'Products', icon: '📦', count: productsCount },
    { href: '/admin/clients', label: 'Clients', icon: '🏪', count: clientsCount },
    { href: '/admin/competitors', label: 'Competitors', icon: '🎯', count: competitorsCount },
    { href: '/admin/export', label: 'Export Data', icon: '📥', count: null },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-orbitron text-2xl md:text-3xl text-neon-cyan mb-2">
          ADMIN DASHBOARD
        </h1>
        <p className="font-vt323 text-gray-400">
          System Overview • {usersCount} users registered
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <p className="font-vt323 text-gray-400 mb-1">Today</p>
          <p className="font-press-start text-2xl md:text-3xl text-neon-cyan">{todayAudits || 0}</p>
          <p className="font-vt323 text-xs text-gray-500 mt-1">audits</p>
        </Card>
        <Card className="text-center">
          <p className="font-vt323 text-gray-400 mb-1">Total</p>
          <p className="font-press-start text-2xl md:text-3xl text-neon-pink">{totalAudits || 0}</p>
          <p className="font-vt323 text-xs text-gray-500 mt-1">audits</p>
        </Card>
        <Card className="text-center">
          <p className="font-vt323 text-gray-400 mb-1">Central</p>
          <p className="font-press-start text-2xl md:text-3xl text-neon-purple">{centralAudits || 0}</p>
          <p className="font-vt323 text-xs text-gray-500 mt-1">audits</p>
        </Card>
        <Card className="text-center">
          <p className="font-vt323 text-gray-400 mb-1">Ensul</p>
          <p className="font-press-start text-2xl md:text-3xl text-neon-yellow">{ensulAudits || 0}</p>
          <p className="font-vt323 text-xs text-gray-500 mt-1">audits</p>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="text-center hover:scale-105 transition-transform cursor-pointer h-full">
              <span className="text-3xl block mb-2">{link.icon}</span>
              <p className="font-orbitron text-sm text-neon-cyan">{link.label}</p>
              {link.count !== null && (
                <p className="font-vt323 text-gray-500 text-sm">{link.count} items</p>
              )}
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-orbitron text-lg text-neon-pink">Recent Activity</h2>
          <Link href="/admin/audits" className="font-vt323 text-neon-cyan hover:underline">
            View All →
          </Link>
        </div>

        {recentAudits && recentAudits.length > 0 ? (
          <div className="space-y-2">
            {recentAudits.map((audit) => {
              const user = audit.user as { full_name: string; sector: string } | null;
              const product = audit.product as { name: string } | null;
              const client = audit.client as { name: string } | null;
              const competitor = audit.competitor as { name: string } | null;
              
              return (
                <Card key={audit.id} className="p-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-orbitron ${
                        user?.sector === 'Central' ? 'bg-neon-purple/20 text-neon-purple' : 'bg-neon-yellow/20 text-neon-yellow'
                      }`}>
                        {user?.sector}
                      </span>
                      <span className="font-vt323 text-sm text-gray-400">{user?.full_name}</span>
                    </div>
                    <div className="font-vt323 text-sm">
                      <span className="text-neon-cyan">{product?.name}</span>
                      <span className="text-gray-500"> @ </span>
                      <span className="text-white">{client?.name}</span>
                      <span className="text-gray-500"> vs </span>
                      <span className="text-neon-pink">{competitor?.name}</span>
                    </div>
                    <div className="font-vt323 text-sm text-gray-500">
                      {new Date(audit.created_at).toLocaleString()}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-8">
            <p className="font-vt323 text-gray-400">No audits yet</p>
          </Card>
        )}
      </div>
    </div>
  );
}
