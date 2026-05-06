import { useEffect, useState, useCallback } from 'react';
import { supabase, type Store } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import StarRating from '../components/StarRating';
import { Search } from 'lucide-react';

interface StoreWithRating {
  id: string;
  name: string;
  email: string;
  address: string;
  owner_id: string | null;
  created_at: string;
  avg_rating: number | null;
  user_rating: number | null;
  rating_id: string | null;
}

export default function UserStoresPage() {
  const { user } = useAuth();
  const [stores, setStores] = useState<StoreWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    if (!user) return;
    let query = supabase.from('stores').select('*');
    if (searchName) query = query.ilike('name', `%${searchName}%`);
    if (searchAddress) query = query.ilike('address', `%${searchAddress}%`);
    query = query.order('name', { ascending: true });
    const { data: storeData } = await query;

    if (storeData) {
      const storeIds = storeData.map((s: Store) => s.id);

      const [ratingsRes, userRatingsRes] = await Promise.all([
        supabase.from('ratings').select('store_id, rating').in('store_id', storeIds),
        supabase.from('ratings').select('id, store_id, rating').eq('user_id', user.id).in('store_id', storeIds),
      ]);

      const avgMap: Record<string, number> = {};
      if (ratingsRes.data) {
        const grouped: Record<string, number[]> = {};
        for (const r of ratingsRes.data) {
          if (!grouped[r.store_id]) grouped[r.store_id] = [];
          grouped[r.store_id].push(r.rating);
        }
        for (const [sid, rats] of Object.entries(grouped)) {
          avgMap[sid] = rats.reduce((a, b) => a + b, 0) / rats.length;
        }
      }

      const userRatingMap: Record<string, { id: string; rating: number }> = {};
      if (userRatingsRes.data) {
        for (const r of userRatingsRes.data) {
          userRatingMap[r.store_id] = { id: r.id, rating: r.rating };
        }
      }

      const mapped = storeData.map((s: Store) => ({
        ...s,
        avg_rating: avgMap[s.id] ?? null,
        user_rating: userRatingMap[s.id]?.rating ?? null,
        rating_id: userRatingMap[s.id]?.id ?? null,
      }));
      setStores(mapped);
    }
    setLoading(false);
  }, [user, searchName, searchAddress]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleSubmitRating = async (storeId: string, rating: number) => {
    if (!user) return;
    setSubmitting(storeId);
    const store = stores.find((s) => s.id === storeId);
    if (store?.rating_id) {
      await supabase.from('ratings').update({ rating }).eq('id', store.rating_id);
    } else {
      await supabase.from('ratings').insert({ user_id: user.id, store_id: storeId, rating });
    }
    await fetchStores();
    setSubmitting(null);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Search size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Search Stores</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <input
            type="text"
            placeholder="Search by address..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Store Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-gray-100">
              <div className="h-20 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No stores found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">{store.name}</h4>
              <p className="text-sm text-gray-500 mb-1">{store.email}</p>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{store.address}</p>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Overall Rating</p>
                  <div className="flex items-center gap-2">
                    <StarRating rating={store.avg_rating ? Math.round(store.avg_rating) : 0} size={16} />
                    <span className="text-sm font-medium text-gray-700">
                      {store.avg_rating ? store.avg_rating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">Your Rating</p>
                  {store.user_rating ? (
                    <div className="flex items-center gap-1">
                      <StarRating rating={store.user_rating} size={16} />
                      <span className="text-sm font-medium text-blue-600">{store.user_rating}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Not rated</span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400 mb-2">
                  {store.user_rating ? 'Modify your rating' : 'Submit a rating'}
                </p>
                <StarRating
                  rating={store.user_rating ?? 0}
                  interactive={submitting !== store.id}
                  onRate={(r) => handleSubmitRating(store.id, r)}
                  size={24}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
