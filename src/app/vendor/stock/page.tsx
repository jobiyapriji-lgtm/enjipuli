'use client';

import { useEffect, useState } from 'react';
import { VendorHeader } from '@/components/VendorHeader';
import { Plus, Save, Check, X } from 'lucide-react';

interface MenuItemStock {
  id: string;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
  quantityAvailable: number;
  quantityReserved: number;
  netAvailable: number;
}

export default function VendorStockPage() {
  const [items, setItems] = useState<MenuItemStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Snacks');
  const [newStock, setNewStock] = useState('25');
  const [adding, setAdding] = useState(false);

  const fetchStock = async () => {
    try {
      const res = await fetch('/api/menu?all=true');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch stock:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
    const id = setInterval(fetchStock, 10_000); // Poll every 10s
    return () => clearInterval(id);
  }, []);

  const handleUpdateStock = async (item: MenuItemStock, newQty: number, isActive: boolean) => {
    setSavingId(item.id);
    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuItemId: item.id,
          quantityAvailable: newQty,
          isActive,
        }),
      });

      if (res.ok) {
        setSavedId(item.id);
        setTimeout(() => setSavedId(null), 2000);
        fetchStock();
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
    } finally {
      setSavingId(null);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;
    setAdding(true);

    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          price: newPrice,
          category: newCategory,
          initialStock: newStock,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewName('');
        setNewDesc('');
        setNewPrice('');
        fetchStock();
      }
    } catch (err) {
      console.error('Failed to add item:', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-ej-deep text-ej-cream pb-16 flex flex-col">
      <VendorHeader />

      <main className="max-w-5xl w-full mx-auto px-4 pt-6 space-y-5 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-ej-cream">Daily Stock Management</h1>
            <p className="text-xs text-ej-muted mt-1">Set today&apos;s available quantities per item to update sold-out badges</p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Menu Item</span>
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-ej-indigo/60 rounded-2xl border border-ej-border/60 skeleton" />
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden border-ej-border shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-ej-surface text-ej-muted border-b border-ej-border font-bold uppercase tracking-wider">
                    <th className="p-4">Item Name &amp; Category</th>
                    <th className="p-4">Price (₹)</th>
                    <th className="p-4">Today&apos;s Total Available</th>
                    <th className="p-4">Reserved</th>
                    <th className="p-4">Orderable Now</th>
                    <th className="p-4 text-center">Active State</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ej-border/60">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-ej-surface/40 transition">
                      <td className="p-4 font-bold text-ej-cream">
                        <div className="text-sm">{item.name}</div>
                        <span className="text-[10px] text-ej-lime/80 font-mono uppercase">{item.category}</span>
                      </td>
                      <td className="p-4 font-black text-ej-gold text-sm">₹{item.price}</td>
                      <td className="p-4">
                        <input
                          type="number"
                          min="0"
                          value={item.quantityAvailable}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            setItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, quantityAvailable: val } : i))
                            );
                          }}
                          className="w-20 px-3 py-1.5 bg-ej-deep border border-ej-border rounded-lg text-ej-lime font-extrabold text-sm text-center focus:outline-none focus:border-ej-lime"
                        />
                      </td>
                      <td className="p-4 font-extrabold text-ej-gold">{item.quantityReserved}</td>
                      <td className="p-4">
                        <span
                          className={`font-bold px-2.5 py-1 rounded-md text-[11px] ${
                            item.netAvailable <= 0
                              ? 'bg-ej-vermilion/20 text-ej-vermilion border border-ej-vermilion/40'
                              : 'bg-ej-teal/20 text-ej-teal border border-ej-teal/40'
                          }`}
                        >
                          {item.netAvailable <= 0 ? 'SOLD OUT' : `${item.netAvailable} left`}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() =>
                            handleUpdateStock(item, item.quantityAvailable, !item.isActive)
                          }
                          className={`px-3 py-1 rounded-full font-bold text-[11px] transition ${
                            item.isActive
                              ? 'bg-ej-teal/20 text-ej-teal border border-ej-teal/40'
                              : 'bg-ej-vermilion/20 text-ej-vermilion border border-ej-vermilion/40'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() =>
                            handleUpdateStock(item, item.quantityAvailable, item.isActive)
                          }
                          disabled={savingId === item.id}
                          className="btn-gold py-1.5 px-3 text-xs inline-flex items-center gap-1"
                        >
                          {savedId === item.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Saved</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Update</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-ej-deep/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 space-y-4 shadow-2xl border-ej-border">
            <div className="flex items-center justify-between pb-3 border-b border-ej-border">
              <h2 className="text-base font-extrabold text-ej-lime">Add New Menu Item</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-ej-muted hover:text-ej-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-ej-muted mb-1 font-medium">Item Name (English &amp; Malayalam)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samosa (സമോസ)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-ej-muted mb-1 font-medium">Description</label>
                <input
                  type="text"
                  placeholder="Crispy fried potato pastry..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ej-muted mb-1 font-medium">Price (₹)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="15"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-ej-muted mb-1 font-medium">Initial Daily Stock</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-ej-muted mb-1 font-medium">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="input-field cursor-pointer"
                >
                  <option value="Snacks">Snacks</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Soft Drinks">Soft Drinks</option>
                  <option value="Ice Creams">Ice Creams</option>
                  <option value="Tea &amp; Snacks">Tea &amp; Snacks</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="btn-primary"
                >
                  {adding ? 'Creating...' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
