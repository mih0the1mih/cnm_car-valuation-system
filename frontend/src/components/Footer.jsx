import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [isZaloModalOpen, setIsZaloModalOpen] = useState(false);

  return (
    <footer className="bg-white border-t-4 border-[#0096ff] pt-12 pb-8 text-sm text-gray-700">
      <div className="max-w-7xl mx-auto px-4 w-full">

        {/* Top Section with Logo */}
        <div className="flex items-center gap-2 font-bold text-[#0096ff] text-2xl mb-8">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 16H25V18H7V16ZM4 20H28C29.1046 20 30 20.8954 30 22V24H2V22C2 20.8954 2.89543 20 4 20ZM7 12L9 8H23L25 12H7Z" fill="currentColor" />
          </svg>
          <span className="flex items-center gap-2">
            store car <span className="text-gray-400 font-normal text-sm border-l border-gray-300 pl-2">Nền tảng Mua bán xe qua đấu giá</span>
          </span>
        </div>

        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 border-b border-gray-100 pb-10">

          {/* Col 1 */}
          <div>
            <h4 className="font-bold text-gray-800 mb-4 text-base">Dịch vụ</h4>
            <ul className="space-y-3 mb-8">
              <li><Link to="/buy-car" className="hover:text-[#0096ff] transition">Mua xe</Link></li>
              <li>
                <Link to="/sell-car" className="hover:text-[#0096ff] transition flex items-center gap-2">
                  Bán xe xăng - Lên xế điện <span className="bg-[#0096ff] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Mới</span>
                </Link>
              </li>
              <li><Link to="/info/tu-van-chon-xe" className="hover:text-[#0096ff] transition">Tư vấn chọn xe</Link></li>
              <li><Link to="/info/faq" className="hover:text-[#0096ff] transition">FAQ</Link></li>
              <li><Link to="/info/quy-trinh-mua-ban" className="hover:text-[#0096ff] transition">Quy trình mua bán</Link></li>
              <li><Link to="/info/bang-gia" className="hover:text-[#0096ff] transition">Bảng giá</Link></li>
            </ul>

            <h4 className="font-bold text-gray-800 mb-4 text-base">Nhận thông tin mới nhất</h4>
            <div className="flex flex-col gap-3">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Nhập email..."
                  className="flex-1 border border-gray-200 rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0096ff]"
                />
                <button className="bg-[#0096ff] text-white px-4 py-2 rounded-r-lg font-semibold hover:bg-blue-600 transition">
                  Đăng ký
                </button>
              </div>
              <label className="flex items-start gap-2 cursor-pointer mt-1">
                <input type="checkbox" defaultChecked className="mt-1 flex-shrink-0" />
                <span className="text-xs text-gray-500 leading-tight">
                  Tôi đã đọc, hiểu rõ và đồng ý với <Link to="/info/chinh-sach-bao-mat" className="text-[#0096ff] hover:underline">Chính sách bảo mật</Link> và <Link to="/info/quy-che-hoat-dong" className="text-[#0096ff] hover:underline">Quy chế hoạt động</Link> của Store Car
                </span>
              </label>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-bold text-gray-800 mb-4 text-base">Được quan tâm</h4>
            <ul className="space-y-3">
              <li><Link to="/info/ban-xe-gia-tot" className="hover:text-[#0096ff] transition">Bán xe giá tốt</Link></li>
              <li><Link to="/info/su-kien-uu-dai" className="hover:text-[#0096ff] transition">Sự kiện ưu đãi</Link></li>
              <li><Link to="/info/danh-cho-nguoi-mua" className="hover:text-[#0096ff] transition">Dành cho Người mua</Link></li>
              <li><Link to="/info/danh-cho-nguoi-ban" className="hover:text-[#0096ff] transition">Dành cho Người bán</Link></li>
              <li><Link to="/about" className="hover:text-[#0096ff] transition">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-bold text-gray-800 mb-4 text-base">Chính sách</h4>
            <ul className="space-y-3">
              <li><Link to="/info/chinh-sach-bao-mat" className="hover:text-[#0096ff] transition">Chính sách bảo mật thông tin cá nhân</Link></li>
              <li><Link to="/info/chinh-sach-ho-tro-khach-hang" className="hover:text-[#0096ff] transition">Chính sách hỗ trợ khách hàng</Link></li>
              <li><Link to="/info/chinh-sach-ho-tro-sau-ban-hang" className="hover:text-[#0096ff] transition">Chính sách hỗ trợ sau bán hàng</Link></li>
              <li><Link to="/info/chinh-sach-kiem-dinh-xe" className="hover:text-[#0096ff] transition">Chính sách kiểm định xe</Link></li>
              <li><Link to="/info/chinh-sach-thanh-toan" className="hover:text-[#0096ff] transition">Chính sách thanh toán</Link></li>
              <li><Link to="/info/quy-che-hoat-dong" className="hover:text-[#0096ff] transition">Quy chế hoạt động</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-bold text-gray-800 mb-4 text-base">Liên hệ chúng tôi</h4>
            <ul className="space-y-4">
              <li>
                <a href="tel:1800646896" className="flex items-center gap-2 hover:text-[#0096ff] transition text-[#0096ff] font-semibold">
                  <span>📞</span> 0836304231
                </a>
              </li>
              <li>
                <button onClick={() => setIsZaloModalOpen(true)} className="flex items-center gap-2 hover:text-[#0096ff] transition text-[#0096ff]">
                  <span className="font-bold text-[10px] border border-[#0096ff] px-1 rounded">Zalo</span> Store Car Zalo
                </button>
              </li>

              <li>
                <a href="mailto:hello@storecar.net" className="flex items-center gap-2 hover:text-[#0096ff] transition">
                  <span>✉</span> hello@storecar.net
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h3 className="font-bold text-gray-800 text-base mb-3 uppercase">CÔNG TY CP STORE CAR</h3>
            <p className="text-gray-600 leading-relaxed">
              Bạn cần bán xe ô tô của mình? Store Car kết nối xe của bạn với 2000+ người thu mua toàn quốc, giúp bạn bán xe nhanh gọn, giá cao.
            </p>
          </div>
          <div className="md:col-span-2 text-gray-500 text-sm leading-relaxed space-y-1">
            <p>Mã số thuế: 0317215558 do Sở Kế hoạch và Đầu tư thành phố Hồ Chí Minh cấp ngày 23/3/2026</p>
            <p><strong className="text-gray-600 font-semibold">Văn phòng đại diện tại Việt Nam:</strong> Phường 14, Phạm Văn Chiêu, Quận Gò Vấp , TP. Hồ Chí Minh.</p>
            <p><strong className="text-gray-600 font-semibold">Văn phòng đại diện tại Singapore:</strong> STORE CAR PTE.LTD. 60 Paya Lebar Road#10, 03 Paya Lebar Square Singapore 409051</p>
            <p>Số điện thoại:0846304231</p>
            <p>Email: hello@storecar.vn</p>
            <p>Người đại diện theo pháp luật: Nguyễn Quốc Trọng – Trần Phú Vinh : Tổng Giám đốc - Đối tác đầu tư</p>
            <p>Tài khoản ngân hàng: VPBank Chi nhánh TPHCM - 258460391 - CONG TY CP STORE CAR</p>
          </div>
        </div>

      </div>

      {/* Zalo QR Modal */}
      {isZaloModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative max-w-[360px] w-full flex flex-col items-center animate-fade-in-up">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsZaloModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-4xl font-light leading-none z-10"
            >
              ×
            </button>

            {/* Hiển thị nguyên vẹn ảnh QR Zalo người dùng đã gửi */}
            <img src="/zalo-qr-full.png" alt="Zalo QR" className="w-full h-auto rounded-2xl shadow-2xl object-contain max-h-[85vh]" />

          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
