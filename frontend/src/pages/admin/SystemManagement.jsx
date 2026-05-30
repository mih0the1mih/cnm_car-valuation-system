import React from 'react';
import { Database, TrendingUp, Settings, HardDrive } from 'lucide-react';

const SystemManagement = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý hệ thống</h2>
          <p className="text-gray-500 text-sm mt-1">Cấu hình danh mục, từ điển dữ liệu và sao lưu hệ thống.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1 */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Database size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">Danh mục Hãng & Dòng xe</h3>
              <p className="text-sm text-gray-500">24 Hãng xe, 342 Dòng xe</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-6">Cập nhật và thêm mới các hãng xe và dòng xe được hỗ trợ định giá.</p>
          <button className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-semibold transition w-full text-center">
            Quản lý danh mục
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">Bảng giá tham chiếu</h3>
              <p className="text-sm text-gray-500">Cập nhật lúc: 10:00 AM hôm nay</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-6">Điều chỉnh biên độ giá, cấu hình Model AI và thiết lập chiết khấu.</p>
          <button className="text-green-600 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg text-sm font-semibold transition w-full text-center">
            Điều chỉnh giá trị
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
              <Settings size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">Cấu hình hệ thống</h3>
              <p className="text-sm text-gray-500">Thông báo, Email, SMS</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-6">Cài đặt các thông số hoạt động cốt lõi của toàn hệ thống.</p>
          <button className="text-purple-600 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg text-sm font-semibold transition w-full text-center">
            Mở Cài đặt chung
          </button>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center shrink-0">
              <HardDrive size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">Sao lưu dữ liệu</h3>
              <p className="text-sm text-gray-500">Bản sao lưu gần nhất: Hôm qua</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-6">Xuất dữ liệu hệ thống, sao lưu định kỳ để phòng ngừa sự cố.</p>
          <button className="text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold transition w-full text-center">
            Quản lý bộ nhớ
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemManagement;
