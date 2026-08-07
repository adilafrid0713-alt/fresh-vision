const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface MediaItem {
  id: string;
  userId: string;
  folderId: string | null;
  url: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  foodName: string | null;
  freshnessScore: number | null;
  aiGrade: string | null;
  ocrText: string | null;
  barcodeData: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
  folder?: { id: string; name: string };
}

export const mediaService = {
  async getMedia(): Promise<MediaItem[]> {
    const response = await fetch(`${API_URL}/media`);
    if (!response.ok) throw new Error('Failed to fetch media');
    return response.json();
  },

  async uploadMedia(data: Partial<MediaItem>): Promise<MediaItem> {
    const response = await fetch(`${API_URL}/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to upload media');
    return response.json();
  },
};
