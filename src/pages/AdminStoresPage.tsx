import { useEffect, useState, useCallback } from 'react';
import { supabase, type Store } from '../lib/supabase';
import SortHeader from '../components/SortHeader';
import StarRating from '../components/StarRating';
import { Search, Plus, X } from 'lucide-react';
import { validateStoreForm } from '../lib/validations';

interface StoreWithRating {
  id: string;
  name: string;
  email: string;
  address: string;
  owner_id: string | null;
  created_at: string;
  avg_rating: number | null;
  owner_name: string | null;
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<StoreWithRating[]>([]);
  const [owners, setOwners] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const fetchStores = useCallback(async () => {
    let query = supabase.from('stores').select('*, owner:users(name)');
    if (filters.name) query = query.ilike('name', `%${filters.name}%`);
    if (filters.email) query = query.ilike('email', `%${filters.email}%`);
    if (filters.address) query = query.ilike('address', `%${filters.address}%`);
    query = query.order(sortField, { ascending: sortDir === 'asc' });
    const { data } = await query;

    if (data) {
      const storeIds = data.map((s: Store) => s.id);
      const { data: ratings } = await supabase
        .from('ratings')
        .select('store_id, rating')
        .in('store_id', storeIds);

      const avgMap: Record<string, number> = {};
      if (ratings) {
        const grouped: Record<string, number[]> = {};
        for (const r of ratings) {
          if (!grouped[r.store_id]) grouped[r.store_id] = [];
          grouped[r.store_id].push(r.rating);
        }
        for (const [sid, rats] of Object.entries(grouped)) {
          avgMap[sid] = rats.reduce((a: number, b: number) => a + b, 0) / rats.length;
        }
      }

      const mapped = data.map((s: Record<string, unknown>) => ({
        ...s,
        owner_name: (s.owner as Record<string, string> | null)?.name ?? null,
        avg_rating: avgMap[s.id as string] ?? null,
      }));
      setStores(mapped as StoreWithRating[]);
    }
    setLoading(false);
  }, [filters, sortField, sortDir]);

  useEffect(() => {
    fetchStores();
    supabase.from('users').select('id, name').eq('role', 'store_owner').then(({ data }) => {
      setOwners(data ?? []);
    });
  }, [fetchStores]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStoreForm(addForm);
    setAddErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setAddLoading(true);
    setAddError('');
    const insertData: Record<string, unknown> = {
      name: addForm.name,
      email: addForm.email,
      address: addForm.address,
    };
    if (addForm.owner_id) insertData.owner_id = addForm.owner_id;

    const { error } = await supabase.from('stores').insert(insertData);
    if (error) {
      setAddError(error.message);
    } else {
      setShowAddModal(false);
      setAddForm({ name: '', email: '', address: '', owner_id: '' });
      fetchStores();
    }
    setAddLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Stores</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Store
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Search size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Filter by name..."
            value={filters.name}
            onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <input
            type="text"
            placeholder="Filter by email..."
            value={filters.email}
            onChange={(e) => setFilters((f) => ({ ...f, email: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <input
            type="text"
            placeholder="Filter by address..."
            value={filters.address}
            onChange={(e) => setFilters((f) => ({ ...f, address: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3 text-left">
                  <SortHeader label="Name" field="name" currentSort={sortField} currentDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-6 py-3 text-left">
                  <SortHeader label="Email" field="email" currentSort={sortField} currentDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-6 py-3 text-left">
                  <SortHeader label="Address" field="address" currentSort={sortField} currentDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-6 py-3 text-left">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : stores.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No stores found</td></tr>
              ) : (
                stores.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{s.address}</td>
                    <td className="px-6 py-4">
                      {s.avg_rating ? (
                        <div className="flex items-center gap-2">
                          <StarRating rating={Math.round(s.avg_rating)} size={16} />
                          <span className="text-sm text-gray-600">{s.avg_rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No ratings</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Store</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {addError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{addError}</div>
            )}

            <form onSubmit={handleAddStore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="20-60 characters"
                />
                {addErrors.name && <p className="text-red-500 text-xs mt-1">{addErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Email</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="store@example.com"
                />
                {addErrors.email && <p className="text-red-500 text-xs mt-1">{addErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={addForm.address}
                  onChange={(e) => setAddForm((f) => ({ ...f, address: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Max 400 characters"
                />
                {addErrors.address && <p className="text-red-500 text-xs mt-1">{addErrors.address}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Owner (optional)</label>
                <select
                  value={addForm.owner_id}
                  onChange={(e) => setAddForm((f) => ({ ...f, owner_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">No owner assigned</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {addLoading ? 'Adding...' : 'Add Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
