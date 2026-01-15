'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, Button, Input, Select } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { exportAuditsToExcel } from '@/lib/utils/excel-export';
import { PriceAuditWithRelations } from '@/lib/types/database';

export default function ExportPage() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    sector: '',
  });
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  const handlePreview = async () => {
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      
      let query = supabase
        .from('price_audits')
        .select(`
          *,
          user:users(id, full_name, sector, email),
          product:products(name, category, unit),
          client:clients(name, location),
          competitor:competitors(name, location)
        `, { count: 'exact' });

      if (filters.startDate) {
        query = query.gte('audit_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('audit_date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data as unknown as PriceAuditWithRelations[];
      
      // Filter by sector
      if (filters.sector) {
        filteredData = filteredData.filter(
          (audit) => (audit.user as { sector: string } | undefined)?.sector === filters.sector
        );
      }

      setPreviewCount(filteredData.length);
      showToast('info', `Found ${filteredData.length} audits matching your filters`);
      
    } catch (error) {
      showToast('error', 'Failed to preview data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      
      let query = supabase
        .from('price_audits')
        .select(`
          *,
          user:users(id, full_name, sector, email),
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

      if (error) throw error;

      let filteredData = data as unknown as PriceAuditWithRelations[];
      
      // Filter by sector
      if (filters.sector) {
        filteredData = filteredData.filter(
          (audit) => (audit.user as { sector: string } | undefined)?.sector === filters.sector
        );
      }

      if (filteredData.length === 0) {
        showToast('error', 'No data to export with current filters');
        return;
      }

      // Generate filename based on filters
      let filename = 'price-audits';
      if (filters.sector) {
        filename += `-${filters.sector.toLowerCase()}`;
      }
      if (filters.startDate || filters.endDate) {
        filename += `-${filters.startDate || 'start'}-to-${filters.endDate || 'now'}`;
      }

      exportAuditsToExcel(filteredData, filename);
      showToast('success', `Exported ${filteredData.length} audits to Excel`);
      
    } catch (error) {
      showToast('error', 'Failed to export data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '', sector: '' });
    setPreviewCount(null);
  };

  // Set default dates (last 30 days)
  const setLast30Days = () => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    setFilters({
      ...filters,
      startDate: startDate.toISOString().split('T')[0],
      endDate,
    });
  };

  const setThisMonth = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];
    setFilters({ ...filters, startDate, endDate });
  };

  const setLastMonth = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    setFilters({ ...filters, startDate, endDate });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="font-orbitron text-2xl text-neon-cyan mb-6">
        EXPORT TO EXCEL
      </h1>

      <Card className="mb-6">
        <h2 className="font-orbitron text-lg text-neon-pink mb-4">
          Filter Options
        </h2>

        <div className="space-y-6">
          {/* Quick Date Presets */}
          <div>
            <label className="block text-neon-cyan font-orbitron text-sm uppercase tracking-wider mb-2">
              Quick Select
            </label>
            <div className="flex flex-wrap gap-2">
              <Button onClick={setLast30Days} variant="ghost" size="sm">
                Last 30 Days
              </Button>
              <Button onClick={setThisMonth} variant="ghost" size="sm">
                This Month
              </Button>
              <Button onClick={setLastMonth} variant="ghost" size="sm">
                Last Month
              </Button>
              <Button onClick={clearFilters} variant="ghost" size="sm">
                All Time
              </Button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Sector Filter */}
          <Select
            label="Sector"
            value={filters.sector}
            onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
            placeholder="All Sectors"
            options={[
              { value: '', label: 'All Sectors' },
              { value: 'Central', label: 'Central (Food Distribution)' },
              { value: 'Ensul', label: 'Ensul (Construction)' },
            ]}
          />
        </div>
      </Card>

      {/* Preview and Export */}
      <Card>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1">
            {previewCount !== null ? (
              <p className="font-vt323 text-lg">
                <span className="text-neon-cyan">{previewCount}</span> audits match your filters
              </p>
            ) : (
              <p className="font-vt323 text-gray-400">
                Click &quot;Preview&quot; to see how many records will be exported
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handlePreview}
              variant="secondary"
              isLoading={isLoading}
            >
              Preview Count
            </Button>
            <Button
              onClick={handleExport}
              variant="primary"
              isLoading={isLoading}
            >
              📥 Export Excel
            </Button>
          </div>
        </div>
      </Card>

      {/* Export Info */}
      <div className="mt-8">
        <h2 className="font-orbitron text-lg text-neon-cyan mb-4">
          Export Contents
        </h2>
        <Card className="p-4">
          <p className="font-vt323 text-gray-300 mb-3">
            The exported Excel file will include:
          </p>
          <ul className="font-vt323 text-gray-400 space-y-2">
            <li>• Audit Date</li>
            <li>• Field Worker Name & Sector</li>
            <li>• Product Name, Category & Unit</li>
            <li>• Client Name & Location</li>
            <li>• Competitor Name</li>
            <li>• Our Price & Competitor Price</li>
            <li>• Price Difference ($ and %)</li>
            <li>• Photo URL</li>
            <li>• Notes</li>
            <li>• Created Timestamp</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
