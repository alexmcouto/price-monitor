'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, Input, Select, Button } from '@/components/ui';
import { PriceAuditWithRelations } from '@/lib/types/database';

export default function AllAuditsPage() {
  const [audits, setAudits] = useState<PriceAuditWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    sector: '',
    startDate: '',
    endDate: '',
  });

  const loadAudits = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('price_audits')
      .select(`
        *,
        user:users(id, full_name, sector),
        product:products(name, category, unit),
        client:clients(name, location),
        competitor:competitors(name, location)
      `)
      .order('audit_date', { ascending: false });

    if (filters.startDate) {
      query = query.gte('audit_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('audit_date', filters.endDate);
    }

    const { data, error } = await query;

    if (!error && data) {
      let filteredData = data as unknown as PriceAuditWithRelations[];
      
      // Filter by sector (need to do this client-side due to nested relation)
      if (filters.sector) {
        filteredData = filteredData.filter(
          (audit) => (audit.user as { sector: string } | undefined)?.sector === filters.sector
        );
      }
      
      setAudits(filteredData);
    }
    
    setIsLoading(false);
  }, [filters.startDate, filters.endDate, filters.sector]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAudits();
  }, [loadAudits]);

  const handleFilter = () => {
    loadAudits();
  };

  const clearFilters = () => {
    setFilters({ sector: '', startDate: '', endDate: '' });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <h1 className="font-orbitron text-2xl text-neon-cyan mb-6">
        ALL PRICE AUDITS
      </h1>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Sector"
            value={filters.sector}
            onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
            placeholder="All Sectors"
            options={[
              { value: '', label: 'All Sectors' },
              { value: 'Central', label: 'Central (Food)' },
              { value: 'Ensul', label: 'Ensul (Construction)' },
            ]}
          />
          <Input
            type="date"
            label="Start Date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <Input
            type="date"
            label="End Date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
          <div className="flex items-end gap-2">
            <Button onClick={handleFilter} variant="primary" className="flex-1">
              Filter
            </Button>
            <Button onClick={clearFilters} variant="ghost">
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="retro-spinner w-12 h-12" />
        </div>
      ) : audits.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neon-cyan/30">
                <th className="text-left p-3 font-orbitron text-sm text-neon-cyan">Date</th>
                <th className="text-left p-3 font-orbitron text-sm text-neon-cyan">User</th>
                <th className="text-left p-3 font-orbitron text-sm text-neon-cyan">Product</th>
                <th className="text-left p-3 font-orbitron text-sm text-neon-cyan">Client</th>
                <th className="text-left p-3 font-orbitron text-sm text-neon-cyan">Competitor</th>
                <th className="text-right p-3 font-orbitron text-sm text-neon-cyan">Our $</th>
                <th className="text-right p-3 font-orbitron text-sm text-neon-cyan">Their $</th>
                <th className="text-right p-3 font-orbitron text-sm text-neon-cyan">Diff</th>
                <th className="text-center p-3 font-orbitron text-sm text-neon-cyan">Photo</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((audit) => {
                const user = audit.user as { full_name: string; sector: string } | undefined;
                const product = audit.product as { name: string; category: string } | undefined;
                const client = audit.client as { name: string } | undefined;
                const competitor = audit.competitor as { name: string } | undefined;
                const diff = audit.competitor_price - audit.our_price;
                
                return (
                  <tr key={audit.id} className="border-b border-gray-800 hover:bg-neon-cyan/5">
                    <td className="p-3 font-vt323 text-gray-300">
                      {new Date(audit.audit_date).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <span className="font-vt323 text-gray-300">{user?.full_name}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-orbitron ${
                        user?.sector === 'Central' 
                          ? 'bg-neon-purple/20 text-neon-purple' 
                          : 'bg-neon-yellow/20 text-neon-yellow'
                      }`}>
                        {user?.sector}
                      </span>
                    </td>
                    <td className="p-3 font-vt323 text-neon-cyan">{product?.name}</td>
                    <td className="p-3 font-vt323 text-gray-400">{client?.name}</td>
                    <td className="p-3 font-vt323 text-gray-400">{competitor?.name}</td>
                    <td className="p-3 font-vt323 text-right text-neon-pink">
                      ${audit.our_price.toFixed(2)}
                    </td>
                    <td className="p-3 font-vt323 text-right text-white">
                      ${audit.competitor_price.toFixed(2)}
                    </td>
                    <td className={`p-3 font-press-start text-xs text-right ${
                      diff > 0 ? 'text-neon-cyan' : diff < 0 ? 'text-neon-pink' : 'text-gray-400'
                    }`}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      {audit.photo_url ? (
                        <a
                          href={audit.photo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neon-cyan hover:text-neon-pink"
                        >
                          📷
                        </a>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="font-vt323 text-xl text-gray-400">No audits found</p>
          <p className="font-vt323 text-gray-500 mt-2">Try adjusting your filters</p>
        </Card>
      )}

      <p className="mt-4 font-vt323 text-gray-500 text-sm">
        Showing {audits.length} audit{audits.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
