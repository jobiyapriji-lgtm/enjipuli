'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Store, Plus, Save, ArrowLeft, RefreshCw, AlertCircle, Check } from 'lucide-react';

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

  // Add Item state
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
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Top Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <Link href="/vendor/queue" className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-amber-400">Daily Stock Management</h1>
            <p className="text-xs text-slate-400">Set today's available quantities per item to update sold-out badges</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Menu Item</span>
        </button>
      </header>

      {/* Main Stock Table / Grid */}
      <main className="max-w-5xl mx-auto px-4 pt-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-850 text-slate-400 border-b border-slate-700 font-semibold">
                  <th className="p-4">Item Name & Category</th>
                  <th className="p-4">Price (₹)</th>
                  <th className="p-4">Today's Total Available</th>
                  <th className="p-4">Reserved</th>
                  <th className="p-4">Orderable Now</th>
                  <th className="p-4 text-center">Active State</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-750/50 transition">
                    <td className="p-4 font-bold text-slate-200">
                      <div>{item.name}</div>
                      <span className="text-[10px] text-amber-400/80 font-mono">{item.category}</span>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">₹{item.price}</td>
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
                        className="w-20 px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-amber-300 font-bold text-sm text-center focus:outline-none focus:border-amber-500"
                      />
                    </td>
                    <td className="p-4 font-semibold text-amber-400">{item.quantityReserved}</td>
                    <td className="p-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          item.netAvailable <= 0
                            ? 'bg-red-900/50 text-red-300 border border-red-700'
                            : 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
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
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
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
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs inline-flex items-center space-x-1 transition disabled:opacity-50"
                      >
                        {savedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-slate-950" />
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
        )}
      </main>

      {/* Add New Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-white">
            <h2 className="text-lg font-bold text-amber-400">Add New Menu Item</h2>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Item Name (English & Malayalam)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samosa (സമോസ)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Crispy fried potato pastry..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="15"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Initial Daily Stock</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Snacks">Snacks</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Soft Drinks">Soft Drinks</option>
                  <option value="Ice Creams">Ice Creams</option>
                  <option value="Tea & Snacks">Tea & Snacks</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 disabled:opacity-50"
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
