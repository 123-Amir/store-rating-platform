import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RouterProvider, useRouter } from './lib/router';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminStoresPage from './pages/AdminStoresPage';
import AdminUserDetailPage from './pages/AdminUserDetailPage';
import UserStoresPage from './pages/UserStoresPage';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import Layout from './components/Layout';
import { LayoutDashboard, Users, Store, KeyRound } from 'lucide-react';

function Navigation() {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const { path } = useRouter();

  if (!profile) return null;

  const links: { label: string; path: string; icon: typeof LayoutDashboard }[] =
    profile.role === 'system_admin'
      ? [
          { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
          { label: 'Users', path: '/admin/users', icon: Users },
          { label: 'Stores', path: '/admin/stores', icon: Store },
        ]
      : profile.role === 'store_owner'
      ? [
          { label: 'Dashboard', path: '/owner', icon: LayoutDashboard },
        ]
      : [
          { label: 'Stores', path: '/stores', icon: Store },
        ];

  const passwordLink = profile.role === 'system_admin' ? '/admin/password' : profile.role === 'store_owner' ? '/owner/password' : '/stores/password';

  return (
    <div className="flex items-center gap-1 mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5">
      {links.map((link) => (
        <button
          key={link.path}
          onClick={() => navigate(link.path)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            path === link.path || path.startsWith(link.path + '/')
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <link.icon size={16} />
          {link.label}
        </button>
      ))}
      <button
        onClick={() => navigate(passwordLink)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          path === passwordLink
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <KeyRound size={16} />
        Password
      </button>
    </div>
  );
}

function AppRoutes() {
  const { user, profile, loading } = useAuth();
  const { path } = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    if (path === '/register') return <RegisterPage />;
    return <LoginPage />;
  }

  const role = profile.role;

  if (role === 'system_admin') {
    if (path === '/admin/users' || path === '/admin/users/') {
      return (
        <Layout title="User Management">
          <Navigation />
          <AdminUsersPage />
        </Layout>
      );
    }
    if (path.startsWith('/admin/users/')) {
      return (
        <Layout title="User Details">
          <Navigation />
          <AdminUserDetailPage />
        </Layout>
      );
    }
    if (path === '/admin/stores' || path === '/admin/stores/') {
      return (
        <Layout title="Store Management">
          <Navigation />
          <AdminStoresPage />
        </Layout>
      );
    }
    if (path === '/admin/password') {
      return (
        <Layout title="Update Password">
          <Navigation />
          <UpdatePasswordPage />
        </Layout>
      );
    }
    return (
      <Layout title="Admin Dashboard">
        <Navigation />
        <AdminDashboard />
      </Layout>
    );
  }

  if (role === 'store_owner') {
    if (path === '/owner/password') {
      return (
        <Layout title="Update Password">
          <Navigation />
          <UpdatePasswordPage />
        </Layout>
      );
    }
    return (
      <Layout title="Store Owner Dashboard">
        <Navigation />
        <StoreOwnerDashboard />
      </Layout>
    );
  }

  // Normal user
  if (path === '/stores/password') {
    return (
      <Layout title="Update Password">
        <Navigation />
        <UpdatePasswordPage />
      </Layout>
    );
  }
  return (
    <Layout title="Browse Stores">
      <Navigation />
      <UserStoresPage />
    </Layout>
  );
}

function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </RouterProvider>
  );
}

export default App;
