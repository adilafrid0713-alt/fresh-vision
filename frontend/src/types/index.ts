export type QualityGrade = 'A' | 'B' | 'C' | 'Reject';
export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface DefectRegion {
  id: string;
  defect_type: 'Rot' | 'Bruise' | 'Discoloration' | 'Mechanical Damage' | 'Normal';
  severity: number;           // 0 to 1
  area_percentage: number;    // % of total surface area
  bbox: [number, number, number, number]; // [xmin, ymin, xmax, ymax]
}

export interface DetectedItem {
  id: string;                               // e.g., "ITEM-01"
  name: string;                             // e.g., "Apple #1 (Top-Left)"
  food_type: string;                        // e.g., "Apple (Fuji)"
  bbox: [number, number, number, number];   // [ymin, xmin, ymax, xmax] on a 0-1000 grid
  consumption_status: 'Good to Consume' | 'Processing / Juice Only' | 'Not Good to Consume (Discard)';
  summary: string;                          // Detailed item-specific condition summary
  good_bad_explanation: {
    why_good: string;                       // Positive qualities and why it is safe/good to consume
    why_bad: string;                        // Specific defects, rot, bruising, or why it is bad/unsafe
  };
  metrics: {
    freshness_score: number;
    quality_grade: QualityGrade;
    damage_percentage: number;
    confidence: number;
  };
  defects?: DefectRegion[];
}

export interface InspectionMetrics {
  freshness_score: number;    // 0 to 100%
  confidence: number;         // 0 to 100%
  damage_percentage: number;  // 0 to 100%
  shelf_life_days: number;    // e.g., 14.5
  quality_grade: QualityGrade;
  risk_level: RiskLevel;
  recommendation: string;
  chromaticity_index?: number;
  structural_integrity_index?: number;
  defect_freedom_index?: number;
}

export interface SpoilagePoint {
  day: number;
  coldStorageScore: number;
  roomTempScore: number;
  status: string;
}

export interface SpoilageData {
  initialFreshness: number;
  projectedShelfLifeDays: number;
  optimalProcessingCutoffDay: number;
  discardCutoffDay: number;
  curve: SpoilagePoint[];
}

export interface AIPricingData {
  qualityGrade: QualityGrade;
  freshnessScore: number;
  suggestedDiscountPercent: number;
  pricingCategory: string;
  reasoning: string;
}

export interface InspectionRecord {
  id: string;
  batch_id: string;
  timestamp: string;
  food_type: string;
  metrics: InspectionMetrics;
  defects: DefectRegion[];
  detected_items?: DetectedItem[];          // Individual item breakdown for multi-item or single-item uploads
  raw_image_url: string;
  annotated_image_url?: string;
  heatmap_image_url?: string;
  pdf_report_url?: string;
  spoilage_data?: SpoilageData;
  ai_pricing?: AIPricingData;
  processing_time_ms: number;
  isCached?: boolean;
}

export interface InspectionBatch {
  id: string;
  created_at: string;
  inspector_name: string;
  factory_line: string;
  total_items: number;
  accepted_items: number;
  rejected_items: number;
  avg_freshness: number;
  avg_shelf_life: number;
  records?: InspectionRecord[];
}

export interface DashboardAnalytics {
  today_inspections: number;
  accepted_count: number;
  rejected_count: number;
  acceptance_ratio: number;
  avg_freshness: number;
  avg_confidence: number;
  avg_shelf_life: number;
  inspection_trends: { date: string; accepted: number; rejected: number }[];
  food_categories: { name: string; value: number; color: string }[];
  defect_frequency: { defect: string; count: number }[];
  recent_inspections: InspectionRecord[];
}

export interface SystemSetting {
  key: string;
  value: string | number | boolean;
  description: string;
  category: 'AI Pipeline' | 'Alerts' | 'Factory Line' | 'Reporting';
}

export interface UploadResponse {
  file_id: string;
  url: string;
  filename: string;
  size_bytes: number;
}
