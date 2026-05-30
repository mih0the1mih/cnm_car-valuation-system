import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Phone, ChevronRight, Car, MapPin, Gauge, User, FileText, Send, Camera, XCircle, Edit2 } from 'lucide-react';
import { carModels } from '../utils/valuationHelpers';
import toast from 'react-hot-toast';
import ChatWidget from '../components/ChatWidget';
import { useAuth } from '../context/AuthContext';

const PROVINCES = [
  'Hà Nội','TP. Hồ Chí Minh','Đà Nẵng','Cần Thơ','Hải Phòng','An Giang',
  'Bà Rịa - Vũng Tàu','Bắc Giang','Bắc Kạn','Bạc Liêu','Bắc Ninh','Bến Tre',
  'Bình Định','Bình Dương','Bình Phước','Bình Thuận','Cà Mau','Cao Bằng',
  'Đắk Lắk','Đắk Nông','Điện Biên','Đồng Nai','Đồng Tháp','Gia Lai',
  'Hà Giang','Hà Nam','Hà Tĩnh','Hải Dương','Hậu Giang','Hòa Bình',
  'Hưng Yên','Khánh Hòa','Kiên Giang','Kon Tum','Lai Châu','Lâm Đồng',
  'Lạng Sơn','Lào Cai','Long An','Nam Định','Nghệ An','Ninh Bình',
  'Ninh Thuận','Phú Thọ','Phú Yên','Quảng Bình','Quảng Nam','Quảng Ngãi',
  'Quảng Ninh','Quảng Trị','Sóc Trăng','Sơn La','Tây Ninh','Thái Bình',
  'Thái Nguyên','Thanh Hóa','Thừa Thiên Huế','Tiền Giang','Trà Vinh',
  'Tuyên Quang','Vĩnh Long','Vĩnh Phúc','Yên Bái'
];

const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
const FUEL_TYPES = ['Xăng', 'Dầu (Diesel)', 'Điện', 'Hybrid', 'CNG / LPG'];
const TRANSMISSIONS = ['Tự động', 'Số tay', 'Bán tự động (CVT)'];

const steps = ['Thông tin xe', 'Tình trạng xe', 'Thông tin liên hệ', 'Hoàn tất'];

