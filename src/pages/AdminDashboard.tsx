import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Store, Star } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [usersRes, storesRes, ratingsRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('stores').select('id', { count: 'exact', head: true }),
        supabase.from('ratings').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        users: usersRes.count ?? 0,
        stores: storesRes.count ?? 0,
        ratings: ratingsRes.count ?? 0,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'bg-blue-500', lightColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Total Stores', value: stats.stores, icon: Store, color: 'bg-emerald-500', lightColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { label: 'Total Ratings', value: stats.ratings, icon: Star, color: 'bg-amber-500', lightColor: 'bg-amber-50', textColor: 'text-amber-600' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-gray-100">
            <div className="h-16 bg-gray-100 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${card.lightColor} rounded-xl flex items-center justify-center`}>
              <card.icon size={24} className={card.textColor} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
