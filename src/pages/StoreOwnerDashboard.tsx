import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import StarRating from '../components/StarRating';
import { Store, Users, Star } from 'lucide-react';

interface RatingWithUser {
  id: string;
  rating: number;
  created_at: string;
  user_id: string;
  user_name: string;
}

export default function StoreOwnerDashboard() {
  const { profile } = useAuth();
  const [store, setStore] = useState<{ id: string; name: string; address: string } | null>(null);
  const [ratings, setRatings] = useState<RatingWithUser[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!profile) return;
    const { data: storeData } = await supabase
      .from('stores')
      .select('id, name, address')
      .eq('owner_id', profile.id)
      .maybeSingle();

    if (storeData) {
      setStore(storeData);
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('id, rating, created_at, user_id, user:users(name)')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      if (ratingsData) {
        const mapped = ratingsData.map((r: Record<string, unknown>) => ({
          id: r.id as string,
          rating: r.rating as number,
          created_at: r.created_at as string,
          user_id: r.user_id as string,
          user_name: (r.user as Record<string, string>)?.name ?? 'Unknown',
        }));
        setRatings(mapped);
        if (mapped.length > 0) {
          const avg = mapped.reduce((sum, r) => sum + r.rating, 0) / mapped.length;
          setAvgRating(avg);
        }
      }
    }
    setLoading(false);
  }, [profile]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 animate-pulse border border-gray-100">
          <div className="h-20 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <Store size={48} className="text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Store Assigned</h3>
        <p className="text-gray-500">You don't have a store assigned yet. Contact an administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Store Info Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{store.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{store.address}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-400">Average Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={avgRating ? Math.round(avgRating) : 0} size={20} />
                <span className="text-lg font-bold text-gray-900">{avgRating?.toFixed(1) ?? 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Raters</p>
              <p className="text-3xl font-bold text-gray-900">{ratings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Star size={24} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-3xl font-bold text-gray-900">{avgRating?.toFixed(1) ?? 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="font-semibold text-gray-900">User Ratings</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ratings.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">No ratings yet</td></tr>
              ) : (
                ratings.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.user_name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StarRating rating={r.rating} size={16} />
                        <span className="text-sm text-gray-600">{r.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
