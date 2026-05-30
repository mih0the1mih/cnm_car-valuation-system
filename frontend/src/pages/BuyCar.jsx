import React, { useState } from 'react';
import { Search, ChevronDown, Car, MapPin, Clock, DollarSign, MessageCircle, MoreHorizontal, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ChatWidget from '../components/ChatWidget';
import ValuationModal from '../components/ValuationModal';
import { carModels, formatPriceShortVND } from '../utils/valuationHelpers';

// Không còn dữ liệu mẫu - xe sẽ được thêm thủ công qua hệ thống nội bộ

const carBrands = ['Tất cả hãng xe', ...Object.keys(carModels)];

const provinces = [
  'Tất cả vị trí', 'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 
  'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau',
  'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 
  'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 
  'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 
  'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 
  'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 
  'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 
  'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];

const BuyCar = () => {
  const [vucarCertified, setVucarCertified] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [isValuationOpen, setIsValuationOpen] = useState(false);
  const [allCars, setAllCars] = useState([]);
  
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const history = JSON.parse(localStorage.getItem('storeCar_brand_history'));
      return Array.isArray(history) && history.length > 0 ? history : ['Toyota', 'Hyundai', 'Kia', 'Ford', 'Honda', 'Mazda', 'Mercedes-Benz', 'BMW'];
    } catch (e) {
      return ['Toyota', 'Hyundai', 'Kia', 'Ford', 'Honda', 'Mazda', 'Mercedes-Benz', 'BMW'];
    }
  });

  const handleBrandChange = (e) => {
    const newBrand = e.target.value;
    setBrandFilter(newBrand);
    if (newBrand) {
      setSearchHistory(prev => {
        const newHistory = [newBrand, ...prev.filter(b => b !== newBrand)].slice(0, 18); // Giữ tối đa 18 hãng gần nhất
        localStorage.setItem('storeCar_brand_history', JSON.stringify(newHistory));
        return newHistory;
      });
    }
  };
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleOpenValuation = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập hoặc đăng ký để định giá xe!', { icon: '🔒' });
      navigate('/login');
    } else {
      setIsValuationOpen(true);
    }
  };

  React.useEffect(() => {
    const fetchCars = async () => {
      try {
        const { getPublishedListings } = await import('../services/carListingService');
        const data = await getPublishedListings();
        
        // Map backend structure to frontend structure
        const mapped = data.cars.map(c => ({
          id: c._id,
          title: `${c.brand} ${c.model} ${c.year}`,
          brand: c.brand,
          location: c.location || 'Hà Nội',
          mileage: `${c.mileage.toLocaleString('vi-VN')} km`,
          price: c.price ? formatPriceShortVND(c.price) : 'Liên hệ',
          highestBid: c.price ? formatPriceShortVND(c.price) : '---',
          image: c.image || c.images?.[0] || 'https://images.unsplash.com/photo-1550355291-bbee04a92027',
          user: 'Store Car',
          userComment: c.notes || 'Xe đẹp, máy nguyên bản, hỗ trợ trả góp.',
          commentsCount: 0
        }));
        
        setAllCars(mapped);
      } catch (err) {
        toast.error('Không thể tải danh sách xe');
      }
    };
    fetchCars();
  }, []);

  const filteredCars = allCars.filter(car => {
    const matchesSearch = car.title.toLowerCase().includes(searchQuery.toLowerCase());
    const isAllBrands = brandFilter === '' || brandFilter === 'Tất cả hãng xe';
    const matchesBrand = isAllBrands || car.title.toLowerCase().includes(brandFilter.toLowerCase());
    
    const isAllLocations = locationFilter === '' || locationFilter === 'Tất cả vị trí';
    const matchesLocation = isAllLocations || car.location === locationFilter;
    
    return matchesSearch && matchesBrand && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-[#f3f7f9] py-8">
      <div className="max-w-[1400px] mx-auto px-4 xl:px-8 flex flex-col md:flex-row gap-6">
        
        {/* LETS SIDEBAR - FILTERS */}
        <aside className="w-full md:w-[280px] flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            {/* Filter Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Bộ lọc tìm kiếm</h2>
              <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500">
                <ChevronUp size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm kiếm</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm hãng xe, tên xe..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Hãng xe */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hãng xe</label>
              <div className="relative cursor-pointer">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Car size={16} className="text-gray-500" />
                </div>
                <select 
                  value={brandFilter} 
                  onChange={handleBrandChange}
                  className="appearance-none block w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {carBrands.map((brand, index) => (
                     <option key={index} value={brand === 'Tất cả hãng xe' ? '' : brand}>{brand}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                </div>
              </div>
            </div>

            {/* Vị trí */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Vị trí</label>
              <div className="relative cursor-pointer">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={16} className="text-gray-500" />
                </div>
                <select 
                  value={locationFilter} 
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="appearance-none block w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {provinces.map((province, index) => (
                    <option key={index} value={province === 'Tất cả vị trí' ? '' : province}>{province}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                 <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                </div>
              </div>
            </div>

            {/* Trạng thái tin đăng */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Trạng thái tin đăng</label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="w-4 h-4 border border-gray-300 rounded hover:border-blue-500 transition"></div>
                  <span className="text-sm text-gray-600">Đang bán</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="w-4 h-4 border border-gray-300 rounded hover:border-blue-500 transition"></div>
                  <span className="text-sm text-gray-600">Đã bán</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="w-4 h-4 border border-gray-300 rounded hover:border-blue-500 transition"></div>
                  <span className="text-sm text-gray-600">Có kiểm định</span>
                </label>
              </div>
            </div>

            {/* Toggle Chứng nhận */}
            <div className="pt-5 border-t border-gray-100 flex items-center justify-between">
              <div 
                className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${vucarCertified ? 'bg-blue-500' : 'bg-gray-200'}`}
                onClick={() => setVucarCertified(!vucarCertified)}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${vucarCertified ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
              <div className="flex items-center gap-2">
                <Car size={18} className="text-gray-600" />
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-gray-500 font-bold uppercase leading-none">Chứng nhận</span>
                  <span className="text-sm font-black text-gray-800 leading-tight">STORE CAR</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1">
          {/* AI Banner */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 flex flex-col lg:flex-row">
            {/* Left side */}
            <div className="bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] p-8 lg:w-5/12 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <h2 className="text-white text-2xl md:text-3xl font-black text-center uppercase z-10 leading-snug drop-shadow-md">
                Xe Của Bạn Có Thể<br /><span className="text-[#0096ff]">Bán Với Giá Bao Nhiêu?</span>
              </h2>
            </div>
            
            {/* Right side */}
            <div className="p-8 lg:w-7/12 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Định giá xe của bạn qua công cụ AI</h3>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                Mô hình AI định giá ô tô với hơn 3,5 triệu điểm dữ liệu, từ các dòng xe phổ biến trên thị trường.
              </p>
              <div>
                <button 
                  onClick={handleOpenValuation}
                  className="bg-[#0096ff] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600 transition shadow-md hover:shadow-lg"
                >
                  Định giá ngay
                </button>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-6">Các xe mới đăng bán</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCars.length > 0 ? (
              filteredCars.map((car) => (
                <div key={car.id} onClick={() => navigate(`/buy-car/${car.id}`)} className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] overflow-hidden border border-gray-100 flex flex-col hover:shadow-lg transition-shadow duration-300 group cursor-pointer">
                {/* Image & Overlays */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={car.image} 
                    alt={car.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Bottom Gradient for text visibility */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent"></div>
                  
                  {/* Info Row on image */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
                    <div className="flex items-center gap-1.5 flex-1">
                      <Clock size={14} className="text-gray-200" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-300 font-medium">Lượt xem</span>
                        <span className="text-sm font-bold">125</span>
                      </div>
                    </div>
                    
                    <div className="w-px h-8 bg-white/30 mx-3"></div>

                    <div className="flex items-center gap-1.5 flex-1 justify-end">
                      <div className="w-5 h-5 rounded-full border-2 border-green-400 flex items-center justify-center text-[10px] font-bold text-green-400">
                        $
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-gray-300 font-medium">Giá bán</span>
                        <span className="text-sm font-bold">{car.highestBid}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-800 text-[15px] mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {car.title}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500 mb-4 font-medium">
                    <span>{car.location}</span>
                    <span className="mx-2">•</span>
                    <span>{car.mileage}</span>
                  </div>

                  {/* Separator / Spacer to push comment to bottom if needed */}
                  <div className="flex-1"></div>

                  {/* Comment Section (Bottom) */}
                  {car.user ? (
                    <div className="flex flex-col gap-1 mt-2">
                       <span className="text-sm font-bold text-gray-800">{car.user}</span>
                       <div className="flex items-end justify-between">
                         <p className="text-sm text-gray-500 line-clamp-1 flex-1 pr-2">{car.userComment}</p>
                         <div className="relative flex-shrink-0">
                           <MessageCircle size={20} className="text-blue-500" strokeWidth={1.5} />
                           {car.commentsCount > 0 && (
                             <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                               {car.commentsCount}
                             </span>
                           )}
                         </div>
                       </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-2 text-gray-400">
                      <span className="text-sm">{car.userComment}</span>
                      <MessageCircle size={20} strokeWidth={1.5} className="opacity-50" />
                    </div>
                  )}
                </div>
              </div>
            ))
            ) : (
              <div className="col-span-full py-10 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Car size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-lg font-medium">Không tìm thấy xe phù hợp.</p>
                <p className="text-sm mt-1">Vui lòng thử lại với bộ lọc khác.</p>
              </div>
            )}

            {/* Banner - Store Car CTA */}
            <div className="bg-[#0096ff] rounded-2xl shadow-sm overflow-hidden flex flex-col relative text-white col-span-1 sm:col-span-2 lg:col-span-1">
               <div className="p-6 relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-1.5 font-bold text-xl mb-4">
                    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 16H25V18H7V16ZM4 20H28C29.1046 20 30 20.8954 30 22V24H2V22C2 20.8954 2.89543 20 4 20ZM7 12L9 8H23L25 12H7Z" fill="currentColor"/>
                    </svg>
                    <span>store car</span>
                  </div>
                  <h3 className="text-[17px] font-bold leading-snug mb-8">
                    Định giá xe và thu mua xe cũ chính xác, nhanh chóng và minh bạch
                  </h3>
                  
                  <div className="mt-auto">
                     <div className="h-24 opacity-20 bg-white/20 rounded-xl"></div>
                  </div>
               </div>
               <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
            </div>
            
          </div>
        </main>
      </div>

      {/* SEO & Keywords Section */}
      <div className="max-w-7xl mx-auto px-4 w-full mt-12 mb-20">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-6">Mua bán xe ô tô giá tốt 04/2026 tại Store Car</h2>
          <div className="text-sm text-gray-600 space-y-3 leading-relaxed mb-8">
            <p>Tìm kiếm chiếc ô tô chất lượng với giá tốt nhất ngay hôm nay tại Store Car, nền tảng mua bán ô tô hàng đầu Việt Nam. Với các dòng xe ô tô đã qua sử dụng, bạn sẽ dễ dàng tìm được chiếc xe ưng ý với giá cả hợp lý và thông tin chi tiết về tình trạng xe.</p>
            <p>Thông tin chi tiết về giá trị xe ô tô đã qua sử dụng, giúp bạn đưa ra quyết định nhanh chóng.</p>
            <p>Thông tin xe chính xác và minh bạch: Tất cả xe bán tại Store Car đều được kiểm định kỹ càng, với thông tin rõ ràng về tình trạng và giá trị xe.</p>
            <p>Giá cả hấp dẫn: Cam kết cung cấp giá tốt nhất trên thị trường cho xe ô tô cũ, giúp bạn mua hoặc bán xe một cách tiết kiệm và hiệu quả.</p>
            <p>Hãy để Store Car giúp bạn dễ dàng mua bán xe ô tô cũ một cách an toàn và nhanh chóng. Với công cụ định giá xe chính xác bằng AI, chúng tôi cam kết mang đến cho bạn trải nghiệm mua bán xe cũ uy tín, đảm bảo chất lượng cao và giá trị hợp lý nhất trên thị trường.</p>
            <p>Với hệ thống định giá và thu mua xe có hơn 2000 lượt giao dịch và dịch vụ hỗ trợ khách hàng tận tâm, Store Car đảm bảo bạn sẽ được thu mua ô tô cũ giá cao nhất. Chúng tôi cung cấp kiểm tra và định giá xe miễn phí, giúp bạn đưa ra quyết định bán xe thông minh và hiệu quả.</p>
          </div>
          
          <h3 className="text-base font-bold text-gray-800 mb-4">Các từ khóa liên quan:</h3>
          <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3 text-sm text-gray-600">
            {searchHistory.map((brand, index) => (
              <li 
                key={index} 
                className="flex items-center gap-2 cursor-pointer hover:text-blue-500 transition-colors group"
                onClick={() => setBrandFilter(brand)}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 group-hover:bg-blue-500 transition-colors"></div>
                Hãng {brand}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CHAT WIDGET */}
      <ChatWidget />
      
      {/* VALUATION MODAL */}
      <ValuationModal isOpen={isValuationOpen} onClose={() => setIsValuationOpen(false)} />
    </div>
  );
};

export default BuyCar;
