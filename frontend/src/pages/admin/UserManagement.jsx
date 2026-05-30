import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Search, X } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '', role: 'customer' });

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      toast.error('Lỗi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user) => {
    setSelectedUser({ ...user });
    setEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${selectedUser._id}`, {
        name: selectedUser.name,
        email: selectedUser.email,
        phone: selectedUser.phone,
        role: selectedUser.role,
      });
      toast.success('Cập nhật thành công');
      setEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!newUser.password) {
        toast.error('Mật khẩu không được để trống');
        return;
      }
      await api.post('/users', newUser);
      toast.success('Tạo tài khoản thành công');
      setCreateModalOpen(false);
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'customer' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Tạo thất bại');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa vĩnh viễn user này?')) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('Đã xóa người dùng');
        fetchUsers();
      } catch (error) {
        toast.error('Lỗi khi xóa người dùng');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  const roleColors = {
    admin: 'bg-red-100 text-red-700',
    manager: 'bg-purple-100 text-purple-700',
    purchasing_staff: 'bg-blue-100 text-blue-700',
    technician: 'bg-orange-100 text-orange-700',
    customer: 'bg-green-100 text-green-700'
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Tài khoản</h2>
          <p className="text-gray-500 text-sm mt-1">Tổng cộng {users.length} tài khoản trong hệ thống.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm Email hoặc Tên..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0096ff] transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="w-full sm:w-auto bg-[#0096ff] hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition whitespace-nowrap shadow-sm"
          >
            + Thêm tài khoản
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">Tên người dùng</th>
                <th className="p-4 font-semibold">Liên hệ</th>
                <th className="p-4 font-semibold">Vai trò</th>
                <th className="p-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-gray-800">{u.email}</span>
                      <span className="text-xs text-gray-500">{u.phone || 'Chưa có SĐT'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => openEditModal(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                         <Pencil size={16} />
                       </button>
                       <button onClick={() => handleDelete(u._id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition">
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-8 text-gray-500">Không tìm thấy tài khoản nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <button 
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Chỉnh sửa tài khoản</h3>
              <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Tên</label>
                  <input 
                    type="text" 
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                    className="w-full border p-2 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                    className="w-full border p-2 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Số điện thoại</label>
                  <input 
                    type="text" 
                    value={selectedUser.phone || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                    className="w-full border p-2 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Phân quyền</label>
                  <select 
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                    className="w-full border p-2 rounded-lg text-sm focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="customer">Khách hàng</option>
                    <option value="purchasing_staff">Thu mua</option>
                    <option value="technician">Kỹ thuật</option>
                    <option value="manager">Quản lý</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-end gap-3">
                  <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-[#0096ff] text-white rounded-lg text-sm font-semibold hover:bg-blue-600">Lưu thay đổi</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {createModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <button 
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Tạo tài khoản mới</h3>
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Tên</label>
                  <input 
                    type="text" 
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full border p-2 rounded-lg text-sm focus:border-[#0096ff] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full border p-2 rounded-lg text-sm focus:border-[#0096ff] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Mật khẩu</label>
                  <input 
                    type="password" 
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full border p-2 rounded-lg text-sm focus:border-[#0096ff] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Số điện thoại</label>
                  <input 
                    type="text" 
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="w-full border p-2 rounded-lg text-sm focus:border-[#0096ff] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Phân quyền</label>
                  <select 
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full border p-2 rounded-lg text-sm focus:border-[#0096ff] focus:outline-none bg-white"
                  >
                    <option value="customer">Khách hàng</option>
                    <option value="purchasing_staff">Thu mua</option>
                    <option value="technician">Kỹ thuật</option>
                    <option value="manager">Quản lý</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-end gap-3">
                  <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-[#0096ff] text-white rounded-lg text-sm font-semibold hover:bg-blue-600">Tạo mới</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
