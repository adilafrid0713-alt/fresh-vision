import * as XLSX from 'xlsx';
import type { InspectionRecord } from '../types';

export function exportInspectionsToExcel(records: InspectionRecord[], filename = 'FreshVision_Quality_Audit_Export.xlsx') {
  // Sheet 1: Inspection Summary & Metrics Log
  const summaryRows = records.map((rec) => ({
    'Inspection ID': rec.id,
    'Batch ID': rec.batch_id,
    'Timestamp': rec.timestamp,
    'Food / Crop Type': rec.food_type,
    'Freshness Score (%)': rec.metrics.freshness_score,
    'Quality Grade': rec.metrics.quality_grade,
    'Risk Level': rec.metrics.risk_level,
    'Damage Surface Area (%)': rec.metrics.damage_percentage,
    'Est. Shelf Life (Days)': rec.metrics.shelf_life_days,
    'AI Confidence (%)': rec.metrics.confidence,
    'Industrial Recommendation': rec.metrics.recommendation,
  }));

  const worksheetSummary = XLSX.utils.json_to_sheet(summaryRows);
  // Auto column width padding
  const summaryCols = [
    { wch: 16 },
    { wch: 18 },
    { wch: 12 },
    { wch: 22 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 22 },
    { wch: 20 },
    { wch: 16 },
    { wch: 45 },
  ];
  worksheetSummary['!cols'] = summaryCols;

  // Sheet 2: Defect Detailed Log
  const defectRows: any[] = [];
  records.forEach((rec) => {
    if (rec.defects && rec.defects.length > 0) {
      rec.defects.forEach((def) => {
        defectRows.push({
          'Inspection ID': rec.id,
          'Batch ID': rec.batch_id,
          'Crop Type': rec.food_type,
          'Defect ID': def.id,
          'Defect Classification': def.defect_type,
          'Severity Rating (0-1)': def.severity,
          'Affected Area (%)': def.area_percentage,
          'Bounding Box (xmin,ymin,xmax,ymax)': JSON.stringify(def.bbox),
        });
      });
    }
  });

  const worksheetDefects = XLSX.utils.json_to_sheet(defectRows.length > 0 ? defectRows : [{ Message: 'No active surface defects detected across records.' }]);

  // Sheet 3: Individual Produce Item Breakdown
  const itemRows: any[] = [];
  records.forEach((rec) => {
    if (rec.detected_items && rec.detected_items.length > 0) {
      rec.detected_items.forEach((item) => {
        itemRows.push({
          'Inspection ID': rec.id,
          'Item Code': item.id,
          'Item Name': item.name,
          'Food Sub-Type': item.food_type,
          'Status': item.consumption_status,
          'Freshness Score (%)': item.metrics.freshness_score,
          'Quality Grade': item.metrics.quality_grade,
          'Damage Surface (%)': item.metrics.damage_percentage,
          'Biological Positive Traits': item.good_bad_explanation.why_good,
          'Defects & Tissue Risk': item.good_bad_explanation.why_bad,
        });
      });
    }
  });

  const worksheetItems = XLSX.utils.json_to_sheet(itemRows.length > 0 ? itemRows : [{ Message: 'No individual item breakdowns recorded.' }]);

  // Create Workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheetSummary, 'Audit Log Summary');
  XLSX.utils.book_append_sheet(workbook, worksheetDefects, 'Defect Breakdown');
  XLSX.utils.book_append_sheet(workbook, worksheetItems, 'Individual Item Breakdown');

  // Trigger Download
  XLSX.writeFile(workbook, filename);
}
