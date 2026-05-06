import { LogOut, Shield, User, Store } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const { profile, signOut } = useAuth();

  const roleLabel = profile?.role === 'system_admin'
    ? 'System Administrator'
    : profile?.role === 'store_owner'
    ? 'Store Owner'
    : 'Normal User';

  const roleIcon = profile?.role === 'system_admin'
    ? <Shield size={16} />
    : profile?.role === 'store_owner'
    ? <Store size={16} />
    : <User size={16} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Store size={18} className="text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">StoreRate</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full">
                  {roleIcon}
                  <span className="hidden sm:inline">{roleLabel}</span>
                </span>
                <span className="hidden md:inline text-gray-400">|</span>
                <span className="hidden md:inline">{profile?.name}</span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        {children}
      </main>
    </div>
  );
}
