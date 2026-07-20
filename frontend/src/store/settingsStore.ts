import { create } from 'zustand';
import type { SystemSetting } from '../types';

interface SettingsState {
  settings: SystemSetting[];
  updateSetting: (key: string, value: string | number | boolean) => void;
  resetSettings: () => void;
}

const defaultSettings: SystemSetting[] = [
  { key: 'ai_confidence_threshold', value: 0.70, description: 'Minimum confidence score required for YOLOv8 bounding box detection', category: 'AI Pipeline' },
  { key: 'freshness_weight_color', value: 0.35, description: 'Weight given to HSV histogram browning degradation in freshness math model', category: 'AI Pipeline' },
  { key: 'freshness_weight_texture', value: 0.25, description: 'Weight given to scikit-image GLCM contrast variance in freshness model', category: 'AI Pipeline' },
  { key: 'freshness_weight_damage', value: 0.40, description: 'Weight given to surface defect area percentage in freshness model', category: 'AI Pipeline' },
  { key: 'auto_reject_grade_c', value: false, description: 'Automatically flag Grade C items for secondary human QA inspection', category: 'Alerts' },
  { key: 'factory_line_id', value: 'Main Conveyor Line 1', description: 'Active conveyor belt monitoring line identifier', category: 'Factory Line' },
  { key: 'embed_qr_code', value: true, description: 'Embed verification QR code on generated PDF certificates', category: 'Reporting' },
];

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  updateSetting: (key, value) => set((state) => ({
    settings: state.settings.map((s) => s.key === key ? { ...s, value } : s)
  })),
  resetSettings: () => set({ settings: defaultSettings }),
}));
