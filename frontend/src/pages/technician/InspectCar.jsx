import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInspectionDetail, submitInspection } from '../../services/technicianService';
import { calculateValuation } from '../../utils/valuationHelpers';
import toast from 'react-hot-toast';
import { 
  Car, Wrench, ShieldAlert, Zap, Droplets, Camera, 
  ChevronLeft, ThumbsUp, Save, BrainCircuit, X, CheckCircle
} from 'lucide-react';

const InspectCar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiPrice, setAiPrice] = useState(null);
  
  // Custom mock for storing images
  const [images, setImages] = useState([]);

  const [form, setForm] = useState({
    engineCondition: 'good',
    chassisCondition: 'good',
    interiorCondition: 'good',
    exteriorCondition: 'good',
    electricalCondition: 'good',
    hasAccident: false,
    hasFlooded: false,
    wearAndTearPercent: 10,
    techProposedPrice: '',
    technicianNotes: '',
    status: 'inspected' // Force transition
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { getListingById } = await import('../../services/carListingService');
        const data = await getListingById(id);
        
        if (data) {
           setCar(data);
           setForm(prev => ({
             ...prev,
             brand: data.brand,
             model: data.model,
             year: data.year,
             mileage: data.mileage
           }));

           // Auto AI calculate if needed
           try {
             const valuation = calculateValuation({ brand: data.brand, model: data.model, year: data.year, odo: data.mileage });
             setAiPrice(valuation.estimated_price);
           } catch (e) {}
        }
      } catch (err) {
        toast.error('Không tìm thấy thông tin xe');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleStatusSelect = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Hình ảnh xước xát giả lập
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.techProposedPrice) {
      toast.error('Vui lòng nhập Giá đề xuất kỹ thuật!');
      return;
    }

    setSubmitting(true);
    try {
      const { updateListing } = await import('../../services/carListingService');
      
      const payload = {
        status: 'inspected',
        technical: {
          engineCondition: form.engineCondition,
          transmissionCondition: form.transmissionCondition,
          chassisCondition: form.chassisCondition,
          exteriorCondition: form.exteriorCondition,
          interiorCondition: form.interiorCondition,
          electricalCondition: form.electricalCondition,
          wearAndTearPercent: Number(form.wearAndTearPercent),
          techPrice: Number(form.techProposedPrice),
          technicianNotes: form.technicianNotes,
          inspectedAt: new Date(),
          damageImages: images,
          hasAccident: form.hasAccident,
          hasFlooded: form.hasFlooded,
        },
        // Mapped fields for compatibility with legacy view logic if needed
        techInfo: {
            ...form,
            techPrice: Number(form.techProposedPrice),
            aiBenchmarkPrice: aiPrice,
            damageImages: images 
        },
        actionLabel: 'Kỹ thuật viên hoàn tất kiểm định và cập nhật báo cáo chất lượng.'
      };

      await updateListing(id, payload);

      toast.success('Lưu kết quả kiểm định thành công!', { icon: '✅' });
      navigate('/technician/dashboard');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.message || 'Lưu thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-20 text-gray-400 font-bold">Đang tải hồ sơ xe...</div>;
  if (!car) return null;

  // Thành phần chọn chất lượng (Good/Fair/Poor)
  const ConditionSelector = ({ label, field, icon: Icon }) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full hover:border-blue-200 transition">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
          <Icon size={20} />
        </div>
        <h3 className="font-bold text-gray-800">{label}</h3>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-auto">
        <button type="button" onClick={() => handleStatusSelect(field, 'good')} className={`p-2 rounded-lg text-xs font-bold transition border ${form[field] === 'good' ? 'bg-[#00d68f] text-white border-[#00d68f]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>Tốt</button>
        <button type="button" onClick={() => handleStatusSelect(field, 'fair')} className={`p-2 rounded-lg text-xs font-bold transition border ${form[field] === 'fair' ? 'bg-[#0096ff] text-white border-[#0096ff]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>Trung bình</button>
        <button type="button" onClick={() => handleStatusSelect(field, 'poor')} className={`p-2 rounded-lg text-xs font-bold transition border ${form[field] === 'poor' ? 'bg-red-500 text-white border-red-500' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>Kém</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f7f9] pb-20 font-sans">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-800 font-semibold text-sm transition">
            <ChevronLeft size={16} /> Quay Lại
          </button>
          <div className="font-black text-lg text-gray-800 hidden sm:block">Chẩn Đoán Kỹ Thuật</div>
          <button onClick={handleSubmit} disabled={submitting} className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-white transition ${submitting ? 'bg-gray-400' : 'bg-[#0096ff] hover:bg-blue-600 shadow-md'}`}>
            <Save size={16} /> Lưu Hồ Sơ
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 flex flex-col gap-8">
        
        {/* Car Identity Overview */}
        <div className="bg-white rounded-3xl p-6 md:p-8 flex items-center gap-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100">
           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
             <Car size={32} className="text-gray-400" />
           </div>
           <div>
             <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">{car.brand} {car.model}</h1>
             <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600 font-medium">
               <span>Đời {car.year}</span>
               <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
               <span>ODO: {car.mileage.toLocaleString()} km</span>
               <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
               <span>Chủ xe: <span className="text-[#0096ff]">{car.customer?.name || 'Khách vãng lai'}</span></span>
             </div>
           </div>
        </div>

        {/* 1. TÌNH TRẠNG KỸ THUẬT */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <Wrench className="text-[#0096ff]" size={20} />
            <h2 className="text-lg font-bold text-gray-800">1. Tình trạng các bộ phận chính</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ConditionSelector label="Động cơ & Hộp số" field="engineCondition" icon={Zap} />
            <ConditionSelector label="Khung Gầm" field="chassisCondition" icon={Car} />
            <ConditionSelector label="Nội Thất" field="interiorCondition" icon={ThumbsUp} />
            <ConditionSelector label="Hệ thống Điện" field="electricalCondition" icon={Zap} />
          </div>
        </section>

        {/* 2. RỦI RO & HAO MÒN */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert className="text-red-500" size={20} />
            <h2 className="text-lg font-bold text-gray-800">2. Rủi ro & Tỉ lệ hao mòn</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-2 flex gap-4">
              <label className={`flex-1 p-5 border-2 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition ${form.hasAccident ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                <input type="checkbox" name="hasAccident" checked={form.hasAccident} onChange={handleChange} className="hidden" />
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${form.hasAccident ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400'}`}>
                  <ShieldAlert size={24} />
                </div>
                <div className="text-center">
                  <div className={`font-black uppercase text-sm ${form.hasAccident ? 'text-red-600' : 'text-gray-500'}`}>Từng tai nạn</div>
                  <div className="text-xs text-gray-400 mt-1">Đâm đụng tốn kém</div>
                </div>
              </label>

              <label className={`flex-1 p-5 border-2 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition ${form.hasFlooded ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                <input type="checkbox" name="hasFlooded" checked={form.hasFlooded} onChange={handleChange} className="hidden" />
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${form.hasFlooded ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}`}>
                  <Droplets size={24} />
                </div>
                <div className="text-center">
                  <div className={`font-black uppercase text-sm ${form.hasFlooded ? 'text-blue-600' : 'text-gray-500'}`}>Thủy kích</div>
                  <div className="text-xs text-gray-400 mt-1">Ngập nước, bổ máy</div>
                </div>
              </label>
            </div>

            <div className="col-span-1 border-l pl-0 md:pl-8 flex flex-col justify-center">
              <label className="block text-sm font-bold text-gray-700 mb-2">Độ hao mòn hiện tại (%)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  name="wearAndTearPercent" 
                  min="0" max="100" 
                  value={form.wearAndTearPercent} 
                  onChange={handleChange}
                  className="w-full accent-[#0096ff]"
                />
                <span className="font-mono font-black text-2xl text-[#0096ff] w-16 text-right">
                  {form.wearAndTearPercent}%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Kéo thanh trượt để đánh giá tổng quan mức độ hao mòn so với xe mới.</p>
            </div>
          </div>
        </section>

        {/* 3. UPLOAD BẰNG CHỨNG */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <Camera className="text-purple-500" size={20} />
              <h2 className="text-lg font-bold text-gray-800">3. Bằng chứng Hình ảnh (Trầy xước/Lỗi)</h2>
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">Minh bạch hồ sơ</span>
          </div>
          
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 group bg-gray-50">
                  <img src={imgUrl} alt="damage" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-red-600">
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()} 
                className="aspect-square rounded-2xl border-2 border-dashed border-[#0096ff]/30 bg-blue-50/50 flex flex-col items-center justify-center text-blue-500 hover:bg-blue-50 transition gap-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#0096ff]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera size={20} />
                </div>
                <span className="text-xs font-bold">Thêm ảnh</span>
              </button>
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
            </div>
          </div>
        </section>

        {/* 4. ĐỊNH GIÁ & HUẤN LUYỆN AI */}
        <section className="mb-20">
          <div className="flex items-center gap-2 mb-4 px-2">
            <BrainCircuit className="text-orange-500" size={20} />
            <h2 className="text-lg font-bold text-gray-800">4. Định giá & Huấn luyện AI</h2>
          </div>

          <div className="bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] rounded-3xl p-1 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
            
            <div className="bg-white/5 backdrop-blur-md rounded-[22px] p-6 md:p-8 flex flex-col md:flex-row gap-8 relative z-10 border border-white/10">
              
              <div className="flex-1">
                <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest mb-2">
                  <BrainCircuit size={14} /> Benchmark từ Hệ thống AI
                </div>
                <div className="text-4xl md:text-5xl font-black text-white bg-clip-text flex items-baseline gap-2">
                  {aiPrice ? aiPrice.toLocaleString() : '---'}
                  <span className="text-lg font-bold text-blue-300">Triệu VNĐ</span>
                </div>
                <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                  Hệ thống AI đã quét qua hơn 3,5 triệu dữ liệu lịch sử để gợi ý mức giá sát nhất cho chiếc {car.brand} {car.year} này. Mức giá trên phản ánh thị trường trung bình.
                </p>
              </div>

              <div className="w-px bg-white/10 hidden md:block"></div>

              <div className="flex-1 flex flex-col justify-center">
                <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
                  🏷️ Mức giá Thu Mua do Chuyên gia Đề xuất
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    name="techProposedPrice"
                    value={form.techProposedPrice}
                    onChange={handleChange}
                    placeholder="Nhập giá bạn thẩm định..." 
                    className="w-full bg-white/10 border-2 border-transparent hover:border-white/20 focus:border-[#0096ff] focus:bg-white text-white focus:text-gray-900 rounded-xl px-5 py-4 text-xl font-bold transition-all placeholder-white/30 outline-none"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">Triệu</span>
                </div>
                <p className="text-xs text-orange-300 mt-3 flex items-start gap-1.5">
                  <CheckCircle size={14} className="shrink-0 mt-0.5" />
                  Mức định giá chênh lệch của bạn cùng những dữ liệu khấu hao bên trên sẽ được nạp lại để Cập nhật Trí thông minh AI (Training Model).
                </p>
              </div>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default InspectCar;