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

/**
 * Ensures a valid JWT token exists in localStorage.
 * If missing or expired, auto-authenticates using the otp-login endpoint
 * with the user profile stored in freshvision_auth_user.
 */
async function ensureToken(): Promise<string | null> {
  let token = localStorage.getItem('freshvision_token');

  // Quick check: if token exists, verify it hasn't expired
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000;
      if (Date.now() < expiresAt - 60000) {
        // Token is still valid (with 1 min buffer)
        return token;
      }
      // Token expired, fall through to re-authenticate
    } catch {
      // Malformed token, fall through to re-authenticate
    }
  }

  // No valid token — try to auto-authenticate using stored user profile
  try {
    const savedUser = localStorage.getItem('freshvision_auth_user');
    if (!savedUser) return null;

    const user = JSON.parse(savedUser);
    const email = user.email;
    if (!email) return null;

    const res = await fetch(`${API_URL}/auth/otp-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: user.name || 'Operator', role: user.role || 'Quality Inspector' }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('freshvision_token', data.token);
        return data.token;
      }
    }
  } catch (err) {
    console.warn('Auto-authentication failed:', err);
  }

  return null;
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
    const token = await ensureToken();
    if (!token) {
      throw new Error('Authentication required. Please log in first.');
    }
    const response = await fetch(`${API_URL}/market`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create product listing');
    }
    return response.json();
  },

  async updateProduct(id: string, data: Partial<MarketProduct>): Promise<MarketProduct> {
    const token = await ensureToken();
    if (!token) {
      throw new Error('Authentication required. Please log in first.');
    }
    const response = await fetch(`${API_URL}/market/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update product listing');
    }
    return response.json();
  },
};

