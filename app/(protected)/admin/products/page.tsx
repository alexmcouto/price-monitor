'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, Button, Input, Select, Modal } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { Product, Sector, ProductUnit } from '@/lib/types/database';

export default function ProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'kg' as ProductUnit,
    sector: 'Central' as Sector,
  });

  const loadProducts = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('sector')
      .order('category')
      .order('name');

    if (!error && data) {
      setProducts(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts();
  }, [loadProducts]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', category: '', unit: 'kg', sector: 'Central' });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      unit: product.unit,
      sector: product.sector,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const supabase = createClient();

    if (editingProduct) {
      // Update
      const { error } = await supabase
        .from('products')
        .update(formData)
        .eq('id', editingProduct.id);

      if (error) {
        showToast('error', 'Failed to update product');
      } else {
        showToast('success', 'Product updated');
        loadProducts();
        setIsModalOpen(false);
      }
    } else {
      // Create
      const { error } = await supabase
        .from('products')
        .insert(formData);

      if (error) {
        showToast('error', 'Failed to create product');
      } else {
        showToast('success', 'Product created');
        loadProducts();
        setIsModalOpen(false);
      }
    }

    setIsSaving(false);
  };

  const toggleActive = async (product: Product) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id);

    if (error) {
      showToast('error', 'Failed to update product');
    } else {
      showToast('success', product.is_active ? 'Product deactivated' : 'Product activated');
      loadProducts();
    }
  };

  const unitOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'piece', label: 'Piece' },
    { value: 'bag', label: 'Bag' },
    { value: 'liter', label: 'Liter' },
    { value: 'meter', label: 'Meter' },
    { value: 'sheet', label: 'Sheet' },
  ];

  const sectorOptions = [
    { value: 'Central', label: 'Central (Food Distribution)' },
    { value: 'Ensul', label: 'Ensul (Construction)' },
  ];

  // Group products by sector
  const centralProducts = products.filter((p) => p.sector === 'Central');
  const ensulProducts = products.filter((p) => p.sector === 'Ensul');

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-orbitron text-2xl text-neon-cyan">
          PRODUCTS
        </h1>
        <Button onClick={openCreateModal} variant="primary">
          + Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="retro-spinner w-12 h-12" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Central Products */}
          <div>
            <h2 className="font-orbitron text-lg text-neon-purple mb-4">
              Central (Food Distribution) - {centralProducts.length} products
            </h2>
            <div className="grid gap-3">
              {centralProducts.map((product) => (
                <Card key={product.id} className={`p-4 ${!product.is_active ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-orbitron text-neon-cyan">{product.name}</p>
                      <p className="font-vt323 text-gray-400 text-sm">
                        {product.category} • {product.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-vt323 ${
                        product.is_active 
                          ? 'bg-neon-cyan/20 text-neon-cyan' 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        onClick={() => openEditModal(product)}
                        variant="ghost"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => toggleActive(product)}
                        variant="ghost"
                        size="sm"
                      >
                        {product.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Ensul Products */}
          <div>
            <h2 className="font-orbitron text-lg text-neon-yellow mb-4">
              Ensul (Construction) - {ensulProducts.length} products
            </h2>
            <div className="grid gap-3">
              {ensulProducts.map((product) => (
                <Card key={product.id} className={`p-4 ${!product.is_active ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-orbitron text-neon-cyan">{product.name}</p>
                      <p className="font-vt323 text-gray-400 text-sm">
                        {product.category} • {product.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-vt323 ${
                        product.is_active 
                          ? 'bg-neon-cyan/20 text-neon-cyan' 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        onClick={() => openEditModal(product)}
                        variant="ghost"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => toggleActive(product)}
                        variant="ghost"
                        size="sm"
                      >
                        {product.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Rice 25kg"
            required
          />
          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Grains, Building Materials"
            required
          />
          <Select
            label="Unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value as ProductUnit })}
            options={unitOptions}
            required
          />
          <Select
            label="Sector"
            value={formData.sector}
            onChange={(e) => setFormData({ ...formData, sector: e.target.value as Sector })}
            options={sectorOptions}
            required
          />
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              className="flex-1"
            >
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
