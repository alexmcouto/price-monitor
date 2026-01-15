import * as XLSX from 'xlsx';
import { PriceAuditWithRelations } from '@/lib/types/database';

export interface ExportFilters {
  startDate?: string;
  endDate?: string;
  sector?: string;
}

export function exportAuditsToExcel(
  audits: PriceAuditWithRelations[],
  filename: string = 'price-audits'
): void {
  // Transform data for export
  const exportData = audits.map((audit) => ({
    'Audit Date': new Date(audit.audit_date).toLocaleDateString(),
    'Field Worker': audit.user?.full_name || 'Unknown',
    'Sector': audit.user?.sector || 'Unknown',
    'Product': audit.product?.name || 'Unknown',
    'Category': audit.product?.category || 'Unknown',
    'Unit': audit.product?.unit || 'Unknown',
    'Client': audit.client?.name || 'Unknown',
    'Client Location': audit.client?.location || 'Unknown',
    'Competitor': audit.competitor?.name || 'Unknown',
    'Our Price ($)': audit.our_price,
    'Competitor Price ($)': audit.competitor_price,
    'Price Difference ($)': (audit.competitor_price - audit.our_price).toFixed(2),
    'Price Difference (%)': audit.our_price > 0 
      ? (((audit.competitor_price - audit.our_price) / audit.our_price) * 100).toFixed(1) + '%'
      : 'N/A',
    'Photo URL': audit.photo_url || 'No photo',
    'Notes': audit.notes || '',
    'Created At': new Date(audit.created_at).toLocaleString(),
  }));

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  
  // Set column widths
  const columnWidths = [
    { wch: 12 }, // Audit Date
    { wch: 20 }, // Field Worker
    { wch: 10 }, // Sector
    { wch: 25 }, // Product
    { wch: 15 }, // Category
    { wch: 8 },  // Unit
    { wch: 25 }, // Client
    { wch: 20 }, // Client Location
    { wch: 20 }, // Competitor
    { wch: 12 }, // Our Price
    { wch: 15 }, // Competitor Price
    { wch: 15 }, // Price Difference
    { wch: 15 }, // Price Difference %
    { wch: 50 }, // Photo URL
    { wch: 30 }, // Notes
    { wch: 18 }, // Created At
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Price Audits');

  // Generate filename with date
  const date = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${date}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, fullFilename);
}

export function filterAudits(
  audits: PriceAuditWithRelations[],
  filters: ExportFilters
): PriceAuditWithRelations[] {
  return audits.filter((audit) => {
    // Filter by date range
    if (filters.startDate) {
      const auditDate = new Date(audit.audit_date);
      const startDate = new Date(filters.startDate);
      if (auditDate < startDate) return false;
    }
    
    if (filters.endDate) {
      const auditDate = new Date(audit.audit_date);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      if (auditDate > endDate) return false;
    }

    // Filter by sector
    if (filters.sector && audit.user?.sector !== filters.sector) {
      return false;
    }

    return true;
  });
}
