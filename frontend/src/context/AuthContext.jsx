// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (err) {
        localStorage.removeItem('token');
        toast.error('Phiên đăng nhập hết hạn');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser({ _id: data._id, name: data.name, email: data.email, phone: data.phone, role: data.role });
      toast.success('Đăng nhập thành công');
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
      return null;
    }
  };

  const register = async (name, email, phone, password, role) => {
    try {
      await api.post('/auth/register', { name, email, phone, password, role });
      toast.success('Đăng ký thành công. Vui lòng đăng nhập!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Đã đăng xuất');
  };

  const updateProfile = async (name) => {
    try {
      const { data } = await api.put('/auth/me', { name });
      setUser((prev) => ({ ...prev, name: data.name }));
      toast.success('Cập nhật tên thành công');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
      return false;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại!');
      localStorage.removeItem('token');
      setUser(null);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
      return false;
    }
  };

  const value = { user, loading, login, register, logout, updateProfile, changePassword };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};