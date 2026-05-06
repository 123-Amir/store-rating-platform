import { useEffect, useState, useCallback } from 'react';
import { supabase, type UserProfile } from '../lib/supabase';
import SortHeader from '../components/SortHeader';
import { Search, UserPlus, X } from 'lucide-react';
import { validateAddUserForm } from '../lib/validations';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', address: '', password: '', role: 'normal_user' });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    let query = supabase.from('users').select('*');
    if (filters.name) query = query.ilike('name', `%${filters.name}%`);
    if (filters.email) query = query.ilike('email', `%${filters.email}%`);
    if (filters.address) query = query.ilike('address', `%${filters.address}%`);
    if (filters.role) query = query.eq('role', filters.role);
    query = query.order(sortField, { ascending: sortDir === 'asc' });
    const { data } = await query;
    setUsers(data ?? []);
    setLoading(false);
  }, [filters, sortField, sortDir]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateAddUserForm(addForm);
    setAddErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setAddLoading(true);
    setAddError('');
    const { error } = await supabase.auth.signUp({
      email: addForm.email,
      password: addForm.password,
      options: { data: { name: addForm.name, address: addForm.address, role: addForm.role } },
    });
    if (error) {
      setAddError(error.message);
    } else {
      setShowAddModal(false);
      setAddForm({ name: '', email: '', address: '', password: '', role: 'normal_user' });
      fetchUsers();
    }
    setAddLoading(false);
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      system_admin: 'bg-red-50 text-red-700 border-red-200',
      normal_user: 'bg-blue-50 text-blue-700 border-blue-200',
      store_owner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    const labels: Record<string, string> = {
      system_admin: 'Admin',
      normal_user: 'User',
      store_owner: 'Owner',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[role] || ''}`}>
        {labels[role] || role}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Users</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Search size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
          <select
            value={filters.role}
            onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">All Roles</option>
            <option value="system_admin">Admin</option>
            <option value="normal_user">User</option>
            <option value="store_owner">Owner</option>
          </select>
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
                <th className="px-6 py-3 text-left">
                  <SortHeader label="Role" field="role" currentSort={sortField} currentDir={sortDir} onSort={handleSort} />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No users found</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{u.address}</td>
                    <td className="px-6 py-4">{roleBadge(u.role)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {addError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{addError}</div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="user@example.com"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="8-16 chars, 1 uppercase, 1 special"
                />
                {addErrors.password && <p className="text-red-500 text-xs mt-1">{addErrors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="normal_user">Normal User</option>
                  <option value="store_owner">Store Owner</option>
                  <option value="system_admin">System Admin</option>
                </select>
                {addErrors.role && <p className="text-red-500 text-xs mt-1">{addErrors.role}</p>}
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
                  {addLoading ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
