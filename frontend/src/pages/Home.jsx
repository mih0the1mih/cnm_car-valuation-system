import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import ValuationModal from '../components/ValuationModal';
import ChatWidget from '../components/ChatWidget';
import { carModels } from '../utils/valuationHelpers';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    { title: 'Xác định giá bán xe', icon: '💰', desc: 'Sử dụng AI để phân tích dữ liệu thị trường và định giá xe của bạn một cách chính xác nhất trong vài giây.' },
    { title: 'Tìm kiếm người mua', icon: '👤', desc: 'Tiếp cận hàng nghìn khách hàng tiềm năng đang có nhu cầu mua xe cũ thông qua nền tảng của chúng tôi.' },
    { title: 'Lựa chọn hình thức bán', icon: '🏷️', desc: 'Bạn có thể bán trực tiếp cho chúng tôi để nhận tiền ngay, hoặc ký gửi để bán với mức giá mong muốn.' },
    { title: 'Kiểm tra tình trạng xe', icon: '🔍', desc: 'Đội ngũ kỹ thuật viên chuyên nghiệp sẽ kiểm tra 150 hạng mục để đảm bảo tình trạng xe minh bạch.' },
    { title: 'Kiểm tra giấy tờ', icon: '📄', desc: 'Hỗ trợ tra cứu phạt nguội, kiểm tra đăng kiểm và tính hợp pháp của các giấy tờ liên quan.' },
    { title: 'Đàm phán & thương lượng', icon: '🤝', desc: 'Cung cấp nền tảng trung gian uy tín, giúp quá trình thương lượng giá cả trở nên dễ dàng và công bằng.' },
    { title: 'Hoàn tất thủ tục', icon: '📋', desc: 'Hỗ trợ toàn bộ thủ tục pháp lý, sang tên đổi chủ, sang nhượng nhanh chóng, an toàn và đúng pháp luật.' },
  ];

  const carBrands = [
    { id: 'toyota', name: 'TOYOTA', initial: 'T', color: '#ef4444', logo: '/brands/logo_Toyota.jpg' },
    { id: 'honda', name: 'HONDA', initial: 'H', color: '#1f2937', logo: '/brands/logo_honda.jpg' },
    { id: 'hyundai', name: 'HYUNDAI', initial: 'H', color: '#1e40af', logo: '/brands/logo-hyundai.jpg' },
    { id: 'kia', name: 'KIA', initial: 'K', color: '#000000', logo: '/brands/logo-kia.png' },
    { id: 'mazda', name: 'MAZDA', initial: 'M', color: '#4b5563', logo: '/brands/logo-mazda.jpg' },
    { id: 'mercedes', name: 'Mercedes-Benz', initial: 'M', color: '#9ca3af', logo: '/brands/Mercedes-Benz-Logo.png' },
    { id: 'bmw', name: 'BMW', initial: 'B', color: '#3b82f6' ,logo: '/brands/BMW.jpg'  },
    { id: 'ford', name: 'Ford', initial: 'F', color: '#1d4ed8' ,logo: '/brands/Ford_Motor_Company_Logo.svg.png'  },
    { id: 'mitsubishi', name: 'MITSUBISHI', initial: 'M', color: '#dc2626' ,logo: '/brands/Mitsubishi-Logo-1970-present.png'  },
    { id: 'nissan', name: 'NISSAN', initial: 'N', color: '#374151' ,logo: '/brands/logo-nissan.jpg'  },
    { id: 'suzuki', name: 'SUZUKI', initial: 'S', color: '#2563eb' ,logo: '/brands/logo-suzuki.png'  },
    { id: 'vinfast', name: 'VINFAST', initial: 'V', color: '#1f2937' ,logo: '/brands/logo-vinfast.jpg'  },
    { id: 'chevrolet', name: 'CHEVROLET', initial: 'C', color: '#ca8a04', logo: '/brands/Chevrolet-logo.png' },
    { id: 'mg', name: 'MG', initial: 'MG', color: '#b91c1c', logo: '/brands/logo-MG.png' },
    { id: 'peugeot', name: 'PEUGEOT', initial: 'P', color: '#1e3a8a', logo: '/brands/logo-peugeot.png' },
    { id: 'subaru', name: 'SUBARU', initial: 'S', color: '#1e40af',logo: '/brands/Subaru_logo_(transparent).svg.png' },
    { id: 'volkswagen', name: 'VOLKSWAGEN', initial: 'V', color: '#2563eb',logo: '/brands/logo-Volkswagen-vector-02.jpg' },
    { id: 'audi', name: 'AUDI', initial: 'A', color: '#000000',logo: '/brands/Audi-Logo.png' },
    { id: 'lexus', name: 'LEXUS', initial: 'L', color: '#1f2937' ,logo: '/brands/logo-lexus.png' },
    { id: 'porsche', name: 'PORSCHE', initial: 'P', color: '#a16207' ,logo: '/brands/porsche-logo.jpg' }
  ];

  const slides = [
    {
      titleLine1: "Vay khó có Tima",
      titleLine2: "Bán xe vất vả, gọi liền Store Car",
      buttonDesc: "Bán xe ngay",
      hasPartner: true,
      action: () => navigate('/sell-car')
    },
    {
      titleLine1: "Định giá xe ô tô",
      titleLine2: "Nhanh chóng & Chính xác bằng công nghệ AI",
      buttonDesc: "Định giá ngay",
      hasPartner: false,
      action: () => handleOpenValuation()
    },
    {
      titleLine1: "Mua bán xe lướt",
      titleLine2: "Kho xe đa dạng, có chuyên gia kiểm định",
      buttonDesc: "Tìm xe ngay",
      hasPartner: false,
      action: () => navigate('/buy-car')
    },
    {
      titleLine1: "Hỗ trợ pháp lý",
      titleLine2: "Sang tên, chuyển vùng nhanh chóng an toàn",
      buttonDesc: "Xem chi tiết",
      hasPartner: false,
      action: () => navigate('/about')
    },
    {
      titleLine1: "Ký gửi xe cũ",
      titleLine2: "Tiếp cận hàng ngàn khách hàng tiềm năng",
      buttonDesc: "Ký gửi ngay",
      hasPartner: false,
      action: () => navigate('/sell-car')
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isValuationOpen, setIsValuationOpen] = useState(false);
  const [selectedBrandForModal, setSelectedBrandForModal] = useState(null);
  
  // Trạng thái lưu trữ card tính năng được click
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  const handleOpenValuation = (brandNameOrObject = null) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập hoặc đăng ký để định giá xe!', { icon: '🔒' });
      navigate('/login');
    } else {
      if (typeof brandNameOrObject === 'string') {
        const foundKey = Object.keys(carModels).find(key => key.toLowerCase() === brandNameOrObject.toLowerCase());
        setSelectedBrandForModal(foundKey || null);
      } else {
        setSelectedBrandForModal(null);
      }
      setIsValuationOpen(true);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="home-wrapper">
      
      {/* Hero Section (Dark Mode) */}
      <div className="home-hero">
        <div className="home-hero-container">
          
          {/* Left Text */}
          <div className="home-hero-content">
            
            <div className="home-hero-brand">
              <span className="home-brand-logo">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 16H25V18H7V16ZM4 20H28C29.1046 20 30 20.8954 30 22V24H2V22C2 20.8954 2.89543 20 4 20ZM7 12L9 8H23L25 12H7Z" fill="currentColor"/>
                </svg>
                store car
              </span>
              
              {slides[currentSlide].hasPartner && (
                <div className="home-brand-partner">
                  <span className="home-partner-x">×</span>
                  <span className="home-partner-logo">
                    tima
                    <span className="home-partner-sub">Vay trong ngày</span>
                  </span>
                </div>
              )}
            </div>
            
            <div className="home-hero-title">
              <h1 key={currentSlide}>
                {slides[currentSlide].titleLine1}<br/>
                {slides[currentSlide].titleLine2}
              </h1>
            </div>

            <div style={{ marginTop: '32px' }}>
              <button onClick={slides[currentSlide].action} className="home-btn-primary">
                {slides[currentSlide].buttonDesc}
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="home-pagination">
              {slides.map((_, index) => (
                <div 
                  key={index} 
                  onClick={() => setCurrentSlide(index)}
                  className={`home-dot ${currentSlide === index ? 'active' : ''}`}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Right Graphic Placeholder */}
          <div className="home-hero-graphic">
             <span>🏎️</span>
          </div>
        </div>

        {/* Floating Right Arrow */}
        <div className="home-nav-arrow" onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}>
           <ArrowRight size={24} />
        </div>
      </div>

      {/* Main Content Area (Light Mode) */}
      <div className="home-main">
        
        {/* Floating Tabs */}
        <div className="home-floating-tabs-wrapper">
          <div className="home-tabs-container">
            <button onClick={() => navigate('/sell-car')} className="home-tab-btn active">Bán xe</button>
            <button onClick={() => navigate('/customer/dashboard')} className="home-tab-btn">Sở hữu xe</button>
            <button onClick={() => navigate('/buy-car')} className="home-tab-btn">Mua xe</button>
            <button onClick={() => toast('Tính năng Video AI đang được phát triển!', { icon: '✨' })} className="home-tab-btn home-tab-ai">
              Video AI <Sparkles size={16} color="#f59e0b" fill="#f59e0b" />
            </button>
          </div>
        </div>

        {/* Features Carousel & Details Box */}
        <div className="home-features-wrapper">
          <div className="home-features-carousel-row">
            <button className="home-nav-btn"><ArrowLeft size={18} /></button>
            
            <div className="home-feature-scroll">
              {features.map((item, index) => (
                <div 
                  key={index} 
                  className={`home-feature-card ${activeFeatureIndex === index ? 'active' : ''}`}
                  onClick={() => setActiveFeatureIndex(index)}
                >
                  <div className="home-feature-icon-box">
                    {item.icon}
                  </div>
                  <div className="home-feature-title">{item.title}</div>
                </div>
              ))}
            </div>

            <button className="home-nav-btn"><ArrowRight size={18} /></button>
          </div>

          {/* Chi tiết cho tính năng được click */}
          <div className="home-feature-detail-box" key={activeFeatureIndex}>
            <div className="home-feature-detail-title">
              {features[activeFeatureIndex].icon} {features[activeFeatureIndex].title}
            </div>
            <div className="home-feature-detail-desc">
              {features[activeFeatureIndex].desc}
            </div>
          </div>
        </div>

        {/* Brand Reference Section */}
        <div className="home-brands-wrapper">
          <div className="home-brands-card">
            <div className="home-brands-header">
              <div className="home-brands-title">
                <h2>Tham khảo giá thị trường</h2>
                <p>Chọn hãng xe để xem kết quả định giá AI chính xác nhất</p>
              </div>
              <button onClick={handleOpenValuation} className="home-btn-secondary">
                Định giá ngay
              </button>
            </div>

            <div className="home-brands-grid">
              {carBrands.map(brand => (
                <div onClick={() => handleOpenValuation(brand.name)} key={brand.id} className="home-brand-item">
                  {brand.logo ? (
                     <img src={brand.logo} alt={brand.name} className="home-brand-logo-img" />
                  ) : (
                    <div className="home-brand-placeholder" style={{color: brand.color}}>
                       {brand.initial}
                    </div>
                  )}
                  <span className="home-brand-name">{brand.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* VALUATION MODAL */}
      <ValuationModal isOpen={isValuationOpen} onClose={() => setIsValuationOpen(false)} initialBrand={selectedBrandForModal} />

      {/* CHAT WIDGET */}
      <ChatWidget />
    </div>
  );
};

export default Home;