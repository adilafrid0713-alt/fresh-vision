import React, { useState, useRef } from 'react';
import { Tag, Upload, Sparkles, Check, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { marketService } from '../services/marketService';

export const SellProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [useAIFill, setUseAIFill] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    categoryId: 'veg-1', // Correct category ID
    quantity: '',
    unit: 'kg',
    originalPrice: '',
    sellingPrice: '',
    description: '',
    village: '',
    pinCode: '',
    pickupAvailable: true,
    homeDelivery: false,
    images: [] as string[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAISelect = () => {
    setUseAIFill(true);
    // Simulate AI filling data
    setFormData(prev => ({
      ...prev,
      title: 'Tomatoes (Batch #104)',
      categoryId: 'veg-1',
      description: 'Freshly inspected organic tomatoes. Grade A quality with 95% freshness score based on AI analysis.',
      quantity: '50',
      unit: 'kg',
    }));
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Convert file to base64 for simplicity in prototype
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, reader.result as string]
      }));
    };
    reader.readAsDataURL(files[0]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // In a real app, sellerId comes from auth context. Using a mock ID here.
      const mockSellerId = 'cm0p4q6z0000008lc6a8f1n2d'; // Adjust if needed
      
      const newProduct = await marketService.createProduct({
        ...formData,
        sellerId: mockSellerId,
        quantity: Number(formData.quantity) || 0,
        originalPrice: Number(formData.originalPrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days default
      } as any); // Cast as any because of our custom images array type vs the schema interface
      
      navigate(`/market/product/${newProduct.id}`);
    } catch (error) {
      console.error('Failed to create listing', error);
      alert('Failed to create listing. Make sure backend is running.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Tag className="h-8 w-8 text-primary" />
            Sell Surplus Produce
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            List your surplus agricultural inventory for the spot market.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} id="sell-form">
            <div className="space-y-6">
              <Card title="Product Details">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Product Title</label>
                    <input name="title" value={formData.title} onChange={handleChange} required type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. 50kg Organic Tomatoes" />
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Category</label>
                    <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="veg-1">Vegetables</option>
                      <option value="fruit-1">Fruits</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Available Quantity</label>
                    <div className="flex gap-2">
                      <input name="quantity" value={formData.quantity} onChange={handleChange} required type="number" className="w-2/3 bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="100" />
                      <select name="unit" value={formData.unit} onChange={handleChange} className="w-1/3 bg-background border border-border rounded-md px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                        <option value="kg">kg</option>
                        <option value="boxes">boxes</option>
                        <option value="pieces">pieces</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Original Price (per unit)</label>
                    <input name="originalPrice" value={formData.originalPrice} onChange={handleChange} required type="number" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="₹" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Selling Price (per unit)</label>
                    <input name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} required type="number" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="₹" />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Describe the quality and origin..."></textarea>
                  </div>
                </div>
              </Card>

              <Card title="Location & Logistics">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex gap-4 mb-2">
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input name="pickupAvailable" checked={formData.pickupAvailable} onChange={handleChange} type="checkbox" className="accent-primary" /> Pickup Available
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input name="homeDelivery" checked={formData.homeDelivery} onChange={handleChange} type="checkbox" className="accent-primary" /> Home Delivery
                    </label>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Village / City</label>
                    <input name="village" value={formData.village} onChange={handleChange} type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Village name" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">PIN Code</label>
                    <input name="pinCode" value={formData.pinCode} onChange={handleChange} type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="000000" />
                  </div>
                </div>
              </Card>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => navigate(-1)}>Cancel</Button>
                <Button variant="default" type="submit" disabled={submitting}>
                  {submitting ? 'Publishing...' : 'Publish Listing'}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Sidebar - AI & Media */}
        <div className="space-y-6">
          <Card title="AI Freshness Integration" className="border-primary/30 bg-primary/5">
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automatically fill product details, freshness scores, and shelf-life directly from a previous FreshVision AI inspection.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-primary/50 text-primary hover:bg-primary/10 flex items-center justify-center gap-2"
                onClick={handleAISelect}
              >
                <Sparkles className="h-4 w-4" />
                Select Past Inspection
              </Button>
              
              {useAIFill && (
                <div className="p-3 bg-background border border-border rounded-lg flex items-start gap-3">
                  <div className="bg-green-500/10 text-green-500 rounded-full p-1 mt-0.5"><Check className="h-3 w-3"/></div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Tomatoes (Batch #104)</p>
                    <p className="text-xs text-muted-foreground">Grade A • 95% Fresh</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Product Images">
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div 
                onClick={handleImageUploadClick}
                className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-semibold text-foreground">Upload Images</p>
                <p className="text-xs text-muted-foreground mt-1">Click to select photos</p>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img src={url} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-md border border-border" />
                      <button 
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-background/80 hover:bg-destructive/10 hover:text-destructive rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
