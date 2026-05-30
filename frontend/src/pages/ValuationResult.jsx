import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { calculateValuation, formatPrice } from '../utils/valuationHelpers';
import ValuationModal from '../components/ValuationModal';

const ValuationResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Fake data calculation or retrieve from state
  const [valuationData, setValuationData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const formData = location.state?.formData || {
      brand: 'Honda', model: 'Civic', version: 'RS', year: '2024', odo: '15000'
    };

    const carName = `${formData.brand} ${formData.model} ${formData.version || ''} ${formData.year}`.trim().toUpperCase();

    async function fetchValuation() {
      try {
        // 1. Thử gọi API backend với dữ liệu thật từ bonbanh.com
        const response = await fetch('http://localhost:5000/api/valuation/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brand:   formData.brand,
            model:   formData.model,
            version: formData.version,
            year:    parseInt(formData.year),
            mileage: parseInt(formData.odo) || 50000,
            ...(formData.batteryHealth !== undefined && { batteryHealth: parseFloat(formData.batteryHealth) / 100 }),
          }),
        });

        if (response.ok) {
          const apiData = await response.json();

          if (apiData.success && apiData.estimatedPrice > 0) {
            // Giá thị trường (dựa trên AI Engine đã quét giá gốc và khấu hao)
            const marketPrice = apiData.estimatedPrice;

            // Chiến lược thu mua của Store Car (Buying Strategy)
            // Lợi nhuận gộp kỳ vọng 10% (0.9) - riskReserve (dự phòng rủi ro 2%)
            const riskReserve = marketPrice * 0.02;
            const storeEstimated = (marketPrice * 0.90) - riskReserve;

            const storeMin  = Math.round(storeEstimated * 0.98 / 1_000_000);
            const storeMax  = Math.round(storeEstimated * 1.02 / 1_000_000);
            const mktMin    = Math.round(marketPrice * 0.95 / 1_000_000);
            const mktMax    = Math.round(marketPrice * 1.05 / 1_000_000);

            setValuationData({
              carName,
              storeCarPrice:      `${formatPrice(storeMin)} - ${formatPrice(storeMax)}`,
              marketPrice:        `${formatPrice(mktMin)} - ${formatPrice(mktMax)}`,
              increasePercentage: 'Mua thẳng, giải ngân 30p', // Removed the +4% logic since Store is buying lower
              sampleCount:        apiData.sampleCount,
              dataSource:         'hybrid', // Kết hợp AI và Market
              rawEstimated:       storeEstimated,
            });
            return;
          }
        }
      } catch (_) {
        // API lỗi → dùng fallback
      }

      // 2. Fallback: dùng công thức tính toán cũ
      const aiValuation = calculateValuation(formData);
      setValuationData({
        carName,
        storeCarPrice:      aiValuation.uiData.storeCarPrice,
        marketPrice:        aiValuation.uiData.marketPrice,
        increasePercentage: aiValuation.uiData.increasePercentage,
        sampleCount:        0,
        dataSource:         'formula',
        rawEstimated:       aiValuation.estimated_price,
      });
    }

    fetchValuation();
  }, [location.state]);


  if (!valuationData) return <div className="p-20 text-center">Đang phân tích dữ liệu thị trường...</div>;

  return (
    <div className="w-full bg-[#f8fbff] min-h-screen pb-20">
      {/* Top Banner */}
      <div className="bg-[#41b8f4] text-white py-3 flex justify-center items-center gap-4 text-sm font-medium">
        <span>Bán xe của bạn giá cao nhất thị trường</span>
        <button className="bg-white text-gray-800 px-4 py-1.5 rounded text-sm font-bold shadow-sm hover:bg-gray-100 transition">
          Bắt đầu ngay
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Kết quả định giá xe <span className="capitalize">{valuationData.carName.toLowerCase()}</span>
        </h1>

        {/* Data source badge */}
        <div className="mb-6">
          {valuationData.dataSource === 'hybrid' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse inline-block"></span>
              Định giá AI kết hợp dữ liệu thị trường ({valuationData.sampleCount} mẫu)
            </span>
          ) : valuationData.dataSource === 'realtime' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block"></span>
              Dựa trên {valuationData.sampleCount} xe tham chiếu từ các nền tảng
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-full">
              Giá tham khảo từ thị trường
            </span>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Thông tin xe của bạn <span className="capitalize">{valuationData.carName.toLowerCase()}</span>
          </h2>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
          >
            Định giá xe khác
          </button>
        </div>

        <ValuationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Store Car Price Card */}
          <div className="bg-gradient-to-br from-[#0096ff] to-[#017ce0] rounded-xl p-8 text-white relative overflow-hidden shadow-lg">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <span className="font-semibold text-lg">Giá xe giao dịch tại Store Car</span>
              <div className="bg-white/20 p-1.5 rounded-full">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M7 16H25V18H7V16ZM4 20H28C29.1046 20 30 20.8954 30 22V24H2V22C2 20.8954 2.89543 20 4 20ZM7 12L9 8H23L25 12H7Z" fill="currentColor"/>
                </svg>
              </div>
            </div>
            
            <div className="text-4xl font-extrabold mb-10 relative z-10 drop-shadow-sm">
              {valuationData.storeCarPrice}
            </div>

            <div className="flex justify-between items-end relative z-10">
              <div className="bg-white text-green-600 px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm">
                <TrendingUp size={14} /> {valuationData.increasePercentage} vs. so với giá thị trường
              </div>
              <button 
                onClick={() => navigate('/sell-car', { state: { carData: { ...(location.state?.formData || {}), desiredPrice: valuationData.rawEstimated ? Math.round(valuationData.rawEstimated / 1000000) : '' } } })}
                className="bg-white text-[#0096ff] px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-gray-50 transition"
              >
                Bán xe ngay
              </button>
            </div>
            
            {/* Abstract background shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/3"></div>
          </div>

          {/* Market Price Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="font-semibold text-lg text-gray-500">Giá xe giao dịch tại thị trường</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center bg-white border border-yellow-400 px-1 rounded h-[24px] w-[50px] overflow-hidden">
                    <img src="/chotot-logo-1.png" alt="Chợ Tốt" className="h-[44px] max-w-none object-contain" />
                  </div>
                  <div className="flex items-center justify-center bg-white border border-gray-200 px-1 rounded h-[24px] w-[54px] overflow-hidden">
                    <img src="/bonbanh-logo.png" alt="Bonbanh" className="h-[40px] max-w-none object-contain" />
                  </div>
                </div>
              </div>
              
              <div className="text-3xl font-extrabold text-[#1a2b49] mb-6">
                {valuationData.marketPrice}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500 leading-relaxed border border-gray-100">
              Giá hiển thị trên các nền tảng chỉ là giá chào. Giá chốt thực tế thường trừ đi 5-10% giá trị xe.
            </div>
          </div>
        </div>

        {/* Footer Link / Additional Section */}
        <div>
          <button className="bg-[#0096ff] text-white px-6 py-2 rounded text-sm font-bold shadow transition hover:bg-blue-600 uppercase">
            Cẩm nang bán xe
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValuationResult;
