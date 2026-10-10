'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { VendorDashboardLayout } from '@/components/VendorDashboardLayout';
import {
  Plus,
  Save,
  Check,
  X,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Ban,
  RefreshCw,
  Search,
} from 'lucide-react';

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
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Snacks');
  const [newStock, setNewStock] = useState('25');
  const [adding, setAdding] = useState(false);

  const fetchStock = async (isManual = false) => {
    if (isManual) setRefreshing(true);
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
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStock();
    const id = setInterval(() => fetchStock(), 10_000); // Poll every 10s
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

  // KPI Calculations
  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => i.isActive).length;
    const lowStock = items.filter((i) => i.isActive && i.netAvailable > 0 && i.netAvailable <= 3).length;
    const soldOut = items.filter((i) => i.isActive && i.netAvailable <= 0).length;
    return { total, active, lowStock, soldOut };
  }, [items]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((i) => {
      const matchesSearch =
        searchQuery === '' ||
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || i.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, categoryFilter]);

  return (
    <VendorDashboardLayout
      title="Daily Stock Management"
      subtitle="Set today's available quantities per item to update real-time sold-out badges"
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchStock(true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-ej-surface hover:bg-ej-surface-2 border border-ej-border text-ej-muted hover:text-ej-cream transition flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh stock data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-ej-lime' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Item</span>
          </button>
        </div>
      }
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TOP KPI SUMMARY STRIP
          ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card p-3.5 sm:p-4 border-ej-border bg-ej-indigo/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-ej-muted uppercase tracking-wider">
              Total Menu Items
            </p>
            <p className="text-xl sm:text-2xl font-black text-ej-cream mt-1">{stats.total}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-ej-surface text-ej-lime flex items-center justify-center border border-ej-border">
            <Boxes className="w-4 h-4" />
          </div>
        </div>

        <div className="card p-3.5 sm:p-4 border-ej-teal/30 bg-ej-indigo/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-ej-muted uppercase tracking-wider">
              Active on Menu
            </p>
            <p className="text-xl sm:text-2xl font-black text-ej-teal mt-1">{stats.active}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-ej-teal/15 text-ej-teal flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="card p-3.5 sm:p-4 border-ej-vermilion/30 bg-ej-indigo/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-ej-muted uppercase tracking-wider">
              Low Stock (&le; 3 left)
            </p>
            <p className="text-xl sm:text-2xl font-black text-ej-vermilion mt-1">{stats.lowStock}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-ej-vermilion/15 text-ej-vermilion flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="card p-3.5 sm:p-4 border-ej-border bg-ej-indigo/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-ej-muted uppercase tracking-wider">
              Sold Out Today
            </p>
            <p className="text-xl sm:text-2xl font-black text-ej-gold mt-1">{stats.soldOut}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-ej-gold/15 text-ej-gold flex items-center justify-center">
            <Ban className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. FILTER & SEARCH CONTROLS
          ───────────────────────────────────────────────────────────── */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ej-muted" />
          <input
            type="text"
            placeholder="Search items or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-ej-surface border border-ej-border text-ej-cream text-xs focus:border-ej-lime focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              categoryFilter === 'ALL'
                ? 'bg-ej-lime text-ej-ink shadow-glow-sm'
                : 'bg-ej-surface text-ej-muted hover:text-ej-cream border border-ej-border'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-ej-lime text-ej-ink shadow-glow-sm'
                  : 'bg-ej-surface text-ej-muted hover:text-ej-cream border border-ej-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. STOCK INVENTORY TABLE
          ───────────────────────────────────────────────────────────── */}
      <section className="card overflow-hidden border-ej-border shadow-xl">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-ej-indigo/60 rounded-xl skeleton" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Boxes className="w-8 h-8 text-ej-muted mx-auto opacity-50" />
            <p className="text-xs font-bold text-ej-cream">No menu items match your search</p>
            <p className="text-[11px] text-ej-muted">Try clearing the search or category filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-ej-surface/90 text-ej-muted border-b border-ej-border font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Item &amp; Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Today's Available</th>
                  <th className="p-4">Reserved</th>
                  <th className="p-4">Orderable Now</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ej-border/60">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-ej-surface/40 transition">
                    <td className="p-4 font-bold text-ej-cream">
                      <div className="text-sm font-extrabold">{item.name}</div>
                      <span className="text-[10px] text-ej-lime/80 font-mono uppercase">
                        {item.category}
                      </span>
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
                            : item.netAvailable <= 3
                            ? 'bg-ej-gold/20 text-ej-gold border border-ej-gold/40'
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
                        className="btn-gold py-1.5 px-3 text-xs inline-flex items-center gap-1 shadow-sm"
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
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. ADD ITEM MODAL
          ───────────────────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-ej-deep/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 space-y-4 shadow-2xl border-ej-border bg-ej-indigo">
            <div className="flex items-center justify-between pb-3 border-b border-ej-border">
              <h2 className="text-base font-extrabold text-ej-lime">Add New Menu Item</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-ej-muted hover:text-ej-cream p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-ej-muted mb-1 font-semibold">
                  Item Name (English &amp; Malayalam)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samosa (സമോസ)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input-field w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-ej-muted mb-1 font-semibold">Description</label>
                <input
                  type="text"
                  placeholder="Crispy spiced potato pastry..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="input-field w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ej-muted mb-1 font-semibold">Price (₹)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="15"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="input-field w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-ej-muted mb-1 font-semibold">
                    Initial Daily Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="input-field w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-ej-muted mb-1 font-semibold">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="input-field w-full cursor-pointer text-xs"
                >
                  <option value="Snacks">Snacks</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Soft Drinks">Soft Drinks</option>
                  <option value="Ice Creams">Ice Creams</option>
                  <option value="Tea &amp; Snacks">Tea &amp; Snacks</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-ej-border/60">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary py-2 px-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="btn-primary py-2 px-4 text-xs font-bold"
                >
                  {adding ? 'Creating...' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </VendorDashboardLayout>
  );
}
