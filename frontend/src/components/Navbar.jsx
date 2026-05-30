// frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Bell, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    const fetchPendingRequests = () => {
      const requests = JSON.parse(localStorage.getItem('storeCar_buy_requests')) || [];
      const pendingCount = requests.filter(req => req.status === 'pending').length;
      setPendingRequestsCount(pendingCount);
    };

    fetchPendingRequests();
    window.addEventListener('storage', fetchPendingRequests);
    window.addEventListener('buy_request_updated', fetchPendingRequests);

    return () => {
      window.removeEventListener('storage', fetchPendingRequests);
      window.removeEventListener('buy_request_updated', fetchPendingRequests);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white text-gray-800 border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 xl:px-8 flex justify-between items-center text-sm font-medium">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          {/* Car Icon SVG - Side Profile */}
          <svg width="52" height="32" viewBox="0 0 52 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Car Body */}
            <path d="M4 21H48V24H4V21Z" fill="#0096ff" />
            {/* Car Roof / Cabin */}
            <path d="M13 21L16 13H36L39 21H13Z" fill="#0096ff" />
            {/* Windshield highlight */}
            <path d="M18 14.5L16.5 20H25V14.5H18Z" fill="#e6f4ff" opacity="0.5" />
            <path d="M27 14.5V20H35.5L34 14.5H27Z" fill="#e6f4ff" opacity="0.5" />
            {/* Front bumper */}
            <path d="M39 21H46C47.1 21 48 21.9 48 23V24H39V21Z" fill="#0078cc" />
            {/* Rear bumper */}
            <path d="M4 21H13V24H4V23C4 21.9 4.9 21 4 21Z" fill="#0078cc" />
            {/* Front wheel */}
            <circle cx="40" cy="24.5" r="3.5" fill="#1a1a2e" />
            <circle cx="40" cy="24.5" r="1.8" fill="#cbd5e1" />
            <circle cx="40" cy="24.5" r="0.8" fill="#1a1a2e" />
            {/* Rear wheel */}
            <circle cx="13" cy="24.5" r="3.5" fill="#1a1a2e" />
            <circle cx="13" cy="24.5" r="1.8" fill="#cbd5e1" />
            <circle cx="13" cy="24.5" r="0.8" fill="#1a1a2e" />
            {/* Speed lines */}
            <line x1="1" y1="19" x2="8" y2="19" stroke="#0096ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <line x1="1" y1="22" x2="6" y2="22" stroke="#0096ff" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
          </svg>
          {/* Brand Text */}
          <div className="flex flex-col leading-none">
            <span className="text-xl font-extrabold text-[#0096ff] tracking-tight group-hover:text-blue-700 transition-colors">STORE</span>
            <span className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase">Car</span>
          </div>
        </Link>

        {/* Center Links */}
        <div className="hidden lg:flex items-center space-x-7 text-[#3f4b53]">
          <Link to="/buy-car" className="hover:text-[#0096ff]">Mua xe</Link>
          <Link to="/sell-car" className="hover:text-[#0096ff]">Bán xe</Link>
          <div className="flex items-center gap-1 cursor-pointer hover:text-[#0096ff]">
            Khám phá <ChevronDown size={14} className="text-gray-400" />
          </div>
          <Link to="/about" className="hover:text-[#0096ff]">Giới thiệu</Link>

          {/* Quick Access for Internal Staff */}
          {user && ['purchasing_staff', 'manager', 'admin'].includes(user.role) && (
            <div className="flex items-center gap-2">
              <Link to="/internal/post-car" className="bg-[#0096ff]/10 text-[#0096ff] px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 border border-[#0096ff]/20 hover:bg-[#0096ff] hover:text-white transition">
                🔥 Đăng xe
              </Link>
              <Link to="/internal/manage-cars" className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 border border-gray-200 hover:bg-gray-200 transition">
                📋 Quản lý xe
              </Link>
              <Link to="/internal/buy-requests" className="relative bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 border border-orange-200 hover:bg-orange-200 transition">
                📩 Yêu cầu mua
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {pendingRequestsCount}
                  </span>
                )}
              </Link>
            </div>
          )}
        </div>

        {/* Right Links */}
        <div className="flex items-center gap-5">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-[42px] h-[42px] rounded-full bg-[#0096ff] text-white flex items-center justify-center hover:bg-blue-600 transition shadow-sm"
              >
                <User size={22} strokeWidth={2} />
              </button>

              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                  ></div>
                  <div className="absolute top-14 right-0 mt-1 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 p-5 w-72 z-50 transform origin-top-right transition-all flex flex-col gap-4">
                    <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                      <div className="w-12 h-12 rounded-full bg-[#e6f4ff] text-[#0096ff] flex items-center justify-center font-bold text-lg">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-gray-800 leading-tight mb-1">
                          {user.name || 'Khách hàng'}
                        </span>
                        <span className="text-xs text-[#0096ff] font-semibold bg-blue-50 px-2 py-0.5 rounded w-max">
                          {user.role === 'customer' ? 'Khách hàng' : user.role.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 py-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Số điện thoại:</span>
                        <span className="font-semibold text-gray-800">{user.phone || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Email:</span>
                        <span className="font-semibold text-gray-800 truncate max-w-[140px]" title={user.email}>{user.email}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex flex-col gap-3 mt-1">
                      <div className="flex justify-between items-center">
                        <Link
                          to={user.role === 'customer' ? '/customer/dashboard' : '/dashboard'}
                          className="text-[#0096ff] hover:text-blue-700 text-sm font-semibold transition flex-1"
                          onClick={() => setShowDropdown(false)}
                        >
                          Xem chi tiết
                        </Link>
                        <Link
                          to="/change-password"
                          className="text-gray-600 hover:text-gray-800 text-sm font-semibold transition"
                          onClick={() => setShowDropdown(false)}
                        >
                          Đổi mật khẩu
                        </Link>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-white text-sm font-semibold px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition shadow-sm"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <User size={16} /> Tài khoản
              </Link>
              <button className="relative p-2 rounded-full hover:bg-gray-50 border border-gray-200 text-gray-600">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
          )}

          <div className="hidden sm:flex flex-col text-right border-l pl-5 border-gray-200">
            <span className="text-[11px] text-gray-500 leading-none mb-1">Hotline:</span>
            <span className="text-[#0096ff] font-bold text-base leading-none">0836304231</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;