import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Car, Wrench, DollarSign, MapPin, Image as ImageIcon, ClipboardCheck, 
  Save, Send, CheckCircle, Upload, Plus, X, ChevronLeft, Clock
} from 'lucide-react';
import { carModels, calculateValuation, calculateEVValuation } from '../../utils/valuationHelpers';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const InternalPostCar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth(); // Assume user object has { id, role, ... }
  const role = user?.role || 'purchasing_staff'; // fallback
  const pipelineId = searchParams.get('pipelineId');
  
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (pipelineId) {
      const pipelineCars = JSON.parse(localStorage.getItem('storeCar_pipeline_cars')) || [];
      const pCar = pipelineCars.find(c => String(c._id) === pipelineId);
      if (pCar) {
        setBasicInfo(prev => ({
          ...prev,
          brand: pCar.brand || '',
          model: pCar.model || '',
          year: pCar.year || new Date().getFullYear(),
          odo: pCar.mileage || ''
        }));
        if (pCar.images && pCar.images.length > 0) {
          setImages(pCar.images);
        }
        if (pCar.techInfo) {
          setPricingInfo(prev => ({
            ...prev,
            aiPrice: pCar.techInfo.aiBenchmarkPrice,
            techPrice: pCar.techInfo.techPrice
          }));
        }
        toast.success(`Đã đồng bộ thông số rủi ro của hệ thống kiểm định.`);
      }
    }
  }, [pipelineId]);

  // --- Form State ---
  // 1. Basic Info
  const [basicInfo, setBasicInfo] = useState({
    brand: '', model: '', year: '', version: '', odo: '', fuel: 'Xăng', seats: '5'
  });

  // 2. Technical Info
  const [techInfo, setTechInfo] = useState({
    engine: '', chassis: '', interior: '', exterior: '',
    accidentFlood: '', wearPercentage: '10',
    soh: '', deltaV: '' // Dành cho xe điện
  });

  // 3. Pricing
  const [pricingInfo, setPricingInfo] = useState({
    aiPrice: 0, techPrice: '', finalPrice: '', minPrice: ''
  });

  // 4 & 5. Additional Info & Description
  const [additionalInfo, setAdditionalInfo] = useState({
    location: '', plate: '', ownersCount: 1, highlights: '', description: '', reason: ''
  });

  // 6. Media (Mock images)
  const [images, setImages] = useState([]);

  // 7. Status
  const [status, setStatus] = useState('pending'); // pending, inspecting, approved, published, sold
  const [submitting, setSubmitting] = useState(false);

  // Calculate AI Price whenever crucial factors change
  useEffect(() => {
    if (basicInfo.brand && basicInfo.year && basicInfo.odo) {
      const valuationData = {
        brand: basicInfo.brand,
        model: basicInfo.model,
        year: basicInfo.year,
        version: basicInfo.version,
        odo: basicInfo.odo
      };

      if (basicInfo.fuel === 'Điện') {
        const evData = {
          SoH: parseInt(techInfo.soh) || 100,
          deltaV: parseInt(techInfo.deltaV) || 0
        };
        const result = calculateEVValuation(valuationData, evData);
        setPricingInfo(prev => ({ ...prev, aiPrice: result.estimated_price }));
      } else {
        const result = calculateValuation(valuationData);
        setPricingInfo(prev => ({ ...prev, aiPrice: result.estimated_price }));
      }
    }
  }, [basicInfo, techInfo.soh, techInfo.deltaV]);

  const fileInputRef = React.useRef(null);

  const processImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => resolve(null); // Tránh bị treo nếu ảnh lỗi
        img.onload = () => {
           const canvas = document.createElement('canvas');
           let { width, height } = img;
           const MAX_WIDTH = 1600; // Tăng độ phân giải để ảnh nét hơn trên màn hình lớn
           const MAX_HEIGHT = 1200;
           
           if (width > height) {
             if (width > MAX_WIDTH) {
               height = Math.round((height * MAX_WIDTH) / width);
               width = MAX_WIDTH;
             }
           } else {
             if (height > MAX_HEIGHT) {
               width = Math.round((width * MAX_HEIGHT) / height);
               height = MAX_HEIGHT;
             }
           }
           
           canvas.width = width;
           canvas.height = height;
           const ctx = canvas.getContext('2d');
           ctx.drawImage(img, 0, 0, width, height);
           // Nén chất lượng 0.85 để giữ độ nét
           resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    // Ràng buộc nghiêm ngặt định dạng file
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      toast.error('Hệ thống chỉ hỗ trợ định dạng ảnh (JPG, PNG, WEBP...). Vui lòng không chọn file rác!');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (images.length + files.length > 5) {
      toast.error(`Bạn chỉ có thể chọn tối đa thêm ${5 - images.length} ảnh`);
    }

    const availableSlots = 5 - images.length;
    const allowedFiles = files.slice(0, availableSlots);
    
    // Convert các file sang base64 để không bị mất khi F5
    const base64Images = await Promise.all(allowedFiles.map(file => processImageFile(file)));
    const validImages = base64Images.filter(img => img !== null);
    
    setImages(prev => [...prev, ...validImages]);

    // Đặt lại giá trị input để có thể chọn lại file vừa xóa
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index) => {
    // Thu hồi URL để giải phóng RAM
    URL.revokeObjectURL(images[index]);
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate Basic Info
    const odoValue = Number(basicInfo.odo);
    const isValidOdo = String(basicInfo.odo).trim() !== '' && !isNaN(odoValue) && odoValue >= 0 && odoValue <= 1000000;
    const isBasicValid = basicInfo.brand && basicInfo.model && basicInfo.year && basicInfo.version && isValidOdo;
    if (!isBasicValid) {
      const isBasicFieldsFilled = basicInfo.brand && basicInfo.model && basicInfo.year && basicInfo.version && String(basicInfo.odo).trim() !== '';
      if (!isBasicFieldsFilled) {
        toast.error('Vui lòng điền đầy đủ Thông tin cơ bản!');
      } else {
        toast.error('Vui lòng nhập số km hợp lệ');
      }
      return setActiveTab('basic');
    }

    // 2. Validate Tech Info
    const isTechValid = techInfo.engine && techInfo.chassis && techInfo.interior && techInfo.exterior && techInfo.accidentFlood && techInfo.wearPercentage !== '';
    if (!isTechValid) {
      toast.error('Vui lòng điền đầy đủ thông tin Kỹ thuật!');
      return setActiveTab('tech');
    }
    if (basicInfo.fuel === 'Điện' && (!techInfo.soh || techInfo.deltaV === '')) {
      toast.error('Vui lòng nhập định giá hao mòn Pin cho Xe điện!');
      return setActiveTab('tech');
    }

    // 3. Validate Price
    if (!pricingInfo.techPrice || !pricingInfo.minPrice) {
      toast.error('Vui lòng nhập đầy đủ Giá đề xuất và Giá sàn!');
      return setActiveTab('price');
    }
    if (role !== 'staff' && role !== 'purchasing_staff' && !pricingInfo.finalPrice) {
      toast.error('Vui lòng chốt Giá đăng bán chính thức!');
      return setActiveTab('price');
    }

    // 4. Validate Additional Info (Biển số tùy chọn. Vị trí, Nổi bật, Mô tả bắt buộc)
    if (!additionalInfo.location || !additionalInfo.highlights || !additionalInfo.description) {
      toast.error('Vui lòng điền đầy đủ Chi tiết khác (Vị trí, Điểm nổi bật, Mô tả)!');
      return setActiveTab('additional');
    }

    // 5. Validate Media
    if (images.length < 3) {
      toast.error('Vui lòng tải lên tối thiểu 3 ảnh minh họa!');
      return setActiveTab('media');
    }
    
    const isApprovalFlow = !!pipelineId;

    const mapCondition = (val) => {
      const mapping = {
        'Bình thường': 'good',
        'Tốt': 'good',
        'Khá': 'fair',
        'Tạm': 'fair',
        'Kém': 'poor',
        'Có': 'poor',
        'Không': 'good'
      };
      return mapping[val] || 'good';
    };

    const payload = {
      brand: basicInfo.brand,
      model: basicInfo.model,
      version: basicInfo.version,
      year: basicInfo.year,
      mileage: Number(basicInfo.odo),
      fuel: basicInfo.fuel,
      gearbox: basicInfo.gear,
      location: additionalInfo.location,
      notes: additionalInfo.description,
      desiredPrice: Number(pricingInfo.minPrice || pricingInfo.techPrice) * 1000000,
      price: (pricingInfo.finalPrice || pricingInfo.techPrice) * 1000000,
      image: images[0],
      images: images,
      status: (role === 'manager' || role === 'admin') ? 'published' : 'pending',
      isPublished: (role === 'manager' || role === 'admin'),
      technical: {
        engineCondition: mapCondition(techInfo.engine),
        chassisCondition: mapCondition(techInfo.chassis),
        interiorCondition: mapCondition(techInfo.interior),
        exteriorCondition: mapCondition(techInfo.exterior),
        wearAndTearPercent: Number(techInfo.wearPercentage),
        techPrice: Number(pricingInfo.techPrice),
        hasAccident: techInfo.accidentFlood === 'Có',
        technicianNotes: additionalInfo.highlights
      },
      actionLabel: `Đăng xe trực tiếp bởi ${role.toUpperCase()}`
    };

    setSubmitting(true);
    try {
      const { createListing, updateListing } = await import('../../services/carListingService');
      
      if (isApprovalFlow) {
        await updateListing(pipelineId, payload);
      } else {
        await createListing(payload);
      }

      toast.success('Đã lưu hồ sơ xe vào hệ thống Database thành công!', { icon: '💾' });
      navigate('/internal/manage-cars');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.message || 'Không thể lưu hồ sơ vào Database');
    } finally {
      setSubmitting(false);
    }
  };

  // Content rendering by tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic': return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hãng xe</label>
              <select 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#0096ff] transition"
                value={basicInfo.brand}
                onChange={e => setBasicInfo({...basicInfo, brand: e.target.value, model: '', version: ''})}
              >
                <option value="">Chọn hãng xe</option>
                {Object.keys(carModels).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dòng xe</label>
              <select 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#0096ff] transition disabled:bg-gray-50"
                value={basicInfo.model}
                onChange={e => setBasicInfo({...basicInfo, model: e.target.value})}
                disabled={!basicInfo.brand}
              >
                <option value="">Chọn dòng xe</option>
                {basicInfo.brand && carModels[basicInfo.brand] && Object.keys(carModels[basicInfo.brand]).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Năm sản xuất</label>
              <select 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#0096ff] transition"
                value={basicInfo.year}
                onChange={e => setBasicInfo({...basicInfo, year: e.target.value})}
              >
                <option value="">Chọn năm</option>
                {Array.from({length: 15}, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phiên bản</label>
              <select 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#0096ff] transition disabled:bg-gray-50"
                value={basicInfo.version}
                onChange={e => setBasicInfo({...basicInfo, version: e.target.value})}
                disabled={!basicInfo.brand}
              >
                <option value="">Chọn phiên bản</option>
                {basicInfo.brand && basicInfo.model && carModels[basicInfo.brand]?.[basicInfo.model] && carModels[basicInfo.brand][basicInfo.model].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Số KM đã đi</label>
              <input 
                type="number" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#0096ff] transition"
                placeholder="VD: 15000"
                value={basicInfo.odo} onChange={e => setBasicInfo({...basicInfo, odo: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nhiên liệu</label>
                <select className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#0096ff]"
                  value={basicInfo.fuel} onChange={e => setBasicInfo({...basicInfo, fuel: e.target.value})}>
                  <option value="Xăng">Xăng</option>
                  <option value="Dầu">Dầu</option>
                  <option value="Điện">Điện</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Số chỗ</label>
                <select className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#0096ff]"
                  value={basicInfo.seats} onChange={e => setBasicInfo({...basicInfo, seats: e.target.value})}>
                  <option value="2">2</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="16">16</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      );

      case 'tech': return (
        <div className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700">
            <strong>Lưu ý AI:</strong> Dữ liệu chấm điểm kỹ thuật sẽ ảnh hưởng trực tiếp đến kết quả định giá AI cuối cùng trên hệ thống định giá động của Store Car. Thợ kiểm định cần nhập chính xác.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['engine', 'chassis', 'interior', 'exterior'].map((item) => (
              <div key={item}>
                <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                  Tình trạng {item === 'engine' ? 'động cơ' : item === 'chassis' ? 'khung gầm' : item === 'interior' ? 'nội thất' : 'ngoại thất'}
                </label>
                <select 
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#0096ff] transition"
                  value={techInfo[item]} onChange={e => setTechInfo({...techInfo, [item]: e.target.value})}
                >
                  <option value="">-- Chọn tình trạng --</option>
                  <option value="Tốt">Tốt (Good - 1.05)</option>
                  <option value="Bình thường">Bình thường (Normal - 1.0)</option>
                  <option value="Kém">Kém (Bad - 0.9)</option>
                </select>
              </div>
            ))}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lịch sử Tai nạn / Ngập nước</label>
              <select 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-red-400 text-red-600 font-medium bg-red-50/30"
                value={techInfo.accidentFlood} onChange={e => setTechInfo({...techInfo, accidentFlood: e.target.value})}
              >
                <option value="">-- Chọn lịch sử --</option>
                <option value="Không">KHÔNG CHỨNG NHẬN (Nguyên bản)</option>
                <option value="Tai nạn nhẹ">Tai nạn nhẹ (đã xử lý)</option>
                <option value="Ngập nước">Ngập nước / Thủy kích</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mức độ hao mòn tổng thể (%)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min="0" max="100" 
                  value={techInfo.wearPercentage} 
                  onChange={e => setTechInfo({...techInfo, wearPercentage: e.target.value})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0096ff]"
                />
                <span className="font-bold text-gray-700 w-12 text-right">{techInfo.wearPercentage}%</span>
              </div>
            </div>
            {/* Conditional fields for Electric Vehicles */}
            {basicInfo.fuel === 'Điện' && (
              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div>
                  <label className="block text-sm font-semibold text-blue-800 mb-2">Tình trạng Pin / SoH (%)</label>
                  <input 
                    type="number" className="w-full border-2 border-blue-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#0096ff] transition"
                    placeholder="VD: 95" max="100" min="0"
                    value={techInfo.soh} onChange={e => setTechInfo({...techInfo, soh: e.target.value})}
                  />
                  <p className="text-xs text-blue-600 mt-1">{"< 80% giá trị tự động giảm sâu."}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-800 mb-2">Giá trị Chênh lệch/Phụ kiện (VND)</label>
                  <input 
                    type="number" className="w-full border-2 border-blue-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#0096ff] transition"
                    placeholder="VD: 15000000 (Cộng) hoặc -5000000 (Trừ)"
                    value={techInfo.deltaV} onChange={e => setTechInfo({...techInfo, deltaV: e.target.value})}
                  />
                  <p className="text-xs text-blue-600 mt-1">Lịch sử bảo dưỡng tốt / Có OTA (Nhập số dương). Trừ chi phí sửa (Nhập số âm).</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );

      case 'price': return (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 text-white flex justify-between items-center shadow-lg">
            <div>
              <div className="text-blue-100 font-medium text-sm mb-1 uppercase tracking-wider flex items-center gap-2">
                🤖 Giá tham chiếu từ AI Core
              </div>
              <div className="text-3xl font-extrabold shadow-sm drop-shadow">
                {pricingInfo.aiPrice > 0 ? `${(pricingInfo.aiPrice / 1000000).toLocaleString('vi-VN')} Triệu VND` : '---'}
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <DollarSign size={28} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Giá Đề Xuất Kỹ Thuật (Triệu VND)</label>
              <input 
                type="number" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0096ff]"
                placeholder="VD: 600"
                value={pricingInfo.techPrice} onChange={e => setPricingInfo({...pricingInfo, techPrice: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giá Đăng Bán Chính Thức <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                className={`w-full border-2 ${(role === 'staff' || role === 'purchasing_staff') ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' : 'border-green-400 focus:border-green-500'} rounded-xl px-4 py-3 outline-none font-bold`}
                placeholder="VD: 650"
                value={pricingInfo.finalPrice} onChange={e => setPricingInfo({...pricingInfo, finalPrice: e.target.value})}
                readOnly={role === 'staff' || role === 'purchasing_staff'} 
              />
              {(role === 'staff' || role === 'purchasing_staff') && <p className="text-xs text-gray-500 mt-1">Staff chỉ điền Giá thu mua, Administrator sẽ duyệt Giá bán trực tiếp.</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Giá Tối Thiểu / Giá Sàn</label>
              <input 
                type="number" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0096ff]"
                placeholder="VD: 620"
                value={pricingInfo.minPrice} onChange={e => setPricingInfo({...pricingInfo, minPrice: e.target.value})}
              />
            </div>
          </div>
        </div>
      );

      case 'additional': return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Vị trí xe</label>
              <select
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#0096ff] transition bg-white"
                value={additionalInfo.location}
                onChange={e => setAdditionalInfo({...additionalInfo, location: e.target.value})}
              >
                <option value="">-- Chọn tỉnh / thành phố --</option>
                <option>Hà Nội</option>
                <option>TP. Hồ Chí Minh</option>
                <option>Đà Nẵng</option>
                <option>Cần Thơ</option>
                <option>Hải Phòng</option>
                <option>An Giang</option>
                <option>Bà Rịa - Vũng Tàu</option>
                <option>Bắc Giang</option>
                <option>Bắc Kạn</option>
                <option>Bạc Liêu</option>
                <option>Bắc Ninh</option>
                <option>Bến Tre</option>
                <option>Bình Định</option>
                <option>Bình Dương</option>
                <option>Bình Phước</option>
                <option>Bình Thuận</option>
                <option>Cà Mau</option>
                <option>Cao Bằng</option>
                <option>Đắk Lắk</option>
                <option>Đắk Nông</option>
                <option>Điện Biên</option>
                <option>Đồng Nai</option>
                <option>Đồng Tháp</option>
                <option>Gia Lai</option>
                <option>Hà Giang</option>
                <option>Hà Nam</option>
                <option>Hà Tĩnh</option>
                <option>Hải Dương</option>
                <option>Hậu Giang</option>
                <option>Hòa Bình</option>
                <option>Hưng Yên</option>
                <option>Khánh Hòa</option>
                <option>Kiên Giang</option>
                <option>Kon Tum</option>
                <option>Lai Châu</option>
                <option>Lâm Đồng</option>
                <option>Lạng Sơn</option>
                <option>Lào Cai</option>
                <option>Long An</option>
                <option>Nam Định</option>
                <option>Nghệ An</option>
                <option>Ninh Bình</option>
                <option>Ninh Thuận</option>
                <option>Phú Thọ</option>
                <option>Phú Yên</option>
                <option>Quảng Bình</option>
                <option>Quảng Nam</option>
                <option>Quảng Ngãi</option>
                <option>Quảng Ninh</option>
                <option>Quảng Trị</option>
                <option>Sóc Trăng</option>
                <option>Sơn La</option>
                <option>Tây Ninh</option>
                <option>Thái Bình</option>
                <option>Thái Nguyên</option>
                <option>Thanh Hóa</option>
                <option>Thừa Thiên Huế</option>
                <option>Tiền Giang</option>
                <option>Trà Vinh</option>
                <option>Tuyên Quang</option>
                <option>Vĩnh Long</option>
                <option>Vĩnh Phúc</option>
                <option>Yên Bái</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Biển số (Để trống sẽ ẩn trên WEB)</label>
              <input 
                type="text" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#0096ff]"
                placeholder="VD: 30F-123.45"
                value={additionalInfo.plate} onChange={e => setAdditionalInfo({...additionalInfo, plate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Số đời chủ</label>
              <select className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#0096ff]"
                value={additionalInfo.ownersCount} onChange={e => setAdditionalInfo({...additionalInfo, ownersCount: e.target.value})}>
                <option value="1">1 đời chủ</option>
                <option value="2">2 đời chủ</option>
                <option value="3">3+ đời chủ</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Điểm nổi bật ngắn (Highlights) <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#0096ff]"
              placeholder="VD: Biển VIP, Đồ chơi 50 củ..."
              value={additionalInfo.highlights} onChange={e => setAdditionalInfo({...additionalInfo, highlights: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mô tả đăng bán chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea 
              rows={4} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0096ff] resize-none"
              placeholder="Nhập chi tiết mô tả xe..."
              value={additionalInfo.description} onChange={e => setAdditionalInfo({...additionalInfo, description: e.target.value})}
            />
          </div>
        </div>
      );

      case 'media': return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-800 text-sm flex gap-3">
            <ImageIcon className="shrink-0" />
            <p><strong>Bắt buộc:</strong> Bạn cần tải lên ít nhất 3 ảnh rõ nét và tối đa 5 ảnh. Khuyến khích: Ảnh tổng thể (đầu/đuôi), Nội thất, và Động cơ.</p>
          </div>

          <div className="flex flex-wrap gap-4">
            {images.map((src, idx) => (
              <div key={idx} className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm group">
                <img src={src} alt="Uploaded" className="w-full h-full object-cover" />
                <button 
                  type="button" onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition shadow hover:bg-white"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            
            {images.length < 5 && (
              <>
                <input 
                  type="file" multiple accept="image/*" className="hidden" 
                  ref={fileInputRef} onChange={handleImageUpload} 
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-[#0096ff] hover:text-[#0096ff] hover:bg-blue-50 transition"
                >
                  <Plus size={24} className="mb-2" />
                  <span className="text-xs font-semibold">Tải ảnh lên</span>
                </button>
              </>
            )}
          </div>
        </div>
      );

      case 'status': return (
        <div className="space-y-8">
           <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><ClipboardCheck size={20}/> Thông tin người dùng nội bộ</h3>
             <div className="grid grid-cols-2 gap-4 text-sm">
               <div><span className="text-gray-500">Người đăng:</span> <span className="font-semibold text-gray-800">{user?.id || 'STAFF_01'}</span></div>
               <div><span className="text-gray-500">Quyền hạn:</span> <span className="font-semibold uppercase text-blue-600 px-2 py-1 bg-blue-100 rounded-md">{role}</span></div>
               <div><span className="text-gray-500">Ngày tạo Y/C:</span> <span className="font-semibold text-gray-800">{new Date().toLocaleDateString('vi-VN')}</span></div>
             </div>
           </div>

           <div>
             <label className="block text-sm font-semibold text-gray-700 mb-4">Trạng thái Bài Đăng (Xử lý theo Luồng: Nhân Viên Mua → Quản Lý Duyệt)</label>
             <div className="flex gap-4">
               {role === 'purchasing_staff' ? (
                 <label className="flex-1 border-2 border-yellow-400 bg-yellow-50 p-4 rounded-xl flex flex-col justify-center gap-2 cursor-pointer transition">
                   <div className="flex items-center gap-2">
                     <Clock size={18} className="text-yellow-600" />
                     <span className="font-bold text-yellow-700">Trình Quản Lý Duyệt (Pending)</span>
                   </div>
                   <span className="text-xs text-yellow-600/80">Bạn đang soạn bài. Sau khi lưu sẽ chuyển trực tiếp cho Quản lý phê chuẩn.</span>
                 </label>
               ) : (
                 <label className="flex-1 border-2 border-green-400 bg-green-50 p-4 rounded-xl flex flex-col justify-center gap-2 cursor-pointer transition">
                   <div className="flex items-center gap-2">
                     <CheckCircle size={18} className="text-green-600" />
                     <span className="font-bold text-green-700">Duyệt & Xuất Bản (Publish)</span>
                   </div>
                   <span className="text-xs text-green-600/80">Quản lý có quyền chỉnh sửa giá cuối và đẩy lập tức xe lên sóng Trang Chủ.</span>
                 </label>
               )}
             </div>
           </div>
        </div>
      );
      default: return null;
    }
  };

  const tabs = [
    { id: 'basic', icon: Car, label: 'Thông tin cơ bản' },
    { id: 'tech', icon: Wrench, label: 'Kỹ thuật' },
    { id: 'price', icon: DollarSign, label: 'Giá & Định giá' },
    { id: 'additional', icon: MapPin, label: 'Chi tiết khác' },
    { id: 'media', icon: ImageIcon, label: 'Hình ảnh' },
    { id: 'status', icon: ClipboardCheck, label: 'Trạng thái Đăng' }
  ];

  // Kiểm tra điều kiện bắt buộc của Trang 1 (Thông tin cơ bản)
  const odoValue = Number(basicInfo.odo);
  const isValidOdo = String(basicInfo.odo).trim() !== '' && !isNaN(odoValue) && odoValue >= 0 && odoValue <= 1000000;
  const isBasicComplete = basicInfo.brand && basicInfo.model && basicInfo.year && basicInfo.version && isValidOdo;

  const handleTabClick = (tabId, index) => {
    // Không cho phép chuyển sang các tab tiếp theo nếu tab 1 chưa điền đủ
    if (index > 0 && !isBasicComplete) {
      const isBasicFieldsFilled = basicInfo.brand && basicInfo.model && basicInfo.year && basicInfo.version && String(basicInfo.odo).trim() !== '';
      if (!isBasicFieldsFilled) {
        toast.error('Vui lòng điền đầy đủ Thông tin cơ bản trước!');
      } else {
        toast.error('Vui lòng nhập số km hợp lệ');
      }
      return;
    }
    setActiveTab(tabId);
  };

  const handleNextTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      if (currentIndex === 0 && !isBasicComplete) {
         const isBasicFieldsFilled = basicInfo.brand && basicInfo.model && basicInfo.year && basicInfo.version && String(basicInfo.odo).trim() !== '';
         if (!isBasicFieldsFilled) {
           toast.error('Vui lòng điền đầy đủ Thông tin cơ bản trước!');
         } else {
           toast.error('Vui lòng nhập số km hợp lệ');
         }
         return;
      }
      if (currentIndex === 1) {
         const isTechValid = techInfo.engine && techInfo.chassis && techInfo.interior && techInfo.exterior && techInfo.accidentFlood && techInfo.wearPercentage !== '';
         if (!isTechValid) {
           toast.error('Vui lòng điền đầy đủ thông tin Kỹ thuật!');
           return;
         }
         if (basicInfo.fuel === 'Điện' && (!techInfo.soh || techInfo.deltaV === '')) {
           toast.error('Vui lòng nhập định giá hao mòn Pin cho Xe điện!');
           return;
         }
      }
      if (currentIndex === 2) {
         if (!pricingInfo.techPrice || !pricingInfo.minPrice) {
           toast.error('Vui lòng nhập đầy đủ Giá đề xuất và Giá sàn!');
           return;
         }
         if (role !== 'staff' && role !== 'purchasing_staff' && !pricingInfo.finalPrice) {
           toast.error('Vui lòng chốt Giá đăng bán chính thức!');
           return;
         }
      }
      if (currentIndex === 3) {
         if (!additionalInfo.location || !additionalInfo.highlights || !additionalInfo.description) {
           toast.error('Vui lòng điền đầy đủ Chi tiết khác (Vị trí, Điểm nổi bật, Mô tả)!');
           return;
         }
      }
      if (currentIndex === 4) {
         if (images.length < 3) {
           toast.error('Vui lòng tải lên tối thiểu 3 ảnh minh họa!');
           return;
         }
      }
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handlePrevTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Tạo Hồ Sơ Đăng Bán Xe</h1>
            <p className="text-gray-500 mt-2">Dành cho nội bộ Store Car (Staff, Manager, Admin)</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate(-1)} className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
              <ChevronLeft size={18} /> Quay lại Kho
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={submitting}
              className={`px-6 py-2.5 rounded-lg text-white font-bold shadow flex items-center gap-2 transition ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0096ff] hover:bg-blue-600'}`}
            >
              {submitting ? 'Đang xử lý...' : (role === 'staff' ? <><Send size={18}/> Gửi phê duyệt</> : <><Save size={18}/> {status === 'published' ? 'Đăng lên WEB' : 'Lưu Hồ Sơ'}</>)}
            </button>
          </div>
        </div>

        {/* Unified Interface using Header-style horizontal Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Horizontal Tabs */}
          <div className="flex overflow-x-auto bg-gray-50/50 border-b border-gray-100 hide-scrollbar pt-2 pl-2">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDisabled = idx > 0 && !isBasicComplete;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id, idx)}
                  type="button"
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors rounded-t-lg
                    ${isActive 
                      ? 'border-[#0096ff] text-[#0096ff] bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]' 
                      : isDisabled 
                        ? 'border-transparent text-gray-400 cursor-not-allowed opacity-70' 
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white/60'
                    }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  {isDisabled && <span className="ml-1 text-red-400 opacity-80" title="Khóa">🔒</span>}
                </button>
              );
            })}
          </div>

          {/* Form Content Area */}
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="max-w-4xl max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                {renderTabContent()}
              </div>

              {/* Bottom Navigation Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center max-w-4xl">
                 <button 
                   type="button" 
                   onClick={handlePrevTab} 
                   disabled={activeTab === tabs[0].id}
                   className={`px-5 py-2.5 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === tabs[0].id ? 'bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm'}`}
                 >
                   <ChevronLeft size={16} /> Quay lại
                 </button>

                 {activeTab === tabs[tabs.length - 1].id ? (
                   <button 
                     type="submit" 
                     className="px-8 py-2.5 flex items-center gap-2 rounded-lg bg-[#0096ff] text-white font-bold hover:bg-blue-600 shadow-md transition"
                   >
                     {role === 'staff' ? <><Send size={18}/> Gửi duyệt</> : <><Save size={18}/> Lưu Hồ Sơ</>}
                   </button>
                 ) : (
                   <button 
                     type="button"
                     onClick={handleNextTab}
                     className="px-8 py-2.5 rounded-lg bg-[#0096ff] text-white font-bold hover:bg-blue-600 shadow-md transition"
                   >
                     Tiếp theo
                   </button>
                 )}
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

// Add a quick custom scrollbar class via a style block to ensure neatness
const style = document.createElement('style');
style.textContent = `
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
`;
document.head.appendChild(style);

export default InternalPostCar;
