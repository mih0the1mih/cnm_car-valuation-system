import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyListings, deleteListing } from '../../services/carListingService';
import { useAuth } from '../../context/AuthContext';
import { BarChart2, Car, Bell, Settings, Sparkles, Phone, Mail, Calendar, MessageSquarePlus } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const fetchListings = async () => {
    try {
      const data = await getMyListings();
      setListings(data);
    } catch (err) {
      toast.error('Không thể tải danh sách xe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleSaveName = async () => {
    if (!editNameValue.trim()) {
      toast.error('Tên không được để trống');
      return;
    }
    setIsSavingName(true);
    const success = await updateProfile(editNameValue);
    if (success) {
      setIsEditingName(false);
    }
    setIsSavingName(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa yêu cầu này?')) {
      try {
        await deleteListing(id);
        toast.success('Đã xóa yêu cầu');
        fetchListings();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Xóa thất bại');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      priced: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const textMap = {
      pending: 'Chờ xử lý',
      priced: 'Đã định giá',
      accepted: 'Đã chấp thuận',
      rejected: 'Từ chối',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusMap[status]}`}>
        {textMap[status]}
      </span>
    );
  };

  const formatPrice = (price) => {
    if (!price) return '0 ₫';
    const actualPrice = price < 1000000 ? price * 1000000 : price;
    return `${actualPrice.toLocaleString()} ₫`;
  };

  if (loading) return <div className="text-center p-8">Đang tải...</div>;

  return (
    <div className="bg-[#f0f4f8] min-h-screen py-8 flex flex-col items-center font-sans w-full">
      
      {/* Top Profile Card */}
      <div className="bg-white rounded-3xl w-full max-w-4xl p-6 md:p-8 flex items-start gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 mb-6">
        <div className="w-16 h-16 rounded-full bg-[#dcf1ff] flex items-center justify-center text-[#0096ff] font-bold text-2xl shrink-0">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 pt-1">
          <div className="text-[11px] font-bold text-[#0096ff] tracking-widest mb-1 uppercase">MY STORE CAR</div>
          <h1 className="text-[28px] font-bold text-gray-800 leading-tight mb-2">Xin chào, {user?.name || user?.phone || 'Khách hàng'}</h1>
          <p className="text-gray-500 text-[15px] mb-8 max-w-lg">
            Quản lý xe, tin nhắn và toàn bộ hành trình bán xe của bạn ở một nơi.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-2">
            <div className="flex-1 bg-[#f9fbff] rounded-xl px-5 py-4 border border-gray-100 flex justify-between items-center group">
              <div>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-400 block mb-1 uppercase">TÊN KHÁCH HÀNG</span>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-800 focus:outline-none focus:border-[#0096ff]"
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      autoFocus
                    />
                    <button 
                      onClick={handleSaveName}
                      disabled={isSavingName}
                      className="text-white bg-[#0096ff] hover:bg-blue-600 px-3 py-1 rounded text-xs font-semibold"
                    >
                      {isSavingName ? 'Lưu...' : 'Lưu'}
                    </button>
                    <button 
                      onClick={() => setIsEditingName(false)}
                      className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{user?.name || 'Chưa cập nhật'}</span>
                    <button 
                      onClick={() => {
                        setEditNameValue(user?.name || '');
                        setIsEditingName(true);
                      }}
                      className="text-[#0096ff] opacity-0 group-hover:opacity-100 transition flex items-center gap-1 text-xs"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> 
                      Sửa
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 bg-[#f9fbff] rounded-xl px-5 py-4 border border-gray-100">
              <span className="text-[10px] sm:text-xs font-semibold text-gray-400 block mb-1 uppercase">SỐ ĐIỆN THOẠI</span>
              <span className="text-sm font-semibold text-gray-800">{user?.phone || 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="bg-white rounded-2xl w-full max-w-4xl p-2.5 shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-gray-50 mb-6 flex items-center overflow-x-auto no-scrollbar gap-2">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-3 py-3 px-2 rounded-xl transition ${activeTab === 'overview' ? 'bg-[#f0f8ff] text-[#0096ff]' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <BarChart2 size={18} className={activeTab === 'overview' ? 'text-[#0096ff]' : 'text-[#a1b3c9]'} />
          <div className="text-left leading-tight">
            <span className={`block text-[15px] font-semibold ${activeTab === 'overview' ? 'text-gray-800' : 'text-gray-600'}`}>Tổng quan</span>
            <span className="text-[11px] text-gray-400 font-medium">Toàn bộ hành trình</span>
          </div>
        </button>
        <div className="w-[1px] h-8 bg-gray-100 mx-1"></div>
        <button 
          onClick={() => setActiveTab('my_cars')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-3 py-3 px-2 rounded-xl transition ${activeTab === 'my_cars' ? 'bg-[#f0f8ff] text-[#0096ff]' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Car size={18} className={activeTab === 'my_cars' ? 'text-[#0096ff]' : 'text-[#a1b3c9]'} />
          <div className="text-left leading-tight">
            <span className={`block text-[15px] font-semibold ${activeTab === 'my_cars' ? 'text-gray-800' : 'text-gray-600'}`}>Xe của tôi</span>
            <span className="text-[11px] text-gray-400 font-medium">Garage và hồ sơ</span>
          </div>
        </button>
        <div className="w-[1px] h-8 bg-gray-100 mx-1"></div>
        <button 
          onClick={() => setActiveTab('account')}
          className={`flex-1 min-w-[140px] pl-3 py-3 px-2 rounded-xl transition flex items-center gap-3 ${activeTab === 'account' ? 'bg-[#f0f8ff] text-[#0096ff]' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center shrink-0">
             <Bell size={14} className={activeTab === 'account' ? 'text-[#0096ff]' : 'text-[#a1b3c9]'} />
          </div>
          <div className="flex items-center gap-3">
             <Settings size={18} className={activeTab === 'account' ? 'text-[#0096ff]' : 'text-[#a1b3c9]'} />
             <div className="text-left leading-tight">
               <span className={`block text-[15px] font-semibold ${activeTab === 'account' ? 'text-gray-800' : 'text-gray-600'}`}>Tài khoản</span>
               <span className="text-[11px] text-gray-400 font-medium">Hồ sơ và thông báo</span>
             </div>
          </div>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl w-full max-w-4xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center justify-center min-h-[350px]">
        {activeTab === 'overview' && (
          <div className="text-center max-w-md mx-auto py-10">
            <div className="text-gray-300 mb-6 flex justify-center">
              <svg width="80" height="auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.4-1.7-1-2.2l-2.2-1.7c-.5-.4-1.2-.6-1.8-.6H7c-.6 0-1.2.2-1.8.6L3 10.8c-.6.5-1 1.3-1 2.2V16c0 .6.4 1 1 1h2"/>
                 <path d="M7 17v2c0 .6.4 1 1 1h8c.6 0 1-.4 1-1v-2"/>
                 <path d="M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
                 <path d="M17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
                 <path d="M4 11l1.5-2.5C6 7.6 7 7 8 7h8c1 0 2 .6 2.5 1.5L20 11"/>
              </svg>
            </div>
            <h2 className="text-[22px] font-bold text-gray-800 mb-3">Chào mừng bạn đến My Store Car</h2>
            <p className="text-[#a0afbf] text-[15px] mb-8 leading-relaxed">
              Định giá xe của bạn ngay để biết giá trị<br/>hiện tại và bắt đầu hành trình bán xe.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/customer/new-listing" className="bg-[#0096ff] hover:bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg text-sm shadow-sm transition">
                Định giá xe ngay
              </Link>
              <Link to="/customer/new-listing" className="bg-white border border-[#0096ff] hover:bg-blue-50 text-[#0096ff] font-semibold py-2.5 px-6 rounded-lg text-sm transition">
                Đăng ký bán xe
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'my_cars' && (
          <div className="w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Xe của tôi</h2>
              <Link to="/customer/new-listing" className="text-[#0096ff] font-semibold hover:underline text-sm flex items-center gap-1">
                + Đăng bán thêm xe
              </Link>
            </div>
            
            {listings.length === 0 ? (
              <div className="text-center p-10 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-500 mb-2">Bạn chưa đăng bán xe nào.</p>
                <Link to="/customer/new-listing" className="text-[#0096ff] text-sm font-semibold hover:underline">
                  Bắt đầu đăng bán xe ngay
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {listings.map((listing) => (
                  <div key={listing._id} className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white relative">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {listing.brand} {listing.model}
                        </h3>
                        <p className="text-gray-500 text-sm">{listing.year} • {listing.mileage.toLocaleString()} km</p>
                      </div>
                      {getStatusBadge(listing.status)}
                    </div>
                    <div className="text-sm space-y-1 mt-4 bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Giá mong muốn:</span>
                        <span className="font-semibold text-gray-800">{formatPrice(listing.desiredPrice)}</span>
                      </div>
                      {listing.suggestedPrice && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Giá đề xuất AI:</span>
                          <span className="font-semibold text-[#0096ff]">{formatPrice(listing.suggestedPrice)}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-2 gap-2">
                      <button onClick={() => toast('Tính năng "Lịch sử định giá" đang phát triển')} className="text-[11px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 py-2 rounded transition flex items-center justify-center gap-1">
                        📊 Lịch sử định giá
                      </button>
                      <button onClick={() => toast('Tính năng "Bảo dưỡng / Giao dịch" đang phát triển')} className="text-[11px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 py-2 rounded transition flex items-center justify-center gap-1">
                        🔧 Lịch sử bảo dưỡng
                      </button>
                      <button onClick={() => toast('Tính năng "Hồ sơ giấy tờ" đang phát triển')} className="text-[11px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 py-2 rounded transition flex items-center justify-center gap-1">
                        📄 Hồ sơ giấy tờ
                      </button>
                      <button onClick={() => toast('Tính năng "Cập nhật tình trạng" đang phát triển')} className="text-[11px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 py-2 rounded transition flex items-center justify-center gap-1">
                        ✍️ Cập nhật xe
                      </button>
                    </div>

                    <div className="mt-4 flex gap-3 border-t pt-4">
                      <Link to={`/customer/listing/${listing._id}`} className="flex-1 text-center bg-blue-50 hover:bg-blue-100 text-[#0096ff] py-2.5 rounded-lg text-sm font-semibold transition">
                        Xem chi tiết
                      </Link>
                      {listing.status === 'pending' && (
                        <button onClick={() => handleDelete(listing._id)} className="flex-1 text-center bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg text-sm font-semibold transition">
                          Hủy yêu cầu
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'account' && (
          <div className="w-full flex flex-col gap-6 text-left">
            
            {/* Card 1: Thông tin cá nhân */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Thông tin cá nhân</h3>
              <p className="text-sm text-gray-500 mb-6">Dữ liệu này giúp đội ngũ hỗ trợ chăm sóc bạn chính xác hơn.</p>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4 bg-[#f9fafb] hover:bg-blue-50/50 transition p-4 rounded-2xl border border-gray-50">
                  <div className="w-10 h-10 shrink-0 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-[#0096ff]">
                    <Sparkles size={18} />
                  </div>
                  <div>
                     <span className="block text-[11px] font-medium text-gray-400 mb-0.5">Tên khách hàng</span>
                     <span className="block text-[15px] font-bold text-gray-800">{user?.name || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#f9fafb] hover:bg-blue-50/50 transition p-4 rounded-2xl border border-gray-50">
                  <div className="w-10 h-10 shrink-0 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <Phone size={18} />
                  </div>
                  <div>
                     <span className="block text-[11px] font-medium text-gray-400 mb-0.5">Số điện thoại</span>
                     <span className="block text-[15px] font-bold text-gray-800">{user?.phone || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#f9fafb] hover:bg-blue-50/50 transition p-4 rounded-2xl border border-gray-50">
                  <div className="w-10 h-10 shrink-0 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <Mail size={18} />
                  </div>
                  <div>
                     <span className="block text-[11px] font-medium text-gray-400 mb-0.5">Email</span>
                     <span className="block text-[15px] font-bold text-gray-800">{user?.email || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#f9fafb] hover:bg-blue-50/50 transition p-4 rounded-2xl border border-gray-50">
                  <div className="w-10 h-10 shrink-0 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <Calendar size={18} />
                  </div>
                  <div>
                     <span className="block text-[11px] font-medium text-gray-400 mb-0.5">Thành viên từ</span>
                     <span className="block text-[15px] font-bold text-gray-800">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }) : 'tháng 4 năm 2026'}
                     </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Thông báo */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
               <div className="flex justify-between items-center mb-1">
                 <h3 className="text-xl font-bold text-gray-800">Thông báo</h3>
                 <Bell size={20} className="text-[#0096ff]" />
               </div>
               <p className="text-sm text-gray-500 mb-6">Bật để nhận cập nhật mới về đấu giá, tin nhắn và tiến trình xe.</p>
               
               <div className="flex items-center justify-between bg-[#f9fafb] p-5 rounded-2xl border border-gray-50">
                 <div>
                    <h4 className="text-[15px] font-bold text-gray-800 mb-1">Nhận thông báo từ My Store Car</h4>
                    <p className="text-xs text-gray-500 mb-4">Tin nhắn bot, biến động giá và các mốc quan trọng của xe.</p>
                    <span className="text-[11px] font-medium text-gray-500 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm transition-all">
                      {notificationsEnabled ? 'Thông báo đang bật' : 'Thông báo đã tắt'}
                    </span>
                 </div>
                 <div 
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`w-[50px] h-7 rounded-full relative cursor-pointer shadow-inner transition-colors duration-300 ${notificationsEnabled ? 'bg-[#0096ff]' : 'bg-gray-300'}`}
                 >
                    <div className={`w-[22px] h-[22px] bg-white rounded-full absolute top-[3px] shadow-sm transform transition-transform duration-300 ${notificationsEnabled ? 'left-[25px]' : 'left-[3px]'}`}></div>
                 </div>
               </div>
            </div>

            {/* Card 3: Góp ý chung */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
               <div className="flex justify-between items-center mb-1">
                 <h3 className="text-xl font-bold text-gray-800">Góp ý chung</h3>
                 <MessageSquarePlus size={20} className="text-[#0096ff]" />
               </div>
               <p className="text-sm text-gray-500 mb-6">Chia sẻ ý kiến để giúp chúng tôi phục vụ bạn tốt hơn.</p>
               
               <button className="bg-[#f0f8ff] text-[#0096ff] hover:bg-blue-100 transition px-6 py-2.5 rounded-full text-[13px] font-bold shadow-sm">
                 Gửi góp ý
               </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;