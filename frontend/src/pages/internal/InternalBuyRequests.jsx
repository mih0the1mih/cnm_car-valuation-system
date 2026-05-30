import React, { useState, useEffect } from 'react';
import { MessageSquare, Phone, CheckCircle, Clock, LayoutList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const InternalBuyRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  
  const role = user?.role || 'purchasing_staff';

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const list = JSON.parse(localStorage.getItem('storeCar_buy_requests')) || [];
    // Sort by latest
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setRequests(list);
  };

  const updateStatus = (id, newStatus) => {
    const updated = requests.map(req => {
      if (req.id === id) {
        return { ...req, status: newStatus };
      }
      return req;
    });
    setRequests(updated);
    localStorage.setItem('storeCar_buy_requests', JSON.stringify(updated));
    window.dispatchEvent(new Event('buy_request_updated'));
    toast.success('Đã cập nhật trạng thái yêu cầu');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-700 flex items-center gap-1 w-fit"><Clock size={12}/> Chờ xử lý</span>;
      case 'contacted':
        return <span className="px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 flex items-center gap-1 w-fit"><Phone size={12}/> Đã liên hệ</span>;
      case 'resolved':
        return <span className="px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-700 flex items-center gap-1 w-fit"><CheckCircle size={12}/> Hoàn tất</span>;
      default:
        return <span className="px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 w-fit">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f7f9] py-10 px-4 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={28} className="text-[#0096ff]" />
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">Quản Lý Yêu Cầu Mua Xe</h1>
            </div>
            <p className="text-gray-500 font-medium">Theo dõi các liên hệ hỏi mua xe từ khách hàng trực tuyến.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-bold text-gray-800">Danh sách yêu cầu ({requests.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="p-5 font-bold">Thời gian / Trạng thái</th>
                  <th className="p-5 font-bold">Khách hàng</th>
                  <th className="p-5 font-bold">Thông tin xe quan tâm</th>
                  <th className="p-5 font-bold">Nội dung / Lời nhắn</th>
                  <th className="p-5 font-bold text-center w-40">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-[#f8fbff] transition-colors group">
                      <td className="p-5 align-top">
                        <div className="text-sm font-bold text-gray-700 mb-2">
                          {new Date(req.createdAt).toLocaleString('vi-VN')}
                        </div>
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="p-5 align-top">
                        <div className="font-black text-gray-800 text-[15px] mb-1">{req.customerName}</div>
                        <div className="text-sm text-[#0096ff] font-bold flex items-center gap-1.5"><Phone size={14}/> {req.customerPhone}</div>
                      </td>
                      <td className="p-5 align-top">
                        <div className="font-bold text-gray-700 text-[14px]">{req.carTitle}</div>
                        <div className="text-xs text-gray-500 font-medium mt-1">Mức giá niêm yết: <span className="text-[#0096ff] font-bold">{req.carPrice}</span></div>
                      </td>
                      <td className="p-5 align-top">
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 max-w-sm whitespace-pre-wrap">
                          {req.message}
                        </div>
                      </td>
                      <td className="p-5 align-top text-center space-y-2">
                         {req.status === 'pending' && (
                           <button onClick={() => updateStatus(req.id, 'contacted')} className="w-full text-xs font-bold px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition border border-blue-100">
                             Chuyển Đã Liên Hệ
                           </button>
                         )}
                         {req.status === 'contacted' && (
                           <button onClick={() => updateStatus(req.id, 'resolved')} className="w-full text-xs font-bold px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition border border-green-100">
                             Đánh dấu Hoàn Tất
                           </button>
                         )}
                         <a href={`tel:${req.customerPhone}`} className="block w-full text-xs font-bold px-3 py-2 bg-[#0096ff] text-white rounded-lg hover:bg-blue-600 transition shadow-sm text-center">
                           Gọi ngay
                         </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <CheckCircle size={40} className="mb-3 text-gray-300" />
                        <span className="font-bold">Hiện chưa có yêu cầu mua xe nào.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternalBuyRequests;
