const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface MarketProduct {
  id: string;
  sellerId: string;
  categoryId: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  originalPrice: number;
  sellingPrice: number;
  minOrderQuantity: number;
  expiryDate: string;
  freshnessScore: number | null;
  qualityGrade: string | null;
  pickupAvailable: boolean;
  homeDelivery: boolean;
  village: string | null;
  district: string | null;
  state: string | null;
  pinCode: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  contactWhatsApp?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  seller?: { name: string; email?: string };
  category?: { id: string; name: string };
  images?: { id: string; url: string; isPrimary: boolean }[];
}

export const marketService = {
  async getProducts(): Promise<MarketProduct[]> {
    const response = await fetch(`${API_URL}/market`);
    if (!response.ok) throw new Error('Failed to fetch market products');
    return response.json();
  },

  async getProduct(id: string): Promise<MarketProduct> {
    const response = await fetch(`${API_URL}/market/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product details');
    return response.json();
  },

  async getMyProducts(sellerId: string): Promise<MarketProduct[]> {
    const response = await fetch(`${API_URL}/market`);
    if (!response.ok) throw new Error('Failed to fetch market products');
    const allProducts: MarketProduct[] = await response.json();
    return allProducts.filter(p => p.sellerId === sellerId);
  },

  async createProduct(data: Partial<MarketProduct>): Promise<MarketProduct> {
    const token = localStorage.getItem('freshvision_token');
    const response = await fetch(`${API_URL}/market`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create product listing');
    return response.json();
  },

  async updateProduct(id: string, data: Partial<MarketProduct>): Promise<MarketProduct> {
    const token = localStorage.getItem('freshvision_token');
    const response = await fetch(`${API_URL}/market/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update product listing');
    return response.json();
  },
};
