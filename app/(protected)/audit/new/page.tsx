'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Select, Card } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { compressImage, formatFileSize, isValidImageType } from '@/lib/utils/image-compression';
import { Product, Client, Competitor } from '@/lib/types/database';

export default function NewAuditPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Form data
  const [productId, setProductId] = useState('');
  const [clientId, setClientId] = useState('');
  const [competitorId, setCompetitorId] = useState('');
  const [ourPrice, setOurPrice] = useState('');
  const [competitorPrice, setCompetitorPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  
  // Options
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [userSector, setUserSector] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    
    // Get current user's sector
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: userData } = await supabase
      .from('users')
      .select('sector')
      .eq('id', user.id)
      .single();
    
    if (userData) {
      setUserSector(userData.sector);
      
      // Load products, clients, competitors for user's sector
      const [productsRes, clientsRes, competitorsRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('sector', userData.sector)
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('clients')
          .select('*')
          .eq('sector', userData.sector)
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('competitors')
          .select('*')
          .eq('sector', userData.sector)
          .eq('is_active', true)
          .order('name'),
      ]);
      
      setProducts(productsRes.data || []);
      setClients(clientsRes.data || []);
      setCompetitors(competitorsRes.data || []);
    }
    
    setIsLoadingData(false);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!isValidImageType(file)) {
      showToast('error', 'Please select a valid image (JPEG, PNG, or WebP)');
      return;
    }
    
    setIsCompressing(true);
    
    try {
      const compressedFile = await compressImage(file);
      setPhotoFile(compressedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
      
      showToast('success', `Photo compressed to ${formatFileSize(compressedFile.size)}`);
    } catch (error) {
      showToast('error', 'Failed to process image');
      console.error(error);
    } finally {
      setIsCompressing(false);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId || !clientId || !competitorId || !ourPrice || !competitorPrice) {
      showToast('error', 'Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        showToast('error', 'You must be logged in');
        return;
      }
      
      let photoUrl = null;
      
      // Upload photo if exists
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('price-audit-photos')
          .upload(fileName, photoFile);
        
        if (uploadError) {
          throw new Error('Failed to upload photo');
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('price-audit-photos')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      }
      
      // Create audit record
      const { error: insertError } = await supabase
        .from('price_audits')
        .insert({
          user_id: user.id,
          product_id: productId,
          client_id: clientId,
          competitor_id: competitorId,
          our_price: parseFloat(ourPrice),
          competitor_price: parseFloat(competitorPrice),
          photo_url: photoUrl,
          notes: notes || null,
          audit_date: auditDate,
        });
      
      if (insertError) {
        throw new Error('Failed to save audit');
      }
      
      showToast('success', 'Price audit submitted successfully!');
      router.push('/dashboard');
      
    } catch (error) {
      console.error(error);
      showToast('error', error instanceof Error ? error.message : 'Failed to submit audit');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="retro-spinner w-12 h-12 mx-auto mb-4" />
          <p className="font-vt323 text-neon-cyan">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="font-orbitron text-2xl text-neon-cyan mb-2">
          NEW PRICE AUDIT
        </h1>
        <p className="font-vt323 text-gray-400">
          Sector: <span className="text-neon-pink">{userSector}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="space-y-6">
          {/* Date */}
          <Input
            type="date"
            label="Audit Date"
            value={auditDate}
            onChange={(e) => setAuditDate(e.target.value)}
            required
          />

          {/* Product Selection */}
          <Select
            label="Product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Select a product..."
            options={products.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.unit})`,
            }))}
            required
          />

          {/* Client Selection */}
          <Select
            label="Client / Location"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Select a client..."
            options={clients.map((c) => ({
              value: c.id,
              label: `${c.name} - ${c.location}`,
            }))}
            required
          />

          {/* Competitor Selection */}
          <Select
            label="Competitor"
            value={competitorId}
            onChange={(e) => setCompetitorId(e.target.value)}
            placeholder="Select competitor..."
            options={competitors.map((c) => ({
              value: c.id,
              label: `${c.name} - ${c.location}`,
            }))}
            required
          />

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Our Price ($)"
              placeholder="0.00"
              value={ourPrice}
              onChange={(e) => setOurPrice(e.target.value)}
              step="0.01"
              min="0"
              required
            />
            <Input
              type="number"
              label="Competitor Price ($)"
              placeholder="0.00"
              value={competitorPrice}
              onChange={(e) => setCompetitorPrice(e.target.value)}
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Price Comparison */}
          {ourPrice && competitorPrice && (
            <div className="p-4 rounded-lg bg-dark-bg border border-neon-cyan/30">
              <p className="font-vt323 text-gray-400 mb-2">Price Comparison</p>
              <div className="flex justify-between items-center">
                <span className="font-orbitron text-sm">Difference:</span>
                <span className={`font-press-start text-lg ${
                  parseFloat(competitorPrice) > parseFloat(ourPrice) 
                    ? 'text-neon-cyan' 
                    : parseFloat(competitorPrice) < parseFloat(ourPrice)
                    ? 'text-neon-pink'
                    : 'text-gray-400'
                }`}>
                  ${(parseFloat(competitorPrice) - parseFloat(ourPrice)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Photo Upload */}
          <div>
            <label className="block text-neon-cyan font-orbitron text-sm uppercase tracking-wider mb-2">
              Photo Proof
            </label>
            
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Price tag preview"
                  className="w-full h-48 object-cover rounded-lg border-2 border-neon-cyan"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 w-8 h-8 bg-neon-pink rounded-full flex items-center justify-center text-white font-bold hover:scale-110 transition-transform"
                >
                  ×
                </button>
                <p className="mt-2 font-vt323 text-sm text-gray-400">
                  {photoFile && formatFileSize(photoFile.size)}
                </p>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-neon-cyan/50 rounded-lg cursor-pointer hover:border-neon-cyan transition-colors bg-dark-bg/50">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                {isCompressing ? (
                  <div className="retro-spinner w-8 h-8" />
                ) : (
                  <>
                    <span className="text-4xl mb-2">📷</span>
                    <span className="font-vt323 text-neon-cyan">
                      Tap to take photo or upload
                    </span>
                    <span className="font-vt323 text-sm text-gray-500 mt-1">
                      Auto-compressed to max 500KB
                    </span>
                  </>
                )}
              </label>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-neon-cyan font-orbitron text-sm uppercase tracking-wider mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional observations..."
              className="retro-input w-full rounded-lg min-h-[100px] resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              {isLoading ? 'SUBMITTING...' : 'SUBMIT AUDIT'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
