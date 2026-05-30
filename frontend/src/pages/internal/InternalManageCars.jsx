import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutList, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { calculateValuation } from '../../utils/valuationHelpers';

const InternalManageCars = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const role = user?.role || 'purchasing_staff';

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const { getAllListings } = await import('../../services/carListingService.js');
      const data = await getAllListings();
      const mapped = data.map(c => ({
        ...c,
        customerDetails: {
          name: c.customer?.name || 'Khách hàng',
          phone: c.customer?.phone || '--'
        },
        staffPrice: c.price ? Math.round(c.price/1000000) : null
      }));
      setCars(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách xe');
    }
  };

  const filteredCars = cars.filter(car => {
    const term = searchTerm.toLowerCase();
    const searchMatch = car.brand?.toLowerCase().includes(term) || 
                        car.model?.toLowerCase().includes(term) || 
                        car.customerDetails?.name?.toLowerCase().includes(term) ||
                        car.customerDetails?.phone?.includes(term);
    if (!searchMatch) return false;

    // PHÂN QUYỀN MỚI CHO 8 TRẠNG THÁI
    if (role === 'purchasing_staff') {
      // Nhìn thấy xe của mình phụ trách (tức là xe nào không phải published/sold, hoặc assigned cho mình)
      // Tạm thời hiển thị tất cả các trạng thái đang làm việc (trừ inspecting vì kỹ thuật đang giữ)
      return ['pending', 'contacted', 'inspected', 'pricing'].includes(car.status);
    }
    if (role === 'manager' || role === 'admin') {
      // Quản lý nhìn từ pending để phân công, và approved, published
      return true; // Manager thấy full
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const map = {
      pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700' },
      contacted: { label: 'Đã liên hệ', color: 'bg-blue-100 text-blue-700' },
      inspecting: { label: 'Trạm kiểm tra', color: 'bg-purple-100 text-purple-700' },
      inspected: { label: 'Chờ định giá', color: 'bg-indigo-100 text-indigo-700' },
      pricing: { label: 'Đang chốt giá', color: 'bg-orange-100 text-orange-700' },
      approved: { label: 'Chờ đăng Web', color: 'bg-green-100 text-green-700' },
      published: { label: 'Hiển thị Web', color: 'bg-teal-100 text-teal-800' },
      sold: { label: 'Đã bán', color: 'bg-gray-200 text-gray-700' }
    };
    const ui = map[status] || map.pending;
    return <span className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${ui.color}`}>{ui.label}</span>;
  };

  const handleDelete = (carId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá hồ sơ này không? Hành động này sẽ xoá luôn bài đăng trên trang mua xe (nếu có).')) return;
    
    // Xoá trong pipeline_cars
    const pipelineCars = JSON.parse(localStorage.getItem('storeCar_pipeline_cars')) || [];
    const updatedPipeline = pipelineCars.filter(c => String(c._id) !== String(carId));
    localStorage.setItem('storeCar_pipeline_cars', JSON.stringify(updatedPipeline));

    // Xoá trong published_cars
    const publishedCars = JSON.parse(localStorage.getItem('storeCar_published_cars')) || [];
    const updatedPublished = publishedCars.filter(c => String(c.id) !== String(carId));
    localStorage.setItem('storeCar_published_cars', JSON.stringify(updatedPublished));

    // Cập nhật lại state
    setCars(prev => prev.filter(c => String(c._id) !== String(carId)));
    toast.success('Đã xoá hồ sơ và bài đăng liên quan thành công!');
  };

  const getActionBtn = (car) => {
    const isManagerOrAdmin = role === 'manager' || role === 'admin';
    return (
      <div className="flex flex-col gap-2 w-full">
        <button 
          onClick={() => navigate(`/internal/car/${car._id}`)}
          className="text-xs font-bold px-4 py-2 bg-[#0096ff] text-white rounded-lg hover:bg-blue-600 transition shadow-sm w-full"
        >
          Mở Hồ Sơ ({car.status === 'published' ? 'Xem' : 'Xử lý'})
        </button>
        {isManagerOrAdmin && (
          <button 
             onClick={() => handleDelete(car._id)}
             className="text-xs font-bold px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition shadow-sm w-full"
          >
             Xoá Hồ Sơ
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f3f7f9] py-10 px-4 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LayoutList size={28} className="text-[#0096ff]" />
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">Hệ Thống Phê Duyệt 8 Bước</h1>
            </div>
            <p className="text-gray-500 font-medium">Bảng điều khiển luồng hồ sơ (Đang đăng nhập dưới quyền: {role}).</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="relative w-full max-w-sm">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Tìm SĐT, Tên khách, Tên xe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0096ff] transition"
              />
            </div>
            <div className="text-xs font-bold text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
              Hồ sơ hợp lệ: <span className="text-[#0096ff]">{filteredCars.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="p-5 font-bold">Hình / Trạng Thái</th>
                  <th className="p-5 font-bold">Chi tiết xe</th>
                  <th className="p-5 font-bold">Khách hàng</th>
                  <th className="p-5 font-bold">Mốc Giá Tham Chiếu</th>
                  <th className="p-5 font-bold text-center w-36">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCars.length > 0 ? (
                  filteredCars.map((car) => {
                    let aiPrice = car.aiInitialPrice || car.techInfo?.aiBenchmarkPrice;
                    if (!aiPrice || isNaN(parseFloat(aiPrice))) {
                      try {
                        const valuationData = { brand: car.brand, model: car.model, year: car.year, version: car.version, odo: car.mileage };
                        aiPrice = calculateValuation(valuationData).estimated_price;
                      } catch (e) {}
                    }
                    const techPrice = car.techInfo?.techPrice;
                    const staffPrice = car.staffPrice;

                    return (
                      <tr key={car._id} className="hover:bg-[#f8fbff] transition-colors group">
                        <td className="p-5 w-40">
                          <div className="flex flex-col gap-2">
                             <div className="w-full h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50 relative">
                               {car.images?.[0] || car.techInfo?.damageImages?.[0] ? (
                                 <img src={car.images?.[0] || car.techInfo.damageImages[0]} alt="car" className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-gray-300"><span className="text-[10px] font-bold">NO IMG</span></div>
                               )}
                             </div>
                             {getStatusBadge(car.status)}
                          </div>
                        </td>
                        <td className="p-5 align-top pt-6">
                          <div className="font-black text-gray-800 text-[15px] mb-1">{car.brand} {car.model}</div>
                          <div className="text-xs text-gray-500 font-medium">Đời {car.year} • {car.version || 'Tiêu chuẩn'}</div>
                          <div className="text-xs text-gray-500 font-medium mt-1 uppercase">ODO: {car.mileage?.toLocaleString() || 0} km</div>
                        </td>
                        <td className="p-5 align-top pt-6">
                          <div className="text-sm font-bold text-gray-700">{car.customerDetails?.name || 'Chưa rõ'}</div>
                          <div className="text-xs font-semibold text-gray-500 mt-1">{car.customerDetails?.phone || '--'}</div>
                        </td>
                        <td className="p-5 align-top pt-6">
                           <div className="flex flex-col gap-1 text-xs">
                             <div className="flex justify-between border-b border-gray-100 pb-1">
                               <span className="text-gray-400 font-semibold">Giá AI định:</span> 
                               <span className="font-bold text-blue-500">{!isNaN(parseFloat(aiPrice)) && parseFloat(aiPrice) > 0 ? `${Math.round(parseFloat(aiPrice)/1000000)}Tr` : '--'}</span>
                             </div>
                             <div className="flex justify-between border-b border-gray-100 pb-1">
                               <span className="text-gray-400 font-semibold">Giá Tech chốt:</span> 
                               <span className="font-bold text-gray-700">{!isNaN(parseFloat(techPrice)) && parseFloat(techPrice) > 0 ? `${techPrice}Tr` : '--'}</span>
                             </div>
                             <div className="flex justify-between">
                               <span className="text-gray-400 font-semibold">Thu Mua báo:</span> 
                               <span className="font-black text-green-600">{staffPrice ? `${staffPrice}Tr` : '--'}</span>
                             </div>
                           </div>
                        </td>
                        <td className="p-5 text-right align-top pt-6">
                          {getActionBtn(car)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="p-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <CheckCircle size={40} className="mb-3 text-gray-300" />
                        <span className="font-bold">Danh sách việc đang trống.</span>
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

export default InternalManageCars;
