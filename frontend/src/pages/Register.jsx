// frontend/src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const generateCaptcha = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    setCaptchaText(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Vui lòng nhập địa chỉ email hợp lệ (ví dụ: abc@gmail.com)');
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      toast.error('Số điện thoại phải bao gồm đúng 10 chữ số!');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (captchaInput !== captchaText) {
      toast.error('Mã xác minh không chính xác!');
      generateCaptcha();
      setCaptchaInput('');
      return;
    }
    const result = await register(name, email, phone, password, role);
    if (result) {
      navigate('/login');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Đăng ký tài khoản</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Họ tên</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
          <label className="block mb-1">Số điện thoại</label>
          <input
            type="tel"
            className="w-full border p-2 rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
        <div className="mb-4">
          <label className="block mb-1">Xác nhận mật khẩu</label>
          <input
            type="password"
            className="w-full border p-2 rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {/* Captcha Section */}
        <div className="mb-6">
          <label className="block mb-2 text-sm text-gray-600">Xác minh bạn không phải là máy</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1 relative">
              <div 
                className="bg-gray-100 border border-gray-200 rounded px-4 py-2 flex-1 text-center font-mono font-bold tracking-[0.3em] overflow-hidden select-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMCAwTDRfNE00XzBMMF80IiBzdHJva2U9IiNlZGU5ZjIiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] text-lg text-gray-700" 
                style={{textDecoration: 'line-through decoration-gray-400 decoration-2'}}
              >
                {captchaText}
              </div>
              <button 
                type="button" 
                onClick={generateCaptcha}
                className="p-2 text-gray-500 hover:text-[#0096ff] hover:bg-blue-50 rounded transition shrink-0"
                title="Tải lại mã"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 2v6h6"/></svg>
              </button>
            </div>
            <input
              type="text"
              className="w-full sm:w-1/2 border p-2 rounded focus:outline-none focus:border-[#0096ff] transition font-mono uppercase text-sm"
              placeholder="Nhập mã bên cạnh..."
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
              required
            />
          </div>
        </div>

        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded">Đăng ký</button>
      </form>
      <p className="mt-4 text-center">
        Đã có tài khoản? <Link to="/login" className="text-blue-500">Đăng nhập</Link>
      </p>
    </div>
  );
};

export default Register;