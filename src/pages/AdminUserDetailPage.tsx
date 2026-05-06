import { useEffect, useState } from 'react';
import { supabase, type UserProfile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from '../lib/router';
import StarRating from '../components/StarRating';
import { ArrowLeft } from 'lucide-react';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const { profile: adminProfile } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      if (!id || !adminProfile) return;
      const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
      setUser(data);

      if (data?.role === 'store_owner') {
        const { data: storeData } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', data.id)
          .maybeSingle();

        if (storeData) {
          const { data: ratingsData } = await supabase
            .from('ratings')
            .select('rating')
            .eq('store_id', storeData.id);
          if (ratingsData && ratingsData.length > 0) {
            const avg = ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length;
            setAvgRating(avg);
          }
        }
      }
      setLoading(false);
    }
    fetchUser();
  }, [id, adminProfile]);

  if (loading) {
    return <div className="bg-white rounded-2xl p-8 animate-pulse border border-gray-100"><div className="h-40 bg-gray-100 rounded-xl" /></div>;
  }

  if (!user) {
    return <div className="text-center py-12 text-gray-400">User not found</div>;
  }

  const roleLabel = user.role === 'system_admin' ? 'System Administrator' : user.role === 'store_owner' ? 'Store Owner' : 'Normal User';
  const roleColor = user.role === 'system_admin' ? 'bg-red-50 text-red-700 border-red-200' : user.role === 'store_owner' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200';

  return (
    <div className="space-y-6">
      <a href="/admin/users" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft size={16} />
        Back to Users
      </a>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-2 ${roleColor}`}>
              {roleLabel}
            </span>
          </div>
          {user.role === 'store_owner' && avgRating !== null && (
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Store Rating</p>
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(avgRating)} size={20} />
                <span className="text-lg font-bold text-gray-900">{avgRating.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email</p>
            <p className="text-sm text-gray-900">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Address</p>
            <p className="text-sm text-gray-900">{user.address}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Role</p>
            <p className="text-sm text-gray-900">{roleLabel}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Joined</p>
            <p className="text-sm text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
