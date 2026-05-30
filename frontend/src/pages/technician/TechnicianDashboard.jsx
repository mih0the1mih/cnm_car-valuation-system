import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInspectionList } from '../../services/technicianService';
import { Car, MapPin, Search, Calendar, ChevronRight, CheckCircle2, Clock, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';

const TechnicianDashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { getAllListings } = await import('../../services/carListingService');
        const allCars = await getAllListings();
        const techCars = allCars.filter(c => c.status === 'inspecting');
        
        const mapped = techCars.map(c => ({
           _id: c._id, 
           id: c._id, 
           brand: c.brand, 
           model: c.model, 
           year: c.year,
           mileage: c.mileage,
           status: c.status,
           image: c.image || c.images?.[0] || 'https://images.unsplash.com/photo-1550355291-bbee04a92027'
        }));
        setListings(mapped);
      } catch (err) {
        toast.error('Không thể lấy danh sách xe kiểm định');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filteredListings = listings.filter(car => 
    car.brand?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    car.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Wrench className="animate-spin text-blue-500" size={32} />
        <span className="text-gray-500 font-bold">Đang tải trung tâm kỹ thuật...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f7f9] py-10 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Khu Vực Kiểm Định</h1>
            <p className="text-gray-500 mt-2 font-medium">Danh sách các xe đang chờ bạn tiến hành kiểm tra kỹ thuật (Inspection / QC).</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <div className="relative w-full max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm theo hãng xe, dòng xe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            <div className="text-xs font-bold font-mono bg-blue-50 text-blue-600 px-3 py-2 rounded-lg border border-blue-100 uppercase tracking-wider">
              Workload: {filteredListings.length} xe
            </div>
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
            <CheckCircle2 size={48} className="text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Xin chúc mừng!</h3>
            <p className="text-gray-500">Bạn đã hoàn tất toàn bộ khối lượng công việc kiểm định xe hiện tại.</p>
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((car) => {
              const statusColors = {
                pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock, label: 'Chờ kiểm định' },
                inspecting: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Wrench, label: 'Đang kiểm tra' },
                inspected: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2, label: 'Đã hoàn tất QC' }
              };
              
              const st = statusColors[car.status] || statusColors.pending;
              const StatusIcon = st.icon;

              return (
                <div key={car._id} className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 hover:shadow-lg transition flex flex-col pt-6 relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-full h-1 ${car.status === 'inspected' ? 'bg-green-400' : car.status === 'inspecting' ? 'bg-blue-400' : 'bg-yellow-400'}`}></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-[19px] font-black text-gray-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                        {car.brand} {car.model}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1"><Calendar size={14}/> {car.year}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="flex items-center gap-1"><MapPin size={14}/> {car.mileage.toLocaleString()} km</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 mb-5 border border-gray-100 flex-1">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Khách hàng yêu cầu</div>
                    <div className="text-sm font-semibold text-gray-700">{car.customer?.name || 'Khách vãng lai'}</div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${st.bg} ${st.text} ${st.border}`}>
                      <StatusIcon size={14} /> {st.label}
                    </span>
                    
                    <Link
                      to={`/technician/inspect/${car._id}`}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        car.status === 'inspected' 
                        ? 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        : 'bg-[#0096ff] text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
                      }`}
                    >
                      {car.status === 'inspected' ? 'Xem lại' : 'Tiến hành KT'}
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianDashboard;