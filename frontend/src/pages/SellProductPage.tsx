import React, { useState, useRef, useEffect } from 'react';
import { Tag, Upload, Sparkles, Check, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { marketService } from '../services/marketService';

export const SellProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;
  const [loading, setLoading] = useState(!!editId);
  
  const [useAIFill, setUseAIFill] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    categoryId: 'veg-1',
    quantity: '',
    unit: 'kg',
    originalPrice: '',
    sellingPrice: '',
    description: '',
    village: '',
    district: '',
    state: '',
    pinCode: '',
    pickupAvailable: true,
    homeDelivery: false,
    contactPhone: '',
    contactEmail: '',
    contactWhatsApp: '',
    shelfTimeMode: 'hours',
    shelfTimeValue: '24',
    images: [] as string[]
  });

  useEffect(() => {
    if (editId) {
      marketService.getProduct(editId)
        .then(product => {
          let mode = 'hours';
          let val = '24';
          if (product.expiryDate) {
             mode = 'datetime';
             const d = new Date(product.expiryDate);
             const pad = (n: number) => n.toString().padStart(2, '0');
             val = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          }

          setFormData(prev => ({
            ...prev,
            title: product.title || '',
            categoryId: product.categoryId || 'veg-1',
            quantity: String(product.quantity || ''),
            unit: product.unit || 'kg',
            originalPrice: String(product.originalPrice || ''),
            sellingPrice: String(product.sellingPrice || ''),
            description: product.description || '',
            village: product.village || '',
            district: product.district || '',
            state: product.state || '',
            pinCode: product.pinCode || '',
            pickupAvailable: product.pickupAvailable,
            homeDelivery: product.homeDelivery,
            contactPhone: product.contactPhone || '',
            contactEmail: product.contactEmail || '',
            contactWhatsApp: product.contactWhatsApp || '',
            shelfTimeMode: mode,
            shelfTimeValue: val,
            images: product.images ? product.images.map(img => img.url) : []
          }));
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [editId]);

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
      
      let expiryDateISO = new Date().toISOString();
      if (formData.shelfTimeMode === 'hours') {
        expiryDateISO = new Date(Date.now() + Number(formData.shelfTimeValue) * 60 * 60 * 1000).toISOString();
      } else if (formData.shelfTimeMode === 'minutes') {
        expiryDateISO = new Date(Date.now() + Number(formData.shelfTimeValue) * 60 * 1000).toISOString();
      } else if (formData.shelfTimeMode === 'date') {
        const d = new Date(formData.shelfTimeValue);
        d.setHours(23, 59, 59, 999);
        expiryDateISO = d.toISOString();
      } else if (formData.shelfTimeMode === 'time') {
        const [hh, mm] = formData.shelfTimeValue.split(':');
        const d = new Date();
        d.setHours(Number(hh), Number(mm), 0, 0);
        if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
        expiryDateISO = d.toISOString();
      } else if (formData.shelfTimeMode === 'datetime') {
        expiryDateISO = new Date(formData.shelfTimeValue).toISOString();
      }
      
      const payload = {
        ...formData,
        sellerId: mockSellerId,
        quantity: Number(formData.quantity) || 0,
        originalPrice: Number(formData.originalPrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        expiryDate: expiryDateISO,
      } as any; // Cast as any because of our custom images array type vs the schema interface
      
      let savedProduct;
      if (isEditing && editId) {
        savedProduct = await marketService.updateProduct(editId, payload);
      } else {
        savedProduct = await marketService.createProduct(payload);
      }
      
      navigate(`/market/product/${savedProduct.id}`);
    } catch (error) {
      console.error('Failed to save listing', error);
      alert('Unable to save your listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Tag className="h-8 w-8 text-primary" />
            {isEditing ? 'Edit Product' : 'Sell Surplus Produce'}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isEditing ? 'Update your market listing details.' : 'List your surplus agricultural inventory for the spot market.'}
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
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Shelf Time</label>
                    <div className="flex gap-2">
                      <select name="shelfTimeMode" value={formData.shelfTimeMode} onChange={handleChange} className="w-1/3 bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                        <option value="hours">Hours</option>
                        <option value="minutes">Minutes</option>
                        <option value="date">Date</option>
                        <option value="time">Time</option>
                        <option value="datetime">Date & Time</option>
                      </select>
                      <input 
                        name="shelfTimeValue" 
                        value={formData.shelfTimeValue} 
                        onChange={handleChange} 
                        required 
                        type={
                          formData.shelfTimeMode === 'date' ? 'date' : 
                          formData.shelfTimeMode === 'time' ? 'time' :
                          formData.shelfTimeMode === 'datetime' ? 'datetime-local' : 'number'
                        } 
                        min={['hours', 'minutes'].includes(formData.shelfTimeMode) ? "1" : undefined}
                        className="w-2/3 bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" 
                        placeholder={
                          formData.shelfTimeMode === 'hours' ? 'e.g. 24' :
                          formData.shelfTimeMode === 'minutes' ? 'e.g. 30' : ''
                        } 
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Product will be automatically hidden from the market after this time.</p>
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
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">District</label>
                    <input name="district" value={formData.district} onChange={handleChange} type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="District name" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">State</label>
                    <input name="state" value={formData.state} onChange={handleChange} type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="State" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">PIN Code</label>
                    <input name="pinCode" value={formData.pinCode} onChange={handleChange} type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="000000" />
                  </div>
                </div>
              </Card>
              
              <Card title="Contact Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Phone Number</label>
                    <input name="contactPhone" value={formData.contactPhone} onChange={handleChange} type="tel" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="+91 9876543210" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">WhatsApp Number</label>
                    <input name="contactWhatsApp" value={formData.contactWhatsApp} onChange={handleChange} type="tel" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="+91 9876543210" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Email</label>
                    <input name="contactEmail" value={formData.contactEmail} onChange={handleChange} type="email" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="seller@example.com" />
                  </div>
                </div>
              </Card>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => navigate(-1)}>Cancel</Button>
                <Button variant="default" type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : (isEditing ? 'Update Listing' : 'Publish Listing')}
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

