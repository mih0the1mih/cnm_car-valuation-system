import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check } from 'lucide-react';
import { carModels } from '../utils/valuationHelpers';

const ValuationModal = ({ isOpen, onClose, initialBrand }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    version: '',
    odo: '',
    batteryHealth: 100,
    sellTime: ''
  });

  React.useEffect(() => {
    if (isOpen) {
      if (initialBrand) {
        setFormData({ brand: initialBrand, model: '', year: '', version: '', odo: '', batteryHealth: 100, sellTime: '' });
        setCurrentStep(2);
      } else {
        setFormData({ brand: '', model: '', year: '', version: '', odo: '', batteryHealth: 100, sellTime: '' });
        setCurrentStep(1);
      }
    }
  }, [isOpen, initialBrand]);

  const navigate = useNavigate();

  if (!isOpen) return null;

  const baseSteps = [
    { id: 1, key: 'brand', title: 'Hãng xe', type: 'select', placeholder: 'Chọn hãng xe', options: Object.keys(carModels) },
    { id: 2, key: 'model', title: 'Dòng xe', type: 'select', placeholder: 'Chọn dòng xe', options: formData.brand && carModels[formData.brand] ? Object.keys(carModels[formData.brand]) : [] },
    { id: 3, key: 'year', title: 'Đời xe', type: 'select', placeholder: 'Chọn đời xe', options: Array.from({length: 15}, (_, i) => String(new Date().getFullYear() - i)) },
    { id: 4, key: 'version', title: 'Phiên bản', type: 'select', placeholder: 'Chọn phiên bản', options: formData.brand && formData.model && carModels[formData.brand][formData.model] ? carModels[formData.brand][formData.model] : [] },
    { id: 5, key: 'odo', title: 'Công tơ mét', type: 'input', placeholder: 'Nhập số Km đã đi' }
  ];

  let steps = [...baseSteps];
  if (formData.brand === 'VinFast') {
    steps.push({ id: 6, key: 'batteryHealth', title: 'Tình trạng Pin (%)', type: 'range', placeholder: '100' });
    steps.push({ id: 7, key: 'sellTime', title: 'Khi nào bán xe?', type: 'select', placeholder: 'Chọn thời gian', options: ['Ngay bây giờ', 'Trong 1 tuần', 'Trong 1 tháng'] });
  } else {
    steps.push({ id: 6, key: 'sellTime', title: 'Khi nào bán xe?', type: 'select', placeholder: 'Chọn thời gian', options: ['Ngay bây giờ', 'Trong 1 tuần', 'Trong 1 tháng'] });
  }

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
    else {
      // Navigate to the result page with the form data
      onClose(); // Prevent modal staying open in background
      navigate('/valuation-result', { state: { formData } });
    }
  };

  const handleInputChange = (key, value) => {
    if (key === 'brand') {
      setFormData(prev => ({ ...prev, brand: value, model: '', version: '' }));
    } else {
      setFormData(prev => ({ ...prev, [key]: value }));
    }

    const stepObj = steps.find(s => s.key === key);
    if (stepObj && stepObj.type === 'select' && value) {
      if (currentStep === stepObj.id && currentStep < steps.length) {
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
        }, 150);
      }
    }
  };

  const isStepCompleted = (stepId) => currentStep > stepId || formData[steps.find(s => s.id === stepId).key] !== '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-[650px] flex flex-col shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={24} />
        </button>

        <div className="p-10 pl-16">
          <div className="relative">
            {/* Vertical Line Connecting Steps */}
            <div className="absolute left-4 top-4 bottom-12 w-px bg-gray-200 z-0"></div>

            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isPast = currentStep > step.id;
              const isFuture = currentStep < step.id;

              return (
                <div key={step.id} className="relative z-10 flex min-h-[70px] mb-2">
                  
                  {/* Step Indicator */}
                  <div className="flex-shrink-0 flex justify-center w-8 mr-6 mt-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isActive ? 'bg-[#00d68f] text-white shadow-md shadow-green-200' : isPast ? 'bg-[#00d68f] text-white' : 'bg-gray-200 text-white'}`}>
                      {isPast ? <Check size={16} strokeWidth={3} /> : step.id}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 flex flex-col md:flex-row md:items-start pt-2 gap-2">
                    <div className="w-full md:w-36 text-sm text-gray-600 mt-1.5 flex-shrink-0">
                      {step.title}
                    </div>
                    
                    <div className="flex-1 w-full max-w-[300px]">
                      {(isActive || formData[step.key]) ? (
                        <>
                          {step.type === 'select' ? (
                            <select 
                              value={formData[step.key]}
                              onChange={(e) => handleInputChange(step.key, e.target.value)}
                              className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm appearance-none outline-none transition-all cursor-pointer bg-white ${isActive ? 'border-[#0096ff] text-[#0096ff] font-semibold' : 'border-gray-200 text-gray-800 font-medium'}`}
                              disabled={isFuture}
                            >
                              <option value="" disabled>{step.placeholder}</option>
                              {step.options.map((opt, i) => <option key={i} value={opt} className="text-gray-800">{opt}</option>)}
                            </select>
                          ) : step.type === 'range' ? (
                            <div className="flex items-center gap-4">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={formData[step.key]}
                                onChange={(e) => handleInputChange(step.key, e.target.value)}
                                className="w-full cursor-pointer accent-[#0096ff]"
                                disabled={isFuture}
                              />
                              <span className="font-bold text-[#0096ff] w-12 text-right">{formData[step.key]}%</span>
                            </div>
                          ) : (
                            <input
                              type="number"
                              value={formData[step.key]}
                              onChange={(e) => handleInputChange(step.key, e.target.value)}
                              placeholder={step.placeholder}
                              className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white ${isActive ? 'border-[#0096ff] text-[#0096ff] font-semibold' : 'border-gray-200 text-gray-800 font-medium'}`}
                              disabled={isFuture}
                            />
                          )}
                        </>
                      ) : null}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          <div className="flex justify-end mt-4 gap-4">
            {currentStep > 1 && (
              <button 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="bg-gray-100 text-gray-700 px-8 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-200 hover:shadow-md transition-all border border-gray-200"
              >
                Quay lại
              </button>
            )}
            <button 
              onClick={handleNext}
              disabled={!formData[steps[currentStep - 1].key]}
              className="bg-[#0096ff] text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-blue-600 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === steps.length ? 'Nhận báo giá' : 'Tiếp theo'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ValuationModal;
