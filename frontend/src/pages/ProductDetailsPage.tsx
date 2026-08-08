import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MapPin, ShoppingCart, MessageSquare, ArrowLeft, Heart, ShieldCheck, Clock, Share2, CheckCircle2, Loader2, Phone } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { marketService } from '../services/marketService'; import type { MarketProduct } from '../services/marketService';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<MarketProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyingState, setBuyingState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (id) {
      marketService.getProduct(id)
        .then(data => {
          setProduct(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  const handleBuyNow = () => {
    if (!product) return;
    setBuyingState('loading');
    // Simulate a short delay for UX feedback, then show success
    setTimeout(() => {
      setBuyingState('success');
      // Reset after 3 seconds
      setTimeout(() => setBuyingState('idle'), 3000);
    }, 1200);
  };

  const handleContactSeller = () => {
    if (!product) return;
    setShowContactModal(true);
  };

  const sellerEmail = product?.contactEmail || product?.seller?.email;
  const sellerName = product?.seller?.name || 'Seller';
  const sellerPhone = product?.contactPhone;
  const sellerWhatsApp = product?.contactWhatsApp;

  const handleEmailSeller = () => {
    if (!product) return;
    const subject = encodeURIComponent(`Inquiry about: ${product.title}`);
    const body = encodeURIComponent(
      `Hi ${sellerName},\n\nI'm interested in your listing "${product.title}" (${product.quantity}${product.unit}) priced at ₹${product.sellingPrice}/${product.unit}.\n\nPlease share more details.\n\nThank you.`
    );
    window.open(`mailto:${sellerEmail || ''}?subject=${subject}&body=${body}`, '_blank');
    setShowContactModal(false);
  };

  const handleWhatsAppSeller = () => {
    if (!product) return;
    const text = encodeURIComponent(
      `Hi ${sellerName}, I'm interested in your listing "${product.title}" (${product.quantity}${product.unit}) at ₹${product.sellingPrice}/${product.unit} on FreshVision Market. Please share more details.`
    );
    const phone = sellerWhatsApp ? sellerWhatsApp.replace(/[^0-9]/g, '') : '';
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    setShowContactModal(false);
  };

  const handleCallSeller = () => {
    if (!sellerPhone) return;
    window.open(`tel:${sellerPhone}`);
    setShowContactModal(false);
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading product details...</div>;
  }

  if (!product) {
    return <div className="text-center py-12 text-red-500">Product not found.</div>;
  }

  const mainImage = product.images && product.images.length > 0 
    ? product.images[0].url 
    : "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1000&q=80";

  const locationParts = [product.village, product.district, product.state, product.pinCode].filter(Boolean);
  const locationText = locationParts.length > 0 ? locationParts.join(', ') : 'No location specified';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fadeIn">
      <Link to="/market" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Market
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden border border-border relative">
            <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-full bg-background/80 backdrop-blur border-none shadow-sm hover:text-red-500"><Heart className="h-5 w-5" /></Button>
              <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-full bg-background/80 backdrop-blur border-none shadow-sm"><Share2 className="h-5 w-5" /></Button>
            </div>
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <div key={img.id} className={`aspect-square bg-muted rounded-lg overflow-hidden border ${i === 0 ? 'border-primary' : 'border-transparent'}`}>
                  <img src={img.url} alt={product.title} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.category && <Badge variant="default" className="bg-primary/10 text-primary">{product.category.name}</Badge>}
              <span className="text-sm text-muted-foreground"><Clock className="h-3 w-3 inline mr-1" />Posted {new Date(product.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{product.title} ({product.quantity}{product.unit})</h1>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-3xl font-bold text-foreground">₹{product.sellingPrice}<span className="text-lg text-muted-foreground font-normal">/{product.unit}</span></span>
              {product.originalPrice > product.sellingPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through mb-1">₹{product.originalPrice}/{product.unit}</span>
                  <Badge variant="success" className="mb-1 ml-2 bg-green-500/10 text-green-500 border-green-500/20">
                    -{Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100)}% Discount
                  </Badge>
                </>
              )}
            </div>
          </div>

          {(product.freshnessScore || product.qualityGrade) && (
            <Card className="bg-primary/5 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    AI Verified Quality 
                    {product.qualityGrade && <Badge variant="success" className="h-5 text-[10px]">Grade {product.qualityGrade}</Badge>}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    This product has been scanned by FreshVision AI. Freshness score: <strong>{product.freshnessScore}%</strong>.
                  </p>
                  <Link to="#" className="text-primary text-sm font-medium mt-2 inline-block hover:underline">View full AI Inspection Report</Link>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.description || "No description provided."}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">Logistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Location</p>
                  <p className={`text-sm ${locationParts.length > 0 ? 'text-muted-foreground' : 'text-muted-foreground/60 italic'}`}>
                    {locationText}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShoppingCart className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Delivery Options</p>
                  <p className="text-sm text-muted-foreground">
                    {product.pickupAvailable ? 'Pickup Available' : ''}
                    {product.pickupAvailable && product.homeDelivery ? ' • ' : ''}
                    {product.homeDelivery ? 'Home Delivery' : ''}
                    {!product.pickupAvailable && !product.homeDelivery ? 'Contact Seller for delivery options' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Available Until</p>
                  <p className="text-sm text-muted-foreground">
                    {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          {product.seller && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">Seller</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {product.seller.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{product.seller.name}</p>
                  {product.seller.email && (
                    <p className="text-xs text-muted-foreground">{product.seller.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-border flex gap-4">
            {product?.sellerId === 'cm0p4q6z0000008lc6a8f1n2d' ? (
              <Button
                variant="outline"
                className="flex-1 py-6 text-lg border-primary text-primary hover:bg-primary/10 cursor-pointer"
                onClick={() => navigate(`/market/sell?edit=${product.id}`)}
              >
                Edit Listing
              </Button>
            ) : (
              <>
                <Button
                  variant="default"
                  className="flex-1 py-6 text-lg cursor-pointer"
                  onClick={handleBuyNow}
                  disabled={buyingState !== 'idle'}
                >
                  {buyingState === 'loading' && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {buyingState === 'success' && <CheckCircle2 className="mr-2 h-5 w-5" />}
                  {buyingState === 'idle' && <ShoppingCart className="mr-2 h-5 w-5" />}
                  {buyingState === 'idle' ? 'Buy Now' : buyingState === 'loading' ? 'Processing...' : 'Order Placed!'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 py-6 text-lg border-primary text-primary hover:bg-primary/10 cursor-pointer"
                  onClick={handleContactSeller}
                >
                  <MessageSquare className="mr-2 h-5 w-5" /> Contact Seller
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contact Seller Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowContactModal(false)}>
          <div
            className="bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 space-y-5 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-foreground">Contact Seller</h3>
            <p className="text-sm text-muted-foreground">
              Reach out to <strong>{sellerName}</strong> about "{product.title}".
            </p>

            <div className="space-y-3">
              {sellerPhone && (
                <button
                  onClick={handleCallSeller}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">Call Phone</p>
                    <p className="text-xs text-muted-foreground">{sellerPhone}</p>
                  </div>
                </button>
              )}

              {sellerEmail && (
                <button
                  onClick={handleEmailSeller}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">Send Email</p>
                    <p className="text-xs text-muted-foreground">{sellerEmail}</p>
                  </div>
                </button>
              )}

              <button
                onClick={handleWhatsAppSeller}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-green-500/50 hover:bg-green-500/5 transition-all cursor-pointer"
              >
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">WhatsApp</p>
                  <p className="text-xs text-muted-foreground">{sellerWhatsApp ? sellerWhatsApp : 'Open WhatsApp with a pre-filled message'}</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
