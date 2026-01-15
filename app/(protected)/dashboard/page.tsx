import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card } from '@/components/ui';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get user profile
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user?.id)
    .single();

  // Get today's audits count
  const today = new Date().toISOString().split('T')[0];
  const { count: todayCount } = await supabase
    .from('price_audits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)
    .gte('audit_date', today);

  // Get this week's audits count
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: weekCount } = await supabase
    .from('price_audits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)
    .gte('audit_date', weekAgo.toISOString());

  // Get recent audits
  const { data: recentAudits } = await supabase
    .from('price_audits')
    .select(`
      *,
      product:products(name),
      client:clients(name),
      competitor:competitors(name)
    `)
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="font-orbitron text-2xl md:text-3xl text-neon-cyan mb-2">
          Welcome back
        </h1>
        <p className="font-press-start text-lg md:text-xl gradient-text">
          {userData?.full_name}
        </p>
        <p className="font-vt323 text-gray-400 mt-2">
          Sector: <span className="text-neon-pink">{userData?.sector}</span>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="text-center">
          <p className="font-vt323 text-gray-400 mb-2">Today</p>
          <p className="font-press-start text-3xl text-neon-cyan">{todayCount || 0}</p>
          <p className="font-vt323 text-sm text-gray-500 mt-1">audits</p>
        </Card>
        <Card className="text-center">
          <p className="font-vt323 text-gray-400 mb-2">This Week</p>
          <p className="font-press-start text-3xl text-neon-pink">{weekCount || 0}</p>
          <p className="font-vt323 text-sm text-gray-500 mt-1">audits</p>
        </Card>
      </div>

      {/* New Audit CTA */}
      <Link href="/audit/new">
        <Card variant="glow" className="mb-8 cursor-pointer hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-orbitron text-xl text-neon-pink mb-2">
                NEW PRICE AUDIT
              </h2>
              <p className="font-vt323 text-gray-400">
                Record competitor prices with photo proof
              </p>
            </div>
            <div className="text-4xl">📸</div>
          </div>
        </Card>
      </Link>

      {/* Recent Audits */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-orbitron text-lg text-neon-cyan">Recent Audits</h2>
          <Link href="/audit/history" className="font-vt323 text-neon-pink hover:underline">
            View All →
          </Link>
        </div>

        {recentAudits && recentAudits.length > 0 ? (
          <div className="space-y-3">
            {recentAudits.map((audit) => (
              <Card key={audit.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-orbitron text-sm text-neon-cyan">
                      {(audit.product as { name: string } | null)?.name || 'Unknown Product'}
                    </p>
                    <p className="font-vt323 text-gray-400 text-sm">
                      @ {(audit.client as { name: string } | null)?.name || 'Unknown Client'}
                    </p>
                    <p className="font-vt323 text-gray-500 text-xs mt-1">
                      vs {(audit.competitor as { name: string } | null)?.name || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-vt323 text-neon-pink">
                      ${audit.our_price} <span className="text-gray-500">vs</span> ${audit.competitor_price}
                    </p>
                    <p className="font-vt323 text-gray-500 text-xs">
                      {new Date(audit.audit_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <p className="font-vt323 text-gray-400">No audits yet</p>
            <p className="font-vt323 text-neon-cyan mt-2">
              Start by creating your first price audit!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
