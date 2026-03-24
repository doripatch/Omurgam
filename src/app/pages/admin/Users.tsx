import { useState, useEffect } from 'react';
import { Users as UsersIcon, Shield, User, AtSign, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    console.log('🔍 AdminUsers component mounted');
    console.log('👤 Current user:', currentUser);
    console.log('🔐 Is authenticated:', isAuthenticated);
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      console.log('👥 Loading users...');
      console.log('🔑 Checking auth state...');
      console.log('👤 Current user from store:', currentUser);
      console.log('🔐 Is authenticated:', isAuthenticated);
      
      if (!isAuthenticated) {
        console.error('❌ User is not authenticated!');
        toast.error('Lütfen giriş yapın');
        return;
      }
      
      if (!currentUser) {
        console.error('❌ No current user in store!');
        toast.error('Kullanıcı bilgisi bulunamadı');
        return;
      }
      
      // Get current session
      const { supabase } = await import('../../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('📋 Session:', session ? 'EXISTS' : 'NULL');
      if (session?.access_token) {
        console.log('🔑 Token (first 30 chars):', session.access_token.substring(0, 30) + '...');
        console.log('🔑 Token length:', session.access_token.length);
      } else {
        console.error('❌ No access token in session!');
        toast.error('Session token bulunamadı');
        return;
      }
      
      console.log('🚀 Calling adminAPI.getUsers()...');
      const data = await adminAPI.getUsers();
      console.log('✅ Users loaded:', data);
      setUsers(data.users || []);
    } catch (error: any) {
      console.error('❌ Load users error:', error);
      toast.error(error.message || 'Kullanıcılar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await adminAPI.updateUserRole(userId, newRole);
      toast.success('Rol başarıyla güncellendi');
      loadUsers(); // Refresh list
    } catch (error: any) {
      console.error('Update role error:', error);
      toast.error(error.message || 'Rol güncellenemedi');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      toast.success('Kullanıcı silindi');
      loadUsers(); // Refresh list
    } catch (error: any) {
      console.error('Delete user error:', error);
      toast.error(error.message || 'Kullanıcı silinemedi');
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Kullanıcılar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Kullanıcı Yönetimi</h1>
          <p className="text-slate-600">Toplam {users.length} kullanıcı</p>
        </div>

        {/* Users Table */}
        <div className="backdrop-blur-xl bg-white/90 border border-purple-200/30 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Kullanıcı</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">E-posta</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Kayıt Tarihi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Rol</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Henüz kullanıcı bulunmuyor
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="font-medium text-slate-900">{user.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {user.role === 'admin' ? (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
                            <User className="w-3 h-3" />
                            Kullanıcı
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleRole(user.id, user.role)}
                            className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold text-sm rounded-xl transition-colors"
                          >
                            {user.role === 'admin' ? 'Kullanıcı Yap' : 'Admin Yap'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-sm rounded-xl transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}