const SellCar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const carData = location.state?.carData || {};
  
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [images, setImages] = useState([]);

  const { user } = useAuth();
  
  const [form, setForm] = useState({
    brand: carData.brand || '', model: carData.model || '', year: carData.year || '', version: carData.version || '',
    fuel: '', transmission: '', odo: carData.odo || '', location: '',
    exterior: 'Tốt', interior: 'Tốt', hasAccident: 'Không', hasFlood: 'Không',
    desiredPrice: carData.desiredPrice || '', name: user?.name || '', phone: user?.phone || '', note: ''
  });

  // Track if phone input is enabled (only disable if user is logged in and has phone)
  const [isPhoneDisabled, setIsPhoneDisabled] = useState(!!user?.phone);

  React.useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || ''
      }));
      if (user.phone) setIsPhoneDisabled(true);
    }
  }, [user]);

  const brands = Object.keys(carModels);
  const models = form.brand ? Object.keys(carModels[form.brand] || {}) : [];
  const versions = form.brand && form.model ? (carModels[form.brand]?.[form.model] || []) : [];

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const validateStep = () => {
    if (step === 0) {
      if (!form.brand || !form.model || !form.version || !form.year || !form.fuel || !form.transmission || form.odo === '' || !form.location) {
        toast.error('Vui lòng điền đầy đủ thông tin xe!'); return false;
      }
      const odoNum = Number(form.odo);
      if (isNaN(odoNum) || odoNum < 0 || odoNum > 9999999) {
        toast.error('Vui lòng nhập số km hợp lệ');
        return false;
      }
    }
    if (step === 1) {
      if (images.length < 5) {
        toast.error('Vui lòng tải lên đủ 5 hình ảnh xe!'); return false;
      }
      if (!form.desiredPrice || form.desiredPrice.toString().trim() === '') {
        toast.error('Vui lòng điền giá bán mong muốn!'); return false;
      }
      const priceNum = Number(form.desiredPrice);
      if (isNaN(priceNum) || priceNum <= 0 || priceNum > 100000) {
        toast.error('Vui lòng nhập giá bán hợp lệ!'); return false;
      }
      if (!form.note || form.note.trim() === '') {
        toast.error('Vui lòng điền mô tả thêm!'); return false;
      }
    }
    if (step === 2) {
      if (!form.name || !form.phone) {
        toast.error('Vui lòng nhập họ tên và số điện thoại!'); return false;
      }
      const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]{2,50}$/;
      if (!nameRegex.test(form.name.trim())) {
        toast.error('Họ tên không hợp lệ (chỉ chứa chữ cái, từ 2-50 ký tự)!'); return false;
      }
      if (!/^(0|\+84)[0-9]{9}$/.test(form.phone.replace(/\s/g, ''))) {
        toast.error('Số điện thoại không hợp lệ!'); return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(s => s + 1);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    Promise.all(files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            const MAX_WIDTH = 1600;
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
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          };
          img.src = ev.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    })).then(base64Images => {
      setImages(prev => [...prev, ...base64Images].slice(0, 5));
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      const { createListing } = await import('../services/carListingService.js');
      
      const payload = {
        brand: form.brand,
        model: form.model,
        version: form.version,
        year: form.year,
        mileage: parseInt(form.odo) || 0,
        desiredPrice: (parseInt(form.desiredPrice?.toString().replace(/\D/g, '')) || 0) * 1000000,
        condition: form.exterior === 'Kém' && form.interior === 'Kém' ? 'poor' : 'good',
        exterior: form.exterior || form.note,
        interior: form.interior,
        notes: form.note,
        location: form.location,
        images: images,
        image: images.length > 0 ? images[0] : ''
      };

      await createListing(payload);

      setSubmitted(true);
      toast.success('Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ sớm.', { duration: 4000 });
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra. Bạn cần đăng nhập để sử dụng tính năng này!');
    }
  };

  const conditionOpts = ['Tốt', 'Trung bình', 'Kém'];

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f3f7f9] py-10 px-4">
        <div className="max-w-lg mx-auto">

          {/* Success card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center mb-5">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Gửi yêu cầu thành công!</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-1">
              Cảm ơn <strong>{form.name}</strong> đã tin tưởng Store Car.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Chúng tôi sẽ liên hệ qua <strong>{form.phone}</strong> trong vòng <strong>30 phút</strong>.
            </p>
            <div className="bg-blue-50 text-[#0096ff] text-sm font-bold px-4 py-3 rounded-xl mb-6 text-left">
              <p>🚗 {form.brand} {form.model} {form.year}</p>
              <p className="text-blue-500 font-normal text-xs mt-1">{form.location} · {parseInt(form.odo || 0).toLocaleString()} km · Ngoại thất: {form.exterior}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setSubmitted(false); setStep(0); setForm({ brand:'',model:'',year:'',version:'',fuel:'',transmission:'',odo:'',location:'',exterior:'Tốt',interior:'Tốt',hasAccident:'Không',hasFlood:'Không',desiredPrice:'',name:'',phone:'',note:'' }); setAgreed(false); setImages([]); }}
                className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                Gửi xe khác
              </button>
              <Link to="/" className="flex-1 bg-[#0096ff] text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition text-sm text-center flex items-center justify-center">
                Về trang chủ
              </Link>
            </div>
          </div>

          {/* Tracking info */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-5">
            <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2 text-base">
              📋 Quy trình xử lý yêu cầu của bạn
            </h3>
            <div className="space-y-3">
              {[
                { step: '1', label: 'Nhân viên tiếp nhận & liên hệ', desc: 'Trong vòng 30 phút', done: true },
                { step: '2', label: 'Định giá xe bằng AI', desc: 'Sau khi xác nhận thông tin', done: false },
                { step: '3', label: 'Kiểm định thực tế tại kho', desc: 'Theo lịch hẹn', done: false },
                { step: '4', label: 'Chốt giá & thanh toán', desc: 'Trong ngày hoặc theo thỏa thuận', done: false },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${item.done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {item.done ? '✓' : item.step}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${item.done ? 'text-green-700' : 'text-gray-800'}`}>{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hotline */}
          <div className="bg-gradient-to-r from-[#0096ff] to-[#00b4ff] rounded-3xl p-5 text-white text-center">
            <p className="text-sm font-semibold mb-1 text-white/80">Cần hỗ trợ ngay?</p>
            <a href="tel:18006468" className="text-2xl font-black tracking-wide hover:underline">1800 646 896</a>
            <p className="text-xs text-white/70 mt-1">Miễn phí · 8:00 - 20:00 hàng ngày</p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f7f9]">
      {/* HERO BANNER */}
      <div className="bg-gradient-to-br from-[#0077e6] to-[#00b4ff] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-14 flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="text-white flex-1">
            <p className="text-white/70 text-sm font-semibold mb-2 flex items-center gap-1">
              <Link to="/" className="hover:text-white transition">Trang chủ</Link>
              <ChevronRight size={14} /> Bán xe
            </p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-3">Thu mua ô tô cũ</h1>
            <p className="text-white/80 text-lg mb-6">Hỗ trợ bán xe ô tô từ A → Z</p>
            <div className="flex flex-wrap gap-3">
              {['Định giá miễn phí', 'Thanh toán trong ngày', 'Hỗ trợ giấy tờ'].map(b => (
                <span key={b} className="flex items-center gap-1.5 text-sm font-semibold bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <CheckCircle size={14} /> {b}
                </span>
              ))}
            </div>
            <a href="tel:18006468" className="inline-flex items-center gap-2 mt-6 bg-white text-[#0096ff] font-bold px-5 py-3 rounded-xl shadow hover:shadow-md transition text-sm">
              <Phone size={16} /> Gọi tư vấn miễn phí: 1800 646 896
            </a>
          </div>
          <div className="hidden md:flex items-center justify-center opacity-20 pointer-events-none">
            <span className="text-[180px]">🚗</span>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
      </div>

      {/* FORM AREA */}
      <div className="max-w-2xl mx-auto px-4 -mt-6 pb-20 relative z-20">
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">

          {/* Step indicators */}
          <div className="flex border-b border-gray-100">
            {steps.map((s, i) => (
              <div key={i} className={`flex-1 py-3.5 text-center text-xs font-bold transition ${i === step ? 'text-[#0096ff] border-b-2 border-[#0096ff]' : i < step ? 'text-green-500' : 'text-gray-400'}`}>
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] mr-1.5 ${i === step ? 'bg-[#0096ff] text-white' : i < step ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {i < step ? '✓' : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </div>
            ))}
          </div>

          <div className="p-6 md:p-8">

            {/* STEP 0: Car Info */}
            {step === 0 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <Car size={20} className="text-[#0096ff]" />
                  <h2 className="text-lg font-black text-gray-800">Thông tin xe cơ bản</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Hãng xe <span className="text-red-500">*</span></label>
                    <select value={form.brand} onChange={e => { update('brand', e.target.value); update('model', ''); }}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0096ff] bg-white">
                      <option value="">Chọn hãng xe</option>
                      {brands.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Dòng xe <span className="text-red-500">*</span></label>
                    <select value={form.model} onChange={e => update('model', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0096ff] bg-white">
                      <option value="">Chọn dòng xe</option>
                      {models.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Đời xe <span className="text-red-500">*</span></label>
                    <select value={form.year} onChange={e => update('year', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0096ff] bg-white">
                      <option value="">Chọn đời xe</option>
                      {YEARS.map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phiên bản <span className="text-red-500">*</span></label>
                    <select value={form.version} onChange={e => update('version', e.target.value)}
                      disabled={!form.brand || !form.model}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0096ff] bg-white disabled:bg-gray-50">
                      <option value="">Chọn phiên bản</option>
                      {versions.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Nhiên liệu <span className="text-red-500">*</span></label>
                    <select value={form.fuel} onChange={e => update('fuel', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0096ff] bg-white">
                      <option value="">Chọn nhiên liệu</option>
                      {FUEL_TYPES.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Hộp số <span className="text-red-500">*</span></label>
                    <select value={form.transmission} onChange={e => update('transmission', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0096ff] bg-white">
                      <option value="">Chọn hộp số</option>
                      {TRANSMISSIONS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block flex items-center gap-1"><Gauge size={14} /> Số km đã đi <span className="text-red-500">*</span></label>
                    <input type="text" value={form.odo} onChange={e => update('odo', e.target.value)}
                      placeholder="VD: 45000"
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0096ff]" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block flex items-center gap-1"><MapPin size={14} /> Vị trí xe <span className="text-red-500">*</span></label>
                    <select value={form.location} onChange={e => update('location', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0096ff] bg-white">
                      <option value="">Chọn tỉnh / thành phố</option>
                      {PROVINCES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: Condition */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={20} className="text-[#0096ff]" />
                  <h2 className="text-lg font-black text-gray-800">Tình trạng xe</h2>
                </div>

                {[
                  { label: 'Ngoại thất', field: 'exterior' },
                  { label: 'Nội thất', field: 'interior' },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">{label}</label>
                    <div className="flex gap-3">
                      {conditionOpts.map(opt => (
                        <button key={opt} type="button" onClick={() => update(field, opt)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition ${form[field] === opt ? 'border-[#0096ff] bg-blue-50 text-[#0096ff]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {[
                  { label: 'Xe từng bị tai nạn?', field: 'hasAccident' },
                  { label: 'Xe từng bị ngập nước?', field: 'hasFlood' },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">{label}</label>
                    <div className="flex gap-3">
                      {['Không', 'Có'].map(opt => (
                        <button key={opt} type="button" onClick={() => update(field, opt)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition ${form[field] === opt ? (opt === 'Có' ? 'border-red-400 bg-red-50 text-red-600' : 'border-[#0096ff] bg-blue-50 text-[#0096ff]') : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Hình ảnh xe (Yêu cầu đủ 5 ảnh) <span className="text-red-500">*</span></label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative shrink-0 w-24 h-24 rounded-xl border border-gray-200 overflow-hidden">
                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm text-red-500 hover:text-red-700">
                          <XCircle size={16} />
                        </button>
                      </div>
                    ))}
                    {images.length < 5 && (
                      <label className="shrink-0 w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#0096ff] hover:text-[#0096ff] cursor-pointer transition bg-gray-50">
                        <Camera size={24} className="mb-1" />
                        <span className="text-[10px] font-semibold">Thêm ảnh</span>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Giá bán mong muốn (Triệu VND) <span className="text-red-500">*</span></label>
                  <input type="text" value={form.desiredPrice} onChange={e => update('desiredPrice', e.target.value)}
                    placeholder="VD: 550"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0096ff]" />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Mô tả thêm <span className="text-red-500">*</span></label>
                  <textarea value={form.note} onChange={e => update('note', e.target.value)} rows={3}
                    placeholder="Thông tin thêm về tình trạng xe, phụ kiện đi kèm..."
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0096ff] resize-none" />
                </div>
              </div>
            )}

            {/* STEP 2: Contact Info */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <User size={20} className="text-[#0096ff]" />
                  <h2 className="text-lg font-black text-gray-800">Thông tin liên hệ</h2>
                </div>
                <p className="text-sm text-gray-500">Chuyên viên sẽ liên hệ bạn để tư vấn và định giá xe.</p>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Họ và tên <span className="text-red-500">*</span></label>
                  <input value={form.name} onChange={e => update('name', e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0096ff]" />
                </div>
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                    Số điện thoại <span className="text-red-500 ml-1 mr-2">*</span>
                    {user?.phone && isPhoneDisabled && (
                      <button 
                        type="button" 
                        onClick={() => setIsPhoneDisabled(false)}
                        className="text-[#0096ff] hover:text-blue-600 flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-blue-50 rounded-full transition"
                      >
                        <Edit2 size={10} /> Chỉnh sửa
                      </button>
                    )}
                  </label>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                    placeholder="0901 234 567"
                    disabled={isPhoneDisabled}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0096ff] disabled:bg-gray-100 disabled:text-gray-500" />
                </div>

                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800 border border-blue-100">
                  <p className="font-bold mb-1">📋 Tóm tắt thông tin xe</p>
                  <p>{form.brand} {form.model} {form.year} — {form.location}</p>
                  <p className="text-blue-600">ODO: {form.odo ? `${parseInt(form.odo).toLocaleString()} km` : 'Chưa nhập'} · Ngoại thất: {form.exterior} · Nội thất: {form.interior}</p>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-[#0096ff]" />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    Tôi đã đọc, hiểu rõ và đồng ý với{' '}
                    <Link to="#" className="text-[#0096ff] font-semibold hover:underline">Chính sách bảo mật</Link> và{' '}
                    <Link to="#" className="text-[#0096ff] font-semibold hover:underline">Quy chế hoạt động</Link> của Store Car
                  </span>
                </label>
              </div>
            )}

            {/* STEP 3: Done preview - won't show since we redirect on submit */}
            {step === 3 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <h3 className="font-black text-xl text-gray-800 mb-2">Đang xử lý...</h3>
                <p className="text-gray-500 text-sm">Vui lòng đợi trong giây lát.</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)}
                  className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition text-sm">
                  ← Quay lại
                </button>
              )}
              {step < 2 ? (
                <button onClick={handleNext}
                  className="flex-1 bg-[#0096ff] hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-sm transition text-sm flex items-center justify-center gap-2">
                  Tiếp theo <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={!agreed}
                  className="flex-1 bg-[#0096ff] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-sm transition text-sm flex items-center justify-center gap-2">
                  <Send size={16} /> Gửi yêu cầu bán xe
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { icon: '⚡', title: 'Định giá nhanh', desc: 'Kết quả trong 30 phút' },
            { icon: '🔒', title: 'An toàn & uy tín', desc: 'Cam kết minh bạch 100%' },
            { icon: '💰', title: 'Giá tốt nhất', desc: 'Theo giá thị trường' },
          ].map((b, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <div className="text-2xl mb-1">{b.icon}</div>
              <p className="text-xs font-bold text-gray-800">{b.title}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <ChatWidget />
    </div>
  );
};

export default SellCar;
