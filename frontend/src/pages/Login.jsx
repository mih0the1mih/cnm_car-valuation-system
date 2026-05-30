// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result) {
      if (result.role === 'admin') {
        navigate('/admin');
      } else if (result.role === 'customer') {
        navigate('/customer/dashboard');
      } else if (result.role === 'technician') {
        navigate('/technician/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Mật khẩu</label>
          <input
            type="password"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Đăng nhập</button>
      </form>
      <p className="mt-4 text-center">
        Chưa có tài khoản? <Link to="/register" className="text-blue-500">Đăng ký</Link>
      </p>
    </div>
  );
};

export default Login;