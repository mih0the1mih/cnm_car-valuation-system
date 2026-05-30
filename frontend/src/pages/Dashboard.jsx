// frontend/src/pages/Dashboard.jsx
import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Car, BarChart2, Settings, ClipboardList, ShieldCheck, Wrench, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  if (user.role === 'customer') return <Navigate to="/customer/dashboard" replace />;
  if (user.role === 'technician') return <Navigate to="/technician/dashboard" replace />;

  const adminCards = [
    {
      icon: <Users size={24} />,
      iconBg: 'bg-blue-50 text-blue-600',
      title: 'Quản lý người dùng',
      desc: 'Xem, phân quyền và quản lý tài khoản khách hàng, nhân viên trong hệ thống.',
      btnLabel: 'Vào quản lý',
      btnCls: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
      to: '/admin'
    },
    {
      icon: <Car size={24} />,
      iconBg: 'bg-green-50 text-green-600',
      title: 'Quản lý xe & Pipeline',
      desc: 'Theo dõi toàn bộ luồng xe: Đang thu mua → Kiểm định → Phê duyệt → Đăng bán.',
      btnLabel: 'Xem danh sách',
      btnCls: 'text-green-600 bg-green-50 hover:bg-green-100',
      to: '/internal/manage-cars'
    },
    {
      icon: <BarChart2 size={24} />,
      iconBg: 'bg-purple-50 text-purple-600',
      title: 'Báo cáo & Thống kê',
      desc: 'Doanh thu, hiệu suất thu mua, tỷ lệ chuyển đổi và hiệu quả định giá AI.',
      btnLabel: 'Xem báo cáo',
      btnCls: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
      to: '/admin'
    },
    {
      icon: <Settings size={24} />,
      iconBg: 'bg-gray-100 text-gray-600',
      title: 'Cấu hình hệ thống',
      desc: 'Quản lý danh mục xe, bảng giá AI, cài đặt thông báo và sao lưu dữ liệu.',
      btnLabel: 'Mở cài đặt',
      btnCls: 'text-gray-700 bg-gray-100 hover:bg-gray-200',
      to: '/admin'
    },
  ];

  const managerCards = [
    {
      icon: <ClipboardList size={24} />,
      iconBg: 'bg-blue-50 text-blue-600',
      title: 'Phê duyệt xe đăng bán',
      desc: 'Xem xét và phê duyệt các hồ sơ xe đã qua kiểm định, chốt giá bán chính thức.',
      btnLabel: 'Duyệt ngay',
      btnCls: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
      to: '/internal/manage-cars'
    },
    {
      icon: <Car size={24} />,
      iconBg: 'bg-green-50 text-green-600',
      title: 'Pipeline thu mua',
      desc: 'Theo dõi tiến độ thu mua, trạng thái kiểm định và bàn giao xe về kho.',
      btnLabel: 'Xem pipeline',
      btnCls: 'text-green-600 bg-green-50 hover:bg-green-100',
      to: '/internal/manage-cars'
    },
    {
      icon: <BarChart2 size={24} />,
      iconBg: 'bg-purple-50 text-purple-600',
      title: 'Báo cáo lợi nhuận',
      desc: 'Hiệu suất thu mua, biên lợi nhuận từng xe và tổng doanh số theo tháng.',
      btnLabel: 'Xem báo cáo',
      btnCls: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
      to: '/dashboard'
    },
  ];

  const staffCards = [
    {
      icon: <Car size={24} />,
      iconBg: 'bg-blue-50 text-blue-600',
      title: 'Đăng xe thu mua',
      desc: 'Tạo hồ sơ xe mới từ thông tin khách hàng, định giá AI và gửi duyệt quản lý.',
      btnLabel: 'Thêm xe mới',
      btnCls: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
      to: '/internal/post-car'
    },
    {
      icon: <ClipboardList size={24} />,
      iconBg: 'bg-green-50 text-green-600',
      title: 'Danh sách xe đang xử lý',
      desc: 'Xem tất cả xe đang trong pipeline thu mua, cập nhật trạng thái và thông tin.',
      btnLabel: 'Xem danh sách',
      btnCls: 'text-green-600 bg-green-50 hover:bg-green-100',
      to: '/internal/manage-cars'
    },
  ];

  const cards = user.role === 'admin' ? adminCards : user.role === 'manager' ? managerCards : staffCards;

  const roleLabel = {
    admin: { label: 'Quản trị viên', color: 'bg-red-100 text-red-700', icon: <ShieldCheck size={14} /> },
    manager: { label: 'Quản lý', color: 'bg-purple-100 text-purple-700', icon: <BarChart2 size={14} /> },
    purchasing_staff: { label: 'Nhân viên thu mua', color: 'bg-blue-100 text-blue-700', icon: <Wrench size={14} /> },
  }[user.role] || { label: user.role, color: 'bg-gray-100 text-gray-700', icon: null };

  return (
    <div className="min-h-screen bg-[#f3f7f9] py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#0096ff] text-white flex items-center justify-center text-xl font-black shadow">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-800">Xin chào, {user.name}!</h1>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${roleLabel.color}`}>
                {roleLabel.icon} {roleLabel.label}
              </span>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-2 pl-1">Chọn chức năng bên dưới để bắt đầu làm việc.</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                  {card.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-800">{card.title}</h3>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-5">{card.desc}</p>
              <Link
                to={card.to}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${card.btnCls}`}
              >
                {card.btnLabel} <ArrowRight size={15} />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;