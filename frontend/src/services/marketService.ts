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
    // In a real app with auth, the sellerId is derived from the session token.
    // Here we pass it as a query param or handle it in the backend.
    // For this prototype, let's assume we can fetch all products and filter locally, 
    // or add a query parameter ?sellerId=...
    
    // We'll fetch all and filter for now as a simple workaround, since the API doesn't have a specific endpoint yet.
    const response = await fetch(`${API_URL}/market`);
    if (!response.ok) throw new Error('Failed to fetch market products');
    const allProducts: MarketProduct[] = await response.json();
    return allProducts.filter(p => p.sellerId === sellerId);
  },

  async createProduct(data: Partial<MarketProduct>): Promise<MarketProduct> {
    const response = await fetch(`${API_URL}/market`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create product listing');
    return response.json();
  },
};
