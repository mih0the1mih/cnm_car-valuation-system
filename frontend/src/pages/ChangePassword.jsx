import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { changePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentPassword === newPassword) {
      toast.error('Mật khẩu mới không được trùng với mật khẩu hiện tại!');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!');
      return;
    }

    const success = await changePassword(currentPassword, newPassword);
    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      navigate('/login'); 
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f7f9] py-10 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">Đổi mật khẩu</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              className="w-full border border-gray-300 p-2.5 rounded-xl focus:outline-none focus:border-[#0096ff] transition"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              className="w-full border border-gray-300 p-2.5 rounded-xl focus:outline-none focus:border-[#0096ff] transition"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              className="w-full border border-gray-300 p-2.5 rounded-xl focus:outline-none focus:border-[#0096ff] transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#0096ff] text-white py-3 rounded-xl font-bold mt-4 hover:bg-blue-600 transition shadow-sm"
          >
            Cập nhật mật khẩu
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-bold mt-2 hover:bg-gray-200 transition"
          >
            Hủy bỏ
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
