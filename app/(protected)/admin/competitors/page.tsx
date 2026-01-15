'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, Button, Input, Select, Modal } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { Competitor, Sector } from '@/lib/types/database';

export default function CompetitorsPage() {
  const { showToast } = useToast();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    sector: 'Central' as Sector,
  });

  const loadCompetitors = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('competitors')
      .select('*')
      .order('sector')
      .order('name');

    if (!error && data) {
      setCompetitors(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCompetitors();
  }, [loadCompetitors]);

  const openCreateModal = () => {
    setEditingCompetitor(null);
    setFormData({ name: '', location: '', sector: 'Central' });
    setIsModalOpen(true);
  };

  const openEditModal = (competitor: Competitor) => {
    setEditingCompetitor(competitor);
    setFormData({
      name: competitor.name,
      location: competitor.location,
      sector: competitor.sector,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const supabase = createClient();

    if (editingCompetitor) {
      const { error } = await supabase
        .from('competitors')
        .update(formData)
        .eq('id', editingCompetitor.id);

      if (error) {
        showToast('error', 'Failed to update competitor');
      } else {
        showToast('success', 'Competitor updated');
        loadCompetitors();
        setIsModalOpen(false);
      }
    } else {
      const { error } = await supabase
        .from('competitors')
        .insert(formData);

      if (error) {
        showToast('error', 'Failed to create competitor');
      } else {
        showToast('success', 'Competitor created');
        loadCompetitors();
        setIsModalOpen(false);
      }
    }

    setIsSaving(false);
  };

  const toggleActive = async (competitor: Competitor) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('competitors')
      .update({ is_active: !competitor.is_active })
      .eq('id', competitor.id);

    if (error) {
      showToast('error', 'Failed to update competitor');
    } else {
      showToast('success', competitor.is_active ? 'Competitor deactivated' : 'Competitor activated');
      loadCompetitors();
    }
  };

  const sectorOptions = [
    { value: 'Central', label: 'Central (Food Distribution)' },
    { value: 'Ensul', label: 'Ensul (Construction)' },
  ];

  // Group competitors by sector
  const centralCompetitors = competitors.filter((c) => c.sector === 'Central');
  const ensulCompetitors = competitors.filter((c) => c.sector === 'Ensul');

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-orbitron text-2xl text-neon-cyan">
          COMPETITORS
        </h1>
        <Button onClick={openCreateModal} variant="primary">
          + Add Competitor
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="retro-spinner w-12 h-12" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Central Competitors */}
          <div>
            <h2 className="font-orbitron text-lg text-neon-purple mb-4">
              Central (Food Distribution) - {centralCompetitors.length} competitors
            </h2>
            <div className="grid gap-3">
              {centralCompetitors.map((competitor) => (
                <Card key={competitor.id} className={`p-4 ${!competitor.is_active ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-orbitron text-neon-pink">{competitor.name}</p>
                      <p className="font-vt323 text-gray-400 text-sm">
                        📍 {competitor.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-vt323 ${
                        competitor.is_active 
                          ? 'bg-neon-cyan/20 text-neon-cyan' 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {competitor.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        onClick={() => openEditModal(competitor)}
                        variant="ghost"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => toggleActive(competitor)}
                        variant="ghost"
                        size="sm"
                      >
                        {competitor.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Ensul Competitors */}
          <div>
            <h2 className="font-orbitron text-lg text-neon-yellow mb-4">
              Ensul (Construction) - {ensulCompetitors.length} competitors
            </h2>
            <div className="grid gap-3">
              {ensulCompetitors.map((competitor) => (
                <Card key={competitor.id} className={`p-4 ${!competitor.is_active ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-orbitron text-neon-pink">{competitor.name}</p>
                      <p className="font-vt323 text-gray-400 text-sm">
                        📍 {competitor.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-vt323 ${
                        competitor.is_active 
                          ? 'bg-neon-cyan/20 text-neon-cyan' 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {competitor.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        onClick={() => openEditModal(competitor)}
                        variant="ghost"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => toggleActive(competitor)}
                        variant="ghost"
                        size="sm"
                      >
                        {competitor.is_active ? 'Deactivate' : 'Activate'}
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
        title={editingCompetitor ? 'Edit Competitor' : 'Add Competitor'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Competitor Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Mega Distributor TL"
            required
          />
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Dili, Becora"
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
              {editingCompetitor ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
