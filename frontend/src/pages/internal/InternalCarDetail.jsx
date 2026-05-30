import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Car, Contact, Wrench, DollarSign, CalendarClock, History, CheckCircle, 
  MapPin, ShieldPlus, ChevronLeft, CreditCard, UserCircle, Activity,
  AlertTriangle, Phone, AtSign, ThumbsUp, XCircle, Send, Globe, Edit, Save, X, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { calculateValuation, carModels, formatPriceShortVND } from '../../utils/valuationHelpers';

const STATUS_PIPELINE = ['pending', 'contacted', 'inspecting', 'inspected', 'pricing', 'approved', 'published', 'sold'];

// Labels function
const getStatusBadge = (status) => {
  const map = {
    pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700' },
    contacted: { label: 'Đã liên hệ', color: 'bg-blue-100 text-blue-700' },
    inspecting: { label: 'Đang kiểm tra', color: 'bg-purple-100 text-purple-700' },
    inspected: { label: 'Đã kiểm tra', color: 'bg-indigo-100 text-indigo-700' },
    pricing: { label: 'Đang định giá', color: 'bg-orange-100 text-orange-700' },
    approved: { label: 'Đã định giá (Duyệt)', color: 'bg-green-100 text-green-700' },
    published: { label: 'Đã Đăng Web', color: 'bg-teal-100 text-teal-800' },
    sold: { label: 'Đã bán', color: 'bg-gray-200 text-gray-700' }
  };
  const ui = map[status] || map.pending;
  return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${ui.color}`}>{ui.label}</span>;
}

const InternalCarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || 'purchasing_staff';
  
  const [car, setCar] = useState(null);
  const [staffPriceInput, setStaffPriceInput] = useState('');
  const [marketValuation, setMarketValuation] = useState(null); // Giá từ bonbanh API
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    brand: '', model: '', year: '', version: '', mileage: '', desiredPrice: '',
    customerName: '', customerPhone: ''
  });

  const brands = Object.keys(carModels);
  const models = editForm.brand ? Object.keys(carModels[editForm.brand] || {}) : [];
  const versions = (editForm.brand && editForm.model) ? (carModels[editForm.brand]?.[editForm.model] || []) : [];
  
  useEffect(() => {
    fetchCarDetail();
  }, [id, navigate]);

  const fetchCarDetail = async () => {
    try {
      const { getListingById } = await import('../../services/carListingService.js');
      const data = await getListingById(id);
      
      const mappedData = {
        ...data,
        customerDetails: {
          name: data.customer?.name || 'Khách hàng',
          phone: data.customer?.phone || '--',
          email: data.customer?.email || '--'
        },
        staffPrice: data.price ? Math.round(data.price/1000000) : null,
      };

      setCar(mappedData);
      if (mappedData.staffPrice) setStaffPriceInput(mappedData.staffPrice);
      setEditForm({
        brand: mappedData.brand || '',
        model: mappedData.model || '',
        year: mappedData.year || '',
        version: mappedData.version || '',
        mileage: mappedData.mileage || 0,
        desiredPrice: mappedData.desiredPrice ? (mappedData.desiredPrice < 1000000 ? mappedData.desiredPrice : Math.round(mappedData.desiredPrice/1000000)) : '',
        customerName: mappedData.customerDetails?.name || '',
        customerPhone: mappedData.customerDetails?.phone || ''
      });

      if (mappedData.brand && mappedData.model && mappedData.year) {
        fetch('http://localhost:5000/api/valuation/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brand:   mappedData.brand,
            model:   mappedData.model,
            version: mappedData.version,
            year:    parseInt(mappedData.year),
            mileage: parseInt(mappedData.mileage) || 50000,
          }),
        })
          .then(r => r.json())
          .then(resData => { if (resData.estimatedPrice) setMarketValuation(resData); })
          .catch(() => {});
      }
    } catch (err) {
      toast.error('Không tìm thấy xe này trong hệ thống');
      navigate('/internal/manage-cars');
    }
  };

  const recordHistory = (pipelineData, carId, actionLabel) => {
    const idx = pipelineData.findIndex(c => String(c._id) === String(carId));
    if (idx >= 0) {
      if (!pipelineData[idx].history) pipelineData[idx].history = [];
      pipelineData[idx].history.unshift({
        time: new Date().toISOString(),
        action: actionLabel,
        actor: user?.name || role
      });
    }
    return pipelineData;
  };

  const syncToBackend = async (updates, actionLabel) => {
     try {
       const { updateListing } = await import('../../services/carListingService.js');
       await updateListing(car._id, { ...updates, actionLabel });
       
       // Tải lại toàn bộ dữ liệu từ Server để đảm bảo state chuẩn nhất (đúng đơn vị VND)
       await fetchCarDetail();
       toast.success(`Đã cập nhật: ${actionLabel}`);
     } catch (err) {
       console.error('Update error:', err);
       toast.error('Lỗi khi cập nhật dữ liệu');
     }
  };

  // --- ACTIONS ---
  const handleContacted = () => {
    syncToBackend({ status: 'contacted' }, 'Xác nhận đã liên hệ khách hàng');
  };

  const handleSendToTech = () => {
    syncToBackend({ status: 'inspecting' }, 'Chuyển xe sang Trạm Kỹ Thuật');
    toast.success('Kỹ thuật viên đã nhận được yêu cầu', {icon: '🔧'});
  };

  const handleSubmitPricing = () => {
    if (!staffPriceInput) return toast.error('Vui lòng gõ giá đề xuất');
    syncToBackend({ 
      status: 'pricing', 
      price: parseFloat(staffPriceInput) * 1000000 
    }, `Đề xuất giá thu mua: ${staffPriceInput} Tr`);
  };

  const handleApprove = () => {
    syncToBackend({ status: 'approved' }, 'Quản lý đã phê duyệt hồ sơ và mức giá.');
  };

  const handlePublish = () => {
    syncToBackend({ status: 'published', isPublished: true }, 'Đăng bán xe lên website công khai.');
  };

  const handleSold = () => {
    syncToBackend({ status: 'sold', isPublished: false }, 'Xác nhận xe đã bán thành công. Hạ bài đăng.');
  };

  const handleReject = () => {
    syncToBackend({ status: 'rejected' }, 'Từ chối thu mua xe này.');
  };

  const handleUpdateInfo = async () => {
    const updates = {
      brand: editForm.brand,
      model: editForm.model,
      year: editForm.year,
      version: editForm.version,
      mileage: editForm.mileage,
      desiredPrice: parseFloat(editForm.desiredPrice) * 1000000,
      customerName: editForm.customerName,
      customerPhone: editForm.customerPhone
    };
    await syncToBackend(updates, 'Cập nhật lại thông tin hồ sơ xe.');
    setIsEditing(false);
  };

  if (!car) return <div className="p-10 text-center font-bold text-gray-500">Đang tải hồ sơ ERP...</div>;

  // Giá AI: ưu tiên API thật (bonbanh), fallback công thức
  let aiPrice = marketValuation?.estimatedPrice || car.aiInitialPrice || car.techInfo?.aiBenchmarkPrice;
  if (!aiPrice || isNaN(parseFloat(aiPrice))) {
    try {
      const valuationData = { brand: car.brand, model: car.model, year: car.year, version: car.version, odo: car.mileage };
      aiPrice = calculateValuation(valuationData).estimated_price;
    } catch (e) {}
  }
  const formattedAiPrice = !isNaN(parseFloat(aiPrice)) && parseFloat(aiPrice) > 0 ? formatPriceShortVND(parseFloat(aiPrice)) : '???';
  const aiPriceLabel = marketValuation?.success
    ? `${formattedAiPrice} \u2022 ${marketValuation.sampleCount} xe mẫu`
    : formattedAiPrice;
  const techPrice = car.technical?.techPrice || car.techInfo?.techPrice;
  const currPipelineIdx = STATUS_PIPELINE.indexOf(car.status);

  return (
    <div className="bg-[#f4f7f8] min-h-screen font-sans pb-32">
      {/* Top Banner */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/internal/manage-cars')} className="flex items-center text-gray-600 hover:text-[#0096ff] font-bold text-sm">
            <ChevronLeft size={18} className="mr-1"/> Quay lại Kho
          </button>
          <div className="flex items-center gap-3">
             {role === 'purchasing_staff' && (
                <button onClick={() => setIsEditing(true)} className="hidden md:flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100 transition">
                   <Edit size={14} /> Sửa thông tin
                </button>
             )}
             <span className="font-mono text-gray-400 text-xs shadow-inner bg-gray-100 px-2 py-1 rounded">ID: #{String(car._id).slice(-6)}</span>
             {getStatusBadge(car.status)}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* PROGRESS WIZARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-x-auto">
           <div className="flex items-center justify-between min-w-[700px] relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 rounded-full z-0"></div>
              <div className="absolute top-1/2 left-0 h-1 bg-[#0096ff] transition-all duration-700 z-0" style={{width: `${currPipelineIdx * (100/(STATUS_PIPELINE.length-1))}%`}}></div>
              
              {STATUS_PIPELINE.map((st, i) => {
                const isPast = i < currPipelineIdx;
                const isCurrent = i === currPipelineIdx;
                return (
                  <div key={st} className="relative z-10 flex flex-col items-center">
                     <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center font-bold text-xs shadow-sm bg-white
                                      ${isPast ? 'border-[#0096ff] text-[#0096ff]' : isCurrent ? 'border-[#0096ff] bg-[#0096ff] text-white ring-4 ring-blue-100' : 'border-gray-200 text-gray-300'} transition-all`}>
                        {isPast ? <CheckCircle size={14}/> : i+1}
                     </div>
                     <span className={`text-[10px] uppercase font-bold mt-2 ${isCurrent ? 'text-[#0096ff]' : 'text-gray-400'}`}>{st}</span>
                  </div>
                )
              })}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CỘT TRÁI: INFO & CUSTOMER */}
          <div className="lg:col-span-1 space-y-6">
             {/* Customer Card */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-[#0096ff] border-b pb-3 border-gray-50">
                  <UserCircle size={20}/> <h3 className="font-bold text-gray-800">Thông tin Khách hàng</h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs mb-1 font-semibold uppercase">Họ Tên</span>
                    <div className="font-bold text-gray-800 bg-gray-50 p-2 rounded">{car.customerDetails?.name || 'Khách vãng lai'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-500 block text-xs mb-1 font-semibold uppercase">Số Điện Thoại</span>
                      <div className="font-semibold text-gray-800 bg-gray-50 p-2 rounded flex items-center gap-2"><Phone size={14} className="text-gray-400"/> {car.customerDetails?.phone || '--'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs mb-1 font-semibold uppercase">Email</span>
                      <div className="font-semibold text-gray-800 bg-gray-50 p-2 rounded flex items-center gap-2"><AtSign size={14} className="text-gray-400"/> {car.customerDetails?.email || '--'}</div>
                    </div>
                  </div>
                </div>
             </div>

             {/* Car Base Info */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-[#0096ff] border-b pb-3 border-gray-50">
                  <Car size={20}/> <h3 className="font-bold text-gray-800">Siêu dữ liệu Xe ban đầu</h3>
                </div>
                <div className="text-2xl font-black text-gray-800 mb-4">{car.brand} {car.model}</div>
                <ul className="space-y-3 text-sm">
                   <li className="flex justify-between items-center bg-gray-50 p-2 rounded"><span className="text-gray-500">Đời xe (Năm)</span> <strong className="text-gray-800">{car.year}</strong></li>
                   <li className="flex justify-between items-center bg-gray-50 p-2 rounded"><span className="text-gray-500">Phiên bản</span> <strong className="text-gray-800">{car.version || '--'}</strong></li>
                   <li className="flex justify-between items-center bg-gray-50 p-2 rounded"><span className="text-gray-500">Số km ODO</span> <strong className="text-gray-800">{car.mileage?.toLocaleString() || 0} km</strong></li>
                   <li className="flex justify-between items-center bg-gray-50 p-2 rounded border border-blue-100"><span className="text-gray-500">Giá khách đề xuất</span> <strong className="text-blue-600">{car.desiredPrice ? formatPriceShortVND(car.desiredPrice) : 'Chưa cập nhật'}</strong></li>
                </ul>
             </div>
          </div>

          {/* CỘT GIỮA: TECH REPORT & PRICING */}
          <div className="lg:col-span-2 space-y-6">
             
             {/* 3 CỘT GIÁ CHÉO (TRẠM SO SÁNH GIÁ) */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6 text-green-600 border-b pb-3 border-gray-50">
                  <Activity size={20}/> <h3 className="font-bold text-gray-800">Trạm So Sánh Giá Hệ Thống (Trạm Pricing)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="border border-gray-200 rounded-xl p-4 bg-[#f8fbff] text-center">
                      <div className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-2 flex items-center justify-center gap-1">
                        Giá AI hệ thống định
                        {marketValuation?.success && (
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block ml-1"></span>
                        )}
                      </div>
                      <div className="text-2xl font-black text-[#0096ff]">{aiPriceLabel}</div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        {marketValuation?.success ? 'Dữ liệu thật từ bonbanh.com' : 'Công thức ước tính'}
                      </div>
                   </div>
                   <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 text-center relative overflow-hidden">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Giá Kỹ thuật bắt bệnh</div>
                      <div className="text-2xl font-black text-gray-700">{!isNaN(parseFloat(techPrice)) && parseFloat(techPrice) > 0 ? formatPriceShortVND(parseFloat(techPrice) * 1000000) : '???'}</div>
                      {!(car.technical || car.techInfo) && <div className="absolute inset-0 bg-white/60 flex items-center justify-center text-xs font-bold text-gray-500">Chưa khám</div>}
                   </div>
                   <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50 text-center relative shadow-sm">
                      <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Giá Thu Mua Đề Xuất</div>
                      {car.staffPrice ? (
                         <div className="text-2xl font-black text-green-700">{formatPriceShortVND(car.staffPrice * 1000000)}</div>
                      ) : (
                         <div className="flex flex-col items-center gap-2 mt-1">
                           <input type="number" placeholder="Nhập số..." value={staffPriceInput} onChange={e=>setStaffPriceInput(e.target.value)} 
                                  className="w-24 text-center border-b-2 border-green-400 bg-transparent text-xl font-bold outline-none text-green-700" 
                                  disabled={['manager','admin'].includes(role) || currPipelineIdx > 4}/>
                           <span className="text-[10px] text-green-500/70">Triệu VNĐ</span>
                         </div>
                      )}
                   </div>
                </div>
             </div>

             {/* TECH REPORT */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-[#0096ff] border-b pb-3 border-gray-50">
                  <ShieldPlus size={20}/> <h3 className="font-bold text-gray-800">Báo Cáo Kỹ Thuật (Tech Report)</h3>
                </div>
                
                {(car.technical || car.techInfo) ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                       <div className="bg-gray-50 p-3 rounded text-center">
                          <div className="text-gray-400 text-xs mb-1">Động cơ</div>
                          <div className={`font-bold ${(car.technical?.engineCondition === 'poor' || car.techInfo?.engineCondition === 'poor' || car.techInfo?.engine === 'Kém') ? 'text-red-500' : 'text-gray-800'}`}>
                             {car.technical?.engineCondition === 'good' ? 'Tốt' : car.technical?.engineCondition === 'fair' ? 'Trung bình' : car.technical?.engineCondition === 'poor' ? 'Kém' : (car.techInfo?.engineCondition === 'good' ? 'Tốt' : car.techInfo?.engineCondition === 'fair' ? 'Trung bình' : car.techInfo?.engineCondition === 'poor' ? 'Kém' : (car.techInfo?.engine || '---'))}
                          </div>
                       </div>
                       <div className="bg-gray-50 p-3 rounded text-center">
                          <div className="text-gray-400 text-xs mb-1">Khung gầm</div>
                          <div className={`font-bold ${(car.technical?.chassisCondition === 'poor' || car.techInfo?.chassisCondition === 'poor' || car.techInfo?.chassis === 'Kém') ? 'text-red-500' : 'text-gray-800'}`}>
                             {car.technical?.chassisCondition === 'good' ? 'Tốt' : car.technical?.chassisCondition === 'fair' ? 'Trung bình' : car.technical?.chassisCondition === 'poor' ? 'Kém' : (car.techInfo?.chassisCondition === 'good' ? 'Tốt' : car.techInfo?.chassisCondition === 'fair' ? 'Trung bình' : car.techInfo?.chassisCondition === 'poor' ? 'Kém' : (car.techInfo?.chassis || '---'))}
                          </div>
                       </div>
                       <div className="bg-gray-50 p-3 rounded text-center">
                          <div className="text-gray-400 text-xs mb-1">Nội thất</div>
                          <div className="font-bold text-gray-800">
                             {car.technical?.interiorCondition === 'good' ? 'Tốt' : car.technical?.interiorCondition === 'fair' ? 'Trung bình' : car.technical?.interiorCondition === 'poor' ? 'Kém' : (car.techInfo?.interiorCondition === 'good' ? 'Tốt' : car.techInfo?.interiorCondition === 'fair' ? 'Trung bình' : car.techInfo?.interiorCondition === 'poor' ? 'Kém' : (car.techInfo?.interior || '---'))}
                          </div>
                       </div>
                       <div className="bg-gray-50 p-3 rounded text-center">
                          <div className="text-gray-400 text-xs mb-1">Ngoại thất</div>
                          <div className="font-bold text-gray-800">
                             {car.technical?.exteriorCondition === 'good' ? 'Tốt' : car.technical?.exteriorCondition === 'fair' ? 'Trung bình' : car.technical?.exteriorCondition === 'poor' ? 'Kém' : (car.techInfo?.exteriorCondition === 'good' ? 'Tốt' : car.techInfo?.exteriorCondition === 'fair' ? 'Trung bình' : car.techInfo?.exteriorCondition === 'poor' ? 'Kém' : (car.techInfo?.exterior || '---'))}
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-4">
                       <div className={`flex-1 p-3 rounded-lg flex items-center gap-3 border ${(car.technical?.hasAccident || car.techInfo?.hasAccident || car.techInfo?.accidentFlood === 'Có') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                          <AlertTriangle size={20}/>
                          <div>
                            <div className="text-xs opacity-70">Lịch sử đụng độ / Ngập nước</div>
                            <div className="font-black">{(car.technical?.hasAccident || car.technical?.hasFlooded || car.techInfo?.hasAccident || car.techInfo?.hasFlooded || car.techInfo?.accidentFlood === 'Có') ? 'PHÁT HIỆN RỦI RO' : 'AN TOÀN BẢO ĐẢM'}</div>
                          </div>
                       </div>
                       <div className="flex-1 p-3 rounded-lg flex items-center justify-between border border-gray-200 bg-gray-50">
                          <div className="text-sm font-semibold text-gray-600">Mức hao mòn (Đánh giá)</div>
                          <div className="text-xl font-black text-gray-800">{(car.technical?.wearAndTearPercent || car.techInfo?.wearPercentage || car.techInfo?.wearAndTearPercent || 0)}%</div>
                       </div>
                    </div>

                    {(car.technical?.damageImages || car.techInfo?.damageImages) && (car.technical?.damageImages?.length > 0 || car.techInfo?.damageImages?.length > 0) && (
                      <div className="mt-4">
                        <div className="text-sm font-semibold text-gray-600 mb-2">Hình ảnh hiện trường lỗi:</div>
                        <div className="flex gap-2">
                           {(car.technical?.damageImages || car.techInfo?.damageImages).map((src, i) => (
                             <img key={i} src={src} className="w-20 h-20 rounded-md object-cover border border-gray-200" alt="damage"/>
                           ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-10 text-center flex flex-col items-center text-gray-400">
                     <Wrench size={40} className="mb-3 opacity-20"/>
                     <span className="font-bold">Xe chưa được kiểm định kỹ thuật</span>
                     <span className="text-sm mt-1">Chuyển Phiếu xuống Trạm Kỹ thuật ngay để có báo cáo.</span>
                  </div>
                )}
             </div>

          </div>
        </div>

        {/* LOG HISTORY CỘT DƯỚI CÙNG LÀM FULL RỘNG */}
        <div className="mt-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-2 mb-4 text-orange-500 border-b pb-3 border-gray-50">
             <History size={20}/> <h3 className="font-bold text-gray-800">Nhật Ký Xử Lý (Timeline Log)</h3>
           </div>
           <div className="space-y-4">
             {car.history?.length > 0 ? car.history.map((h, i) => (
               <div key={i} className="flex gap-4 items-start text-sm">
                  <div className="w-32 text-gray-400 font-mono text-xs whitespace-nowrap mt-1">{new Date(h.time).toLocaleString('vi-VN')}</div>
                  <div className="w-3 h-3 rounded-full bg-gray-200 mt-1 shrink-0 relative z-10 box-content border-2 border-white shadow-sm"></div>
                  <div>
                    <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs mr-2 border border-gray-200">{h.actor}</span>
                    <span className="text-gray-800">{h.action}</span>
                  </div>
               </div>
             )) : (
               <div className="text-gray-400 text-sm italic">Chưa có log vận hành nào.</div>
             )}
           </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR (Cực ngầu như Jira) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="hidden md:block text-sm font-semibold text-gray-500">
             Vị trí Form: <span className="text-[#0096ff]">{role.toUpperCase()}</span> đang thao tác.
           </div>
           <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             
             {/* Thu Mua Actions */}
             {car.status === 'pending' && ['purchasing_staff', 'manager', 'admin'].includes(role) && (
               <button onClick={handleContacted} className="px-6 py-2.5 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 flex shrink-0 items-center gap-2"><Phone size={18}/> Báo Đã Gọi Khách</button>
             )}
             
             {car.status === 'contacted' && ['purchasing_staff', 'manager', 'admin'].includes(role) && (
               <button onClick={handleSendToTech} className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 flex shrink-0 items-center gap-2"><Wrench size={18}/> Giao xe cho Kỹ thuật</button>
             )}
             
             {car.status === 'inspected' && ['purchasing_staff', 'manager', 'admin'].includes(role) && (
               <button onClick={handleSubmitPricing} className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 flex shrink-0 items-center gap-2"><Send size={18}/> Chốt giá Gửi Quản Lý Duyệt</button>
             )}

             {/* Manage Actions */}
             {car.status === 'pricing' && ['manager', 'admin'].includes(role) && (
               <button onClick={handleApprove} className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700 flex shrink-0 items-center gap-2"><ThumbsUp size={18}/> Duyệt Giá</button>
             )}

             {car.status === 'approved' && ['manager', 'admin'].includes(role) && (
               <button onClick={handlePublish} className="px-6 py-2.5 bg-[#0096ff] text-white font-bold rounded-lg shadow-md hover:bg-blue-600 flex shrink-0 items-center gap-2"><Globe size={18}/> Đăng Publish Lên ChọnXe</button>
             )}

             {car.status === 'published' && (
               <div className="flex gap-2">
                  <a href={`/buy-car`} target="_blank" rel="noreferrer" className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 flex shrink-0 items-center gap-2 border border-gray-200">
                    <ExternalLink size={18}/> Xem tin trên Web
                  </a>
                  {['manager', 'admin'].includes(role) && (
                    <button onClick={handleSold} className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 flex shrink-0 items-center gap-2">
                      <CheckCircle size={18}/> Xác nhận Đã Bán
                    </button>
                  )}
               </div>
             )}

             {/* Common */}
             {['pending', 'contacted', 'pricing'].includes(car.status) && (
               <button onClick={handleReject} className="px-6 py-2.5 bg-red-50 text-red-600 font-bold border border-red-200 rounded-lg hover:bg-red-500 hover:text-white flex shrink-0 items-center gap-2"><XCircle size={18}/> Từ chối xe này</button>
             )}
           </div>
        </div>
      </div>

      {/* MODAL SỬA THÔNG TIN */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <h2 className="text-lg font-black text-gray-800 flex items-center gap-2"><Edit size={18} className="text-[#0096ff]" /> Sửa thông tin hồ sơ</h2>
                 <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-red-500 transition"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                 <div>
                    <h3 className="text-xs font-bold text-gray-400 hover:text-gray-500 uppercase tracking-wider mb-3">1. Thông tin Khách hàng</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Họ Tên</label>
                          <input type="text" value={editForm.customerName} onChange={e=>setEditForm({...editForm, customerName: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#0096ff] focus:outline-none focus:ring-1 focus:ring-blue-100" />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Số điện thoại</label>
                          <input type="text" value={editForm.customerPhone} onChange={e=>setEditForm({...editForm, customerPhone: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#0096ff] focus:outline-none focus:ring-1 focus:ring-blue-100" />
                       </div>
                    </div>
                 </div>

                 <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-2">2. Thông tin Xe</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                       <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Hãng xe</label>
                          <select 
                            value={editForm.brand} 
                            onChange={e => setEditForm({ ...editForm, brand: e.target.value, model: '', version: '' })} 
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#0096ff] focus:outline-none focus:ring-1 focus:ring-blue-100"
                          >
                            <option value="">-- Chọn hãng --</option>
                            {brands.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Dòng xe (Model)</label>
                          <select 
                            value={editForm.model} 
                            onChange={e => setEditForm({ ...editForm, model: e.target.value, version: '' })} 
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#0096ff] focus:outline-none focus:ring-1 focus:ring-blue-100"
                            disabled={!editForm.brand}
                          >
                            <option value="">-- Chọn dòng xe --</option>
                            {models.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                       </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Năm SX</label>
                          <input type="number" value={editForm.year} onChange={e=>setEditForm({...editForm, year: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#0096ff] focus:outline-none focus:ring-1 focus:ring-blue-100" />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Phiên bản</label>
                          <select 
                            value={editForm.version} 
                            onChange={e => setEditForm({ ...editForm, version: e.target.value })} 
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#0096ff] focus:outline-none focus:ring-1 focus:ring-blue-100"
                            disabled={!editForm.model}
                          >
                            <option value="">-- Chọn phiên bản --</option>
                            {versions.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Số Km (ODO)</label>
                          <input type="number" value={editForm.mileage} onChange={e=>setEditForm({...editForm, mileage: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#0096ff] focus:outline-none focus:ring-1 focus:ring-blue-100" />
                       </div>
                    </div>
                 </div>

                 <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-2">3. Mức giá</h3>
                    <div>
                       <label className="block text-xs font-bold text-gray-600 mb-1">Giá Khách muốn bán (Triệu VND)</label>
                       <input type="number" value={editForm.desiredPrice} onChange={e=>setEditForm({...editForm, desiredPrice: e.target.value})} placeholder="Ví dụ: 800" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#0096ff] focus:outline-none focus:ring-1 focus:ring-blue-100" />
                    </div>
                 </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 mt-auto">
                 <button onClick={() => setIsEditing(false)} className="px-5 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">Hủy</button>
                 <button onClick={handleSaveEdit} className="px-5 py-2 text-sm font-bold text-white bg-[#0096ff] rounded-lg hover:bg-blue-600 shadow-md flex items-center gap-2 transition"><Save size={16} /> Lưu cập nhật</button>
              </div>
           </div>
        </div>
      )}

    </div>
  )
}

export default InternalCarDetail;
