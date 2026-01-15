'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, Button, Input, Select, Modal } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { Client, Sector } from '@/lib/types/database';

export default function ClientsPage() {
  const { showToast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contact_phone: '',
    sector: 'Central' as Sector,
  });

  const loadClients = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('sector')
      .order('name');

    if (!error && data) {
      setClients(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClients();
  }, [loadClients]);

  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({ name: '', location: '', contact_phone: '', sector: 'Central' });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      location: client.location,
      contact_phone: client.contact_phone || '',
      sector: client.sector,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const supabase = createClient();
    const submitData = {
      ...formData,
      contact_phone: formData.contact_phone || null,
    };

    if (editingClient) {
      const { error } = await supabase
        .from('clients')
        .update(submitData)
        .eq('id', editingClient.id);

      if (error) {
        showToast('error', 'Failed to update client');
      } else {
        showToast('success', 'Client updated');
        loadClients();
        setIsModalOpen(false);
      }
    } else {
      const { error } = await supabase
        .from('clients')
        .insert(submitData);

      if (error) {
        showToast('error', 'Failed to create client');
      } else {
        showToast('success', 'Client created');
        loadClients();
        setIsModalOpen(false);
      }
    }

    setIsSaving(false);
  };

  const toggleActive = async (client: Client) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('clients')
      .update({ is_active: !client.is_active })
      .eq('id', client.id);

    if (error) {
      showToast('error', 'Failed to update client');
    } else {
      showToast('success', client.is_active ? 'Client deactivated' : 'Client activated');
      loadClients();
    }
  };

  const sectorOptions = [
    { value: 'Central', label: 'Central (Food Distribution)' },
    { value: 'Ensul', label: 'Ensul (Construction)' },
  ];

  // Group clients by sector
  const centralClients = clients.filter((c) => c.sector === 'Central');
  const ensulClients = clients.filter((c) => c.sector === 'Ensul');

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-orbitron text-2xl text-neon-cyan">
          CLIENTS
        </h1>
        <Button onClick={openCreateModal} variant="primary">
          + Add Client
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="retro-spinner w-12 h-12" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Central Clients */}
          <div>
            <h2 className="font-orbitron text-lg text-neon-purple mb-4">
              Central (Food Distribution) - {centralClients.length} clients
            </h2>
            <div className="grid gap-3">
              {centralClients.map((client) => (
                <Card key={client.id} className={`p-4 ${!client.is_active ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-orbitron text-neon-cyan">{client.name}</p>
                      <p className="font-vt323 text-gray-400 text-sm">
                        📍 {client.location}
                        {client.contact_phone && ` • 📞 ${client.contact_phone}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-vt323 ${
                        client.is_active 
                          ? 'bg-neon-cyan/20 text-neon-cyan' 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {client.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        onClick={() => openEditModal(client)}
                        variant="ghost"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => toggleActive(client)}
                        variant="ghost"
                        size="sm"
                      >
                        {client.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Ensul Clients */}
          <div>
            <h2 className="font-orbitron text-lg text-neon-yellow mb-4">
              Ensul (Construction) - {ensulClients.length} clients
            </h2>
            <div className="grid gap-3">
              {ensulClients.map((client) => (
                <Card key={client.id} className={`p-4 ${!client.is_active ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-orbitron text-neon-cyan">{client.name}</p>
                      <p className="font-vt323 text-gray-400 text-sm">
                        📍 {client.location}
                        {client.contact_phone && ` • 📞 ${client.contact_phone}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-vt323 ${
                        client.is_active 
                          ? 'bg-neon-cyan/20 text-neon-cyan' 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {client.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        onClick={() => openEditModal(client)}
                        variant="ghost"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => toggleActive(client)}
                        variant="ghost"
                        size="sm"
                      >
                        {client.is_active ? 'Deactivate' : 'Activate'}
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
        title={editingClient ? 'Edit Client' : 'Add Client'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Client Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Timor Plaza Supermarket"
            required
          />
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Dili, Comoro"
            required
          />
          <Input
            label="Contact Phone (Optional)"
            value={formData.contact_phone}
            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            placeholder="e.g., +670 7777 1234"
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
              {editingClient ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
