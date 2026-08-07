import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, MapPin, Tag } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { marketService } from '../services/marketService'; import type { MarketProduct } from '../services/marketService';
import { Link } from 'react-router-dom';

export const MarketPage: React.FC = () => {
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketService.getProducts()
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            Fresh Market
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Buy and sell surplus agricultural produce directly.
          </p>
        </div>
        <Link to="/market/sell">
          <Button variant="default" className="flex items-center gap-2">
            <Tag className="h-4 w-4" /> Sell Produce
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-background border border-border rounded-xl p-4 sticky top-24">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Search className="h-4 w-4" /> Filters
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Search</label>
                <input type="text" placeholder="Search products..." className="w-full bg-muted/30 border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Category</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" className="accent-primary" /> Vegetables
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" className="accent-primary" /> Fruits
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" className="accent-primary" /> Grains
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Min Freshness</label>
                <input type="range" className="w-full accent-primary" min="50" max="100" defaultValue="80" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border border-dashed">
              No products found. Be the first to list!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group flex flex-col">
                  <div className="relative h-48 bg-muted overflow-hidden">
                    <img 
                      src={product.images && product.images.length > 0 ? product.images[0].url : "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80"} 
                      alt={product.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      {product.freshnessScore && (
                        <Badge variant="success" className="bg-green-500/90 text-white border-none shadow-sm backdrop-blur-md">{product.freshnessScore}% Fresh</Badge>
                      )}
                      {product.qualityGrade && (
                        <Badge variant="default" className="bg-blue-500/90 text-white border-none shadow-sm backdrop-blur-md">Grade {product.qualityGrade}</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-foreground text-lg line-clamp-1">{product.title}</h3>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" /> 
                      <span>{product.village || product.district || 'Location unavailable'}</span>
                    </div>
                    
                    <div className="flex items-end justify-between mt-auto pt-3 border-t border-border">
                      <div>
                        {product.originalPrice > product.sellingPrice && (
                          <span className="text-xs text-muted-foreground line-through mr-1">₹{product.originalPrice}/{product.unit}</span>
                        )}
                        <span className="font-bold text-lg text-foreground">₹{product.sellingPrice}<span className="text-xs text-muted-foreground font-normal">/{product.unit}</span></span>
                      </div>
                      <Link to={`/market/product/${product.id}`}>
                        <Button variant="outline" size="sm" className="h-8">View</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
