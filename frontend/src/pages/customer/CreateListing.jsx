import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createListing } from '../../services/carListingService';
import { carModels, calculateValuation } from '../../utils/valuationHelpers';
import toast from 'react-hot-toast';
import { ChevronRight, Globe, TrendingUp, Clock, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    version: '', // Thêm phiên bản
    mileage: '',
    condition: 'good',
    desiredPrice: '',
    exterior: '',
    interior: '',
    engine: '',
    notes: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1 && (!formData.brand || !formData.model || !formData.year)) {
      toast.error('Vui lòng điền đủ Hãng xe, Dòng xe và Năm sản xuất');
      return;
    }
    if (step === 2 && (!formData.mileage || !formData.desiredPrice)) {
      toast.error('Vui lòng điền đủ Số km và Giá mong muốn');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!agreed) {
      toast.error('Bạn cần đồng ý với chính sách của Store Car');
      return;
    }
    setLoading(true);
    try {
      await createListing({
        ...formData,
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage),
        desiredPrice: parseInt(formData.desiredPrice) * 1000000,
      });

      // Tính trước một mức AI Price ban đầu dựa trên form cơ bản
      const valuationResult = calculateValuation({
         brand: formData.brand,
         model: formData.model,
         year: formData.year,
         version: formData.version,
         odo: formData.mileage
      });

      // Theo pipeline, xe khách gửi lên sẽ được đẩy qua cho Technician kiểm định
      const pipelineCars = JSON.parse(localStorage.getItem('storeCar_pipeline_cars')) || [];
      
      const customerMock = {
         name: user?.name || 'Khách hàng Ẩn danh',
         phone: user?.phone || '0901234567',
         email: user?.email || 'customer@gmail.com'
      };

      const timeNow = new Date();
      const historyLog = [
         { time: timeNow.toISOString(), action: 'Khách hàng gửi yêu cầu định giá rủi ro', actor: 'customer' }
      ];

      const pendingCar = {
        _id: Date.now().toString(),
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        version: formData.version,
        mileage: formData.mileage,
        techInfo: null, // Sẽ có techPrice và damage
        staffPrice: null, // Sẽ có staff price khi định giá
        aiInitialPrice: valuationResult.estimated_price,
        customerDetails: customerMock,
        history: historyLog,
        status: 'pending', 
        statusLabel: 'Chờ phân công xử lý',
        timeCreated: timeNow.toISOString(),
        desiredPrice: parseInt(formData.desiredPrice) * 1000000,
        customerNotes: formData.notes,
        exterior: formData.exterior,
        interior: formData.interior,
        engineInfo: formData.engine
      };
      
      pipelineCars.push(pendingCar);
      localStorage.setItem('storeCar_pipeline_cars', JSON.stringify(pipelineCars));

      toast.success('Gửi hồ sơ thành công! Xe đang chờ lịch kiểm định.');
      navigate('/customer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi khi gửi bài');
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 3;

  return (
    <div className="min-h-screen bg-[#f7f9fc] font-sans flex flex-col">
      {/* Navbar Giả lập style Vucar cho cảm giác giống x100 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex text-sm text-gray-500 font-medium">
          <Link to="/" className="hover:text-[#0096ff]">Trang chủ</Link>
          <ChevronRight size={18} className="mx-2 text-gray-400" />
          <span className="text-gray-800">Điền thông tin</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center pt-8 px-4 pb-20">
        
        {/* Vùng Báo Cáo Tiến Trình */}
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between font-bold text-[#0096ff] mb-4">
            {step < totalSteps ? (
               <span>Chưa đủ thông tin. Còn <span className="text-xl mx-1">{totalSteps - step} bước</span> để hoàn tất.</span>
            ) : (
               <span className="text-green-500">Tuyệt vời! Thông tin đã đầy đủ.</span>
            )}
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`flex-1 h-2 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#0096ff]' : 'bg-gray-100'}`}
              ></div>
            ))}
          </div>
        </div>

        {/* Vùng Form Chính */}
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-4">Thông tin xe cơ bản</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Hãng xe <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select 
                      name="brand" 
                      value={formData.brand} 
                      onChange={(e) => setFormData({...formData, brand: e.target.value, model: '', version: ''})} 
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#0096ff] bg-gray-50/50 appearance-none text-gray-700 cursor-pointer"
                    >
                      <option value="" disabled>Chọn hãng xe</option>
                      {Object.keys(carModels).map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Dòng xe <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select 
                      name="model" 
                      value={formData.model} 
                      onChange={handleChange} 
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#0096ff] bg-gray-50/50 appearance-none text-gray-700 cursor-pointer disabled:opacity-50"
                      disabled={!formData.brand}
                    >
                      <option value="" disabled>Chọn dòng xe</option>
                      {formData.brand && carModels[formData.brand] && Object.keys(carModels[formData.brand]).map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Đời xe (Năm) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select 
                      name="year" 
                      value={formData.year} 
                      onChange={handleChange} 
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#0096ff] bg-gray-50/50 appearance-none text-gray-700 cursor-pointer"
                    >
                      <option value="" disabled>Chọn đời xe</option>
                      {Array.from({length: 25}, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phiên bản (Tuỳ chọn)</label>
                  <div className="relative">
                    <select 
                      name="version" 
                      value={formData.version} 
                      onChange={handleChange} 
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#0096ff] bg-gray-50/50 appearance-none text-gray-700 cursor-pointer disabled:opacity-50"
                      disabled={!formData.brand && !formData.model}
                    >
                      <option value="" disabled>Chọn phiên bản</option>
                      {formData.brand && formData.model && carModels[formData.brand]?.[formData.model] ? (
                         carModels[formData.brand][formData.model].map(v => (
                           <option key={v} value={v}>{v}</option>
                         ))
                      ) : (
                         <>
                           <option value="Số sàn (MT)">Số sàn (MT)</option>
                           <option value="Số tự động (AT/CVT)">Số tự động (AT/CVT)</option>
                           <option value="Bản Cao Cấp (Premium)">Bản Cao Cấp (Premium)</option>
                           <option value="Khác">Khác</option>
                         </>
                      )}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-4">Tình trạng Phân loại</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Số ODO (km đã đi) <span className="text-red-500">*</span></label>
                  <input type="number" name="mileage" value={formData.mileage} onChange={handleChange} placeholder="VD: 45000" className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#0096ff] bg-gray-50/50 font-mono text-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tình trạng tổng quan</label>
                  <select name="condition" value={formData.condition} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#0096ff] bg-gray-50/50 text-gray-700">
                    <option value="good">Tốt - Không lỗi vặt</option>
                    <option value="fair">Trung bình - Cần SPA nhẹ</option>
                    <option value="poor">Kém - Từng đâm đụng/Tai nạn</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Giá mong ước (Thu Mua) <span className="text-red-500">*</span></label>
                  <div className="relative">
                     <input type="number" name="desiredPrice" value={formData.desiredPrice} onChange={handleChange} placeholder="VD: 550" className="w-full border border-gray-200 rounded-lg px-4 py-4 outline-none focus:border-[#0096ff] bg-gray-50/50 font-black text-xl text-[#0096ff]" />
                     <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">Triệu VNĐ</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-4">Cấu thành Chi tiết</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Ngoại thất (Xước xát)</label>
                  <textarea name="exterior" value={formData.exterior} onChange={handleChange} rows="2" placeholder="Ví dụ: Xước dăm cửa phụ..." className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#0096ff] bg-gray-50/50 resize-none whitespace-pre-wrap"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nội thất</label>
                  <textarea name="interior" value={formData.interior} onChange={handleChange} rows="2" placeholder="Ví dụ: Ghế da còn mới tươm..." className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#0096ff] bg-gray-50/50 resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Máy móc & Động cơ (Cam kết)</label>
                  <textarea name="engine" value={formData.engine} onChange={handleChange} rows="2" placeholder="Cam kết chưa bổ máy..." className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#0096ff] bg-gray-50/50 resize-none"></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Vùng Đồng Ý Điều Khoản (Cuối) */}
          {step === 3 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="mt-1 relative flex items-center justify-center">
                  <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded-md checked:bg-[#0096ff] checked:border-[#0096ff] transition-all cursor-pointer" />
                  <Check size={16} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <p className="text-gray-600 text-sm leading-relaxed select-none group-hover:text-gray-800 transition">
                  Tôi đã đọc, hiểu rõ và cam kết những thông tin kê khai chiếc xe này là hoàn toàn đúng sự thật. Tôi đồng ý với <span className="text-[#0096ff] font-semibold">Chính sách bảo mật</span> và <span className="text-[#0096ff] font-semibold">Quy chế hoạt động</span> nền tảng thu mua của Store Car.
                </p>
              </label>
            </div>
          )}

          {/* Action Buttons Toolbar */}
          <div className="mt-10 flex justify-between items-center">
            <button 
              type="button" 
              onClick={prevStep}
              className={`px-6 py-3 font-bold rounded-xl transition ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Quay lại
            </button>
            <button 
              type="button" 
              onClick={step === totalSteps ? handleSubmit : nextStep}
              disabled={loading}
              className={`px-10 py-3 font-bold rounded-xl text-white transition ${loading ? 'bg-gray-400' : 'bg-[#0096ff] hover:bg-blue-600 shadow-md hover:shadow-lg'}`}
            >
              {loading ? 'Đang gửi hồ sơ...' : (step === totalSteps ? 'Hoàn Tất Ngay' : 'Tiếp tục')}
            </button>
          </div>

        </div>

        {/* Feature Banners - Vucar style */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 opacity-80">
          <div className="flex items-center gap-4 text-gray-600">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100">
              <Globe size={24} />
            </div>
            <div>
              <div className="font-bold text-gray-800 border-b border-gray-300 inline-block mb-1 border-dashed">Kết nối với 2000+ người mua</div>
              <div className="text-xs">Đội ngũ chuyên viên tư vấn.</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-gray-600">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0 border border-green-100">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="font-bold text-gray-800 border-b border-gray-300 inline-block mb-1 border-dashed">Giá tốt hơn 5-15% thị trường</div>
              <div className="text-xs">Định giá AI & đấu giá chuyên sâu.</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-gray-600">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 border border-orange-100">
              <Clock size={24} />
            </div>
            <div>
              <div className="font-bold text-gray-800 border-b border-gray-300 inline-block mb-1 border-dashed">Bán xe chỉ trong 4 bước!</div>
              <div className="text-xs">Bảo mật thông tin tối đa.</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateListing;