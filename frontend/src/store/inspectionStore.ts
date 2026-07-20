import { create } from 'zustand';
import type { InspectionRecord, UploadResponse } from '../types';

interface InspectionState {
  currentUpload: UploadResponse | null;
  isUploading: boolean;
  isProcessing: boolean;
  processingStage: number; // 0 to 8
  activeInspection: InspectionRecord | null;
  recentInspections: InspectionRecord[];
  activeBatchNo: string;
  selectedFoodTypeHint: string;
  
  // Actions
  setUpload: (upload: UploadResponse | null) => void;
  setIsUploading: (status: boolean) => void;
  setIsProcessing: (status: boolean) => void;
  setProcessingStage: (stage: number) => void;
  setActiveInspection: (record: InspectionRecord | null) => void;
  addRecentInspection: (record: InspectionRecord) => void;
  setActiveBatchNo: (batchNo: string) => void;
  setSelectedFoodTypeHint: (hint: string) => void;
  resetWorkflow: () => void;
}

export const useInspectionStore = create<InspectionState>((set) => ({
  currentUpload: null,
  isUploading: false,
  isProcessing: false,
  processingStage: 0,
  activeInspection: null,
  recentInspections: [],
  activeBatchNo: `BAT-2026-${Math.floor(1000 + Math.random() * 9000)}-A`,
  selectedFoodTypeHint: 'Auto-Detect',

  setUpload: (upload) => set({ currentUpload: upload }),
  setIsUploading: (status) => set({ isUploading: status }),
  setIsProcessing: (status) => set({ isProcessing: status }),
  setProcessingStage: (stage) => set({ processingStage: stage }),
  setActiveInspection: (record) => set({ activeInspection: record }),
  addRecentInspection: (record) => set((state) => ({
    recentInspections: [record, ...state.recentInspections.slice(0, 19)]
  })),
  setActiveBatchNo: (batchNo) => set({ activeBatchNo: batchNo }),
  setSelectedFoodTypeHint: (hint) => set({ selectedFoodTypeHint: hint }),
  resetWorkflow: () => set({
    currentUpload: null,
    isUploading: false,
    isProcessing: false,
    processingStage: 0,
    activeInspection: null,
  }),
}));
