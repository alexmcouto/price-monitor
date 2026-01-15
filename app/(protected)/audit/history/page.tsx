import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui';
import Link from 'next/link';

export default async function AuditHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get all audits for the current user
  const { data: audits } = await supabase
    .from('price_audits')
    .select(`
      *,
      product:products(name, unit, category),
      client:clients(name, location),
      competitor:competitors(name)
    `)
    .eq('user_id', user?.id)
    .order('audit_date', { ascending: false });

  // Group audits by date
  const groupedAudits: Record<string, typeof audits> = {};
  audits?.forEach((audit) => {
    const date = new Date(audit.audit_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groupedAudits[date]) {
      groupedAudits[date] = [];
    }
    groupedAudits[date]!.push(audit);
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-orbitron text-2xl text-neon-cyan">
          AUDIT HISTORY
        </h1>
        <Link href="/audit/new">
          <span className="retro-btn retro-btn-primary px-4 py-2 text-sm">
            + New Audit
          </span>
        </Link>
      </div>

      {audits && audits.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedAudits).map(([date, dateAudits]) => (
            <div key={date}>
              <h2 className="font-vt323 text-lg text-neon-pink mb-3 sticky top-16 bg-dark-bg/90 backdrop-blur-sm py-2 z-10">
                {date}
                <span className="text-gray-500 ml-2">({dateAudits?.length} audits)</span>
              </h2>
              
              <div className="space-y-3">
                {dateAudits?.map((audit) => {
                  const product = audit.product as { name: string; unit: string; category: string } | null;
                  const client = audit.client as { name: string; location: string } | null;
                  const competitor = audit.competitor as { name: string } | null;
                  const priceDiff = audit.competitor_price - audit.our_price;
                  
                  return (
                    <Card key={audit.id} className="p-4">
                      <div className="flex gap-4">
                        {/* Photo thumbnail */}
                        {audit.photo_url && (
                          <a
                            href={audit.photo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0"
                          >
                            <img
                              src={audit.photo_url}
                              alt="Price tag"
                              className="w-16 h-16 object-cover rounded-lg border border-neon-cyan/30 hover:border-neon-cyan transition-colors"
                            />
                          </a>
                        )}
                        
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <p className="font-orbitron text-sm text-neon-cyan truncate">
                                {product?.name || 'Unknown Product'}
                              </p>
                              <p className="font-vt323 text-gray-400 text-sm">
                                {product?.category} • {product?.unit}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className={`font-press-start text-sm ${
                                priceDiff > 0 ? 'text-neon-cyan' : priceDiff < 0 ? 'text-neon-pink' : 'text-gray-400'
                              }`}>
                                {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            <span className="font-vt323 text-gray-500">
                              📍 {client?.name || 'Unknown'}
                            </span>
                            <span className="font-vt323 text-gray-500">
                              🏪 vs {competitor?.name || 'Unknown'}
                            </span>
                          </div>
                          
                          <div className="mt-2 flex gap-4 text-sm">
                            <span className="font-vt323">
                              <span className="text-gray-500">Ours:</span>{' '}
                              <span className="text-neon-pink">${audit.our_price}</span>
                            </span>
                            <span className="font-vt323">
                              <span className="text-gray-500">Theirs:</span>{' '}
                              <span className="text-white">${audit.competitor_price}</span>
                            </span>
                          </div>
                          
                          {audit.notes && (
                            <p className="mt-2 font-vt323 text-sm text-gray-400 italic truncate">
                              &quot;{audit.notes}&quot;
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <span className="text-6xl mb-4 block">📋</span>
          <p className="font-orbitron text-xl text-gray-400 mb-2">No audits yet</p>
          <p className="font-vt323 text-gray-500 mb-6">
            Start recording competitor prices to see your history
          </p>
          <Link href="/audit/new">
            <span className="retro-btn retro-btn-primary px-6 py-3">
              Create First Audit
            </span>
          </Link>
        </Card>
      )}
    </div>
  );
}
