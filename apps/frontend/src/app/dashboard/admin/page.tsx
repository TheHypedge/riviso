'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { authService } from '@/lib/auth';
import {
  Users,
  Globe,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
  Shield,
  Loader,
  AlertCircle,
  Mail,
  Clock,
  X,
  Trash2,
  ExternalLink,
  Search,
  Eye,
} from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  totalWebsites: number;
  usersRegisteredToday: number;
  usersRegisteredThisWeek: number;
  usersRegisteredThisMonth: number;
  adminUsers: number;
  regularUsers: number;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  onboardingCompleted?: boolean;
  websiteIds?: string[];
  phone?: string;
  createdAt: string;
  updatedAt?: string;
  integrations?: {
    provider: string;
    connectedAt: string;
    externalId?: string;
  }[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get<SystemStats>('/v1/admin/stats'),
        api.get<AdminUser[]>('/v1/admin/users'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        router.push('/dashboard');
      } else {
        setError('Failed to load admin data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setDeleting(userId);
    try {
      await api.delete(`/v1/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      setSelectedUser(null);
      // Refresh stats
      const statsRes = await api.get<SystemStats>('/v1/admin/stats');
      setStats(statsRes.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-spin" />
            <p className="text-slate-600">Loading admin dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          </div>
          <p className="text-slate-600">System overview and user management</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.totalUsers}
              color="blue"
            />
            <StatCard
              icon={CheckCircle}
              label="Verified Users"
              value={stats.verifiedUsers}
              color="green"
            />
            <StatCard
              icon={XCircle}
              label="Unverified Users"
              value={stats.unverifiedUsers}
              color="red"
            />
            <StatCard
              icon={Globe}
              label="Total Websites"
              value={stats.totalWebsites}
              color="purple"
            />
            <StatCard
              icon={Calendar}
              label="Registered Today"
              value={stats.usersRegisteredToday}
              color="cyan"
            />
            <StatCard
              icon={TrendingUp}
              label="This Week"
              value={stats.usersRegisteredThisWeek}
              color="indigo"
            />
            <StatCard
              icon={TrendingUp}
              label="This Month"
              value={stats.usersRegisteredThisMonth}
              color="pink"
            />
            <StatCard
              icon={Shield}
              label="Admin Users"
              value={stats.adminUsers}
              color="amber"
            />
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">All Users</h2>
                <p className="text-sm text-slate-600">{filteredUsers.length} of {users.length} users</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Websites
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {user.emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 text-sm">
                            <Clock className="w-4 h-4" />
                            Pending
                          </span>
                        )}
                        {user.onboardingCompleted && (
                          <span className="text-xs text-slate-500">Onboarding done</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                        <Globe className="w-3 h-3" />
                        {user.websiteIds?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deleting === user.id}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete User"
                          >
                            {deleting === user.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onDelete={() => handleDeleteUser(selectedUser.id)}
          deleting={deleting === selectedUser.id}
        />
      )}
    </DashboardLayout>
  );
}

function UserDetailsModal({
  user,
  onClose,
  onDelete,
  deleting,
}: {
  user: AdminUser;
  onClose: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-white">
              <h3 className="text-xl font-bold">{user.name}</h3>
              <p className="text-sm text-purple-100">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Role</p>
              <p className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                {user.role === 'admin' && <Shield className="w-4 h-4 text-purple-600" />}
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Status</p>
              <p className={`text-lg font-semibold ${user.emailVerified ? 'text-green-600' : 'text-amber-600'}`}>
                {user.emailVerified ? 'Verified' : 'Pending Verification'}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Registered</p>
              <p className="text-lg font-semibold text-slate-900">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Phone</p>
              <p className="text-lg font-semibold text-slate-900">
                {user.phone || 'Not provided'}
              </p>
            </div>
          </div>

          {/* Linked Websites */}
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Linked Websites ({user.websiteIds?.length ?? 0})
            </h4>
            {user.websiteIds && user.websiteIds.length > 0 ? (
              <div className="space-y-2">
                {user.websiteIds.map((websiteId, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-blue-50 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-slate-900">{websiteId}</span>
                    </div>
                    <a
                      href={websiteId.startsWith('http') ? websiteId : `https://${websiteId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl">
                <Globe className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-slate-500">No websites linked</p>
              </div>
            )}
          </div>

          {/* Integrations */}
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Integrations
            </h4>
            {user.integrations && user.integrations.length > 0 ? (
              <div className="space-y-2">
                {user.integrations.map((integration, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-green-50 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-slate-900">
                        {integration.provider.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      Connected {new Date(integration.connectedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl">
                <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-slate-500">No integrations connected</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {user.role !== 'admin' && (
            <div className="border-t border-slate-200 pt-4">
              <button
                onClick={onDelete}
                disabled={deleting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete User
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'red' | 'purple' | 'cyan' | 'indigo' | 'pink' | 'amber';
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-600',
    green: 'from-green-500 to-green-600 bg-green-50 text-green-600',
    red: 'from-red-500 to-red-600 bg-red-50 text-red-600',
    purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-600',
    cyan: 'from-cyan-500 to-cyan-600 bg-cyan-50 text-cyan-600',
    indigo: 'from-indigo-500 to-indigo-600 bg-indigo-50 text-indigo-600',
    pink: 'from-pink-500 to-pink-600 bg-pink-50 text-pink-600',
    amber: 'from-amber-500 to-amber-600 bg-amber-50 text-amber-600',
  };

  const [bg, iconBg] = colors[color].split(' ');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${iconBg} ${colors[color].split(' ')[2]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
