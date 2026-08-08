import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, DollarSign, Eye, Edit, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { marketService } from '../services/marketService'; import type { MarketProduct } from '../services/marketService';

export const SellerDashboardPage: React.FC = () => {
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, use the actual authenticated user ID
    const mockSellerId = 'cm0p4q6z0000008lc6a8f1n2d';
    
    marketService.getMyProducts(mockSellerId)
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const totalRevenue = products.reduce((sum, p) => sum + (p.originalPrice || p.sellingPrice || 0) * (p.quantity || 0), 0);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Package className="h-8 w-8 text-primary" />
          My Products
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your market listings, track sales, and view analytics.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="flex flex-col border-border/50">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-muted-foreground uppercase">Total Listings</p>
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Package className="h-4 w-4" /></div>
          </div>
          <p className="text-3xl font-bold text-foreground mt-2">{products.length}</p>
        </Card>
        
        <Card className="flex flex-col border-border/50">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-muted-foreground uppercase">Active Listings</p>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><TrendingUp className="h-4 w-4" /></div>
          </div>
          <p className="text-3xl font-bold text-foreground mt-2">{products.filter(p => p.status === 'active').length}</p>
        </Card>
        
        <Card className="flex flex-col border-border/50">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-muted-foreground uppercase">Total Value</p>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><DollarSign className="h-4 w-4" /></div>
          </div>
          <p className="text-3xl font-bold text-foreground mt-2">₹{totalRevenue.toLocaleString()}</p>
        </Card>
        
        <Card className="flex flex-col border-border/50">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-muted-foreground uppercase">Total Views</p>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Eye className="h-4 w-4" /></div>
          </div>
          <p className="text-3xl font-bold text-foreground mt-2">1,204</p>
        </Card>
      </div>

      <Card title="Active Listings">
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading your products...</div>
        ) : products.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">You haven't listed any products yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-foreground flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded overflow-hidden flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                            {product.title.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="line-clamp-1">{product.title}</span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{product.category?.name || 'Category'}</td>
                    <td className="px-4 py-4 font-semibold text-foreground">₹{product.sellingPrice}/{product.unit}</td>
                    <td className="px-4 py-4 text-foreground">{product.quantity} {product.unit}</td>
                    <td className="px-4 py-4">
                      {product.status === 'active' ? (
                        <Badge variant="success" className="bg-green-500/10 text-green-500">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="outline" size="sm" className="h-8 px-2 mr-2" onClick={() => navigate(`/market/sell?edit=${product.id}`)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" className="h-8 px-2 text-red-500 border-red-500/20 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
