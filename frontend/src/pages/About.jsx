import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Car, 
  CheckCircle2, 
  XOctagon,
  Zap,
  Award,
  Cpu,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

const About = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gradient-to-b from-blue-50/30 to-white min-h-screen pb-20">
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 xl:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left Side: Headlines */}
        <div className="w-full md:w-1/2 flex flex-col items-start gap-8 z-10">
          <h1 className="text-4xl md:text-5xl lg:text-[54px] leading-[1.2] font-bold text-[#1a2b3c] tracking-tight">
            Store Car được ra đời và thúc đẩy mỗi ngày để mang đến giải pháp bán ô tô cũ của bạn <br/>
            <span className="text-[#0096ff] relative inline-block mt-2">
              giá cao nhất thị trường
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#0096ff]/20" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M2.55396 9.45898C46.8091 3.51342 121.728 -1.82114 197.662 9.45898" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
            </span>
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
            <button className="bg-[#0096ff] hover:bg-blue-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
              Store Car kết nối bán xe thế nào?
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 px-6 rounded-xl shadow-sm border border-gray-200 transition-all flex items-center justify-center gap-2">
              Khách hàng nói gì về Store Car?
            </button>
          </div>
        </div>

        {/* Right Side: Visual Graphic */}
        <div className="w-full md:w-1/2 relative h-[400px] flex justify-center items-center">
          {/* Main Central Card */}
          <div className="absolute z-20 bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 flex items-center gap-4 animate-bounce-slow">
             <div className="w-14 h-14 bg-[#0096ff] rounded-xl flex items-center justify-center text-white">
               <Car size={32} />
             </div>
             <div>
               <h3 className="text-xl font-bold text-[#0096ff]">Store Car</h3>
               <p className="text-gray-500 font-medium text-sm">Verified Used Car</p>
             </div>
          </div>

          {/* Floating Orbiting elements */}
          <div className="absolute top-10 left-10 bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 z-30">
             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Users size={16} /></div>
             <span className="text-sm font-bold text-gray-700">Hỗ trợ từ A - Z</span>
          </div>

          <div className="absolute bottom-16 right-4 bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 z-30">
             <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle2 size={16} /></div>
             <span className="text-sm font-bold text-gray-700">Bán xe giá tốt</span>
          </div>

          <div className="absolute bottom-24 left-4 bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 z-30">
             <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><Zap size={16} /></div>
             <span className="text-sm font-bold text-gray-700">Thủ tục nhanh gọn</span>
          </div>

           {/* Decorative dashed dashed circles */}
          <div className="absolute inset-0 border-2 border-dashed border-blue-200 rounded-full opacity-50 scale-[0.8]"></div>
          <div className="absolute inset-0 border-2 border-dashed border-gray-200 rounded-full opacity-50 scale-[1.1]"></div>
        </div>
      </section>

      {/* 2. Stats Bar Section */}
      <section className="bg-gradient-to-r from-[#1785e6] to-[#0096ff] py-16 text-white w-full">
        <div className="max-w-7xl mx-auto px-4 xl:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/20">
           <div className="flex flex-col items-center gap-3">
             <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><Users size={32} /></div>
             <div>
               <h4 className="text-4xl font-black mb-1">4000+</h4>
               <p className="text-blue-100 font-medium">người mua</p>
             </div>
           </div>
           <div className="flex flex-col items-center gap-3">
             <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><TrendingUp size={32} /></div>
             <div>
               <h4 className="text-4xl font-black mb-1">2000+</h4>
               <p className="text-blue-100 font-medium">giao dịch thành công</p>
             </div>
           </div>
           <div className="flex flex-col items-center gap-3">
             <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><MessageSquare size={32} /></div>
             <div>
               <h4 className="text-4xl font-black mb-1">700+</h4>
               <p className="text-blue-100 font-medium">khách hàng phục vụ</p>
             </div>
           </div>
           <div className="flex flex-col items-center gap-3">
             <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><Zap size={32} /></div>
             <div>
               <h4 className="text-4xl font-black mb-1">300+ tỷ</h4>
               <p className="text-blue-100 font-medium">giá trị giao dịch</p>
             </div>
           </div>
        </div>
      </section>

      {/* 3. Mission Section */}
      <section className="max-w-7xl mx-auto px-4 xl:px-8 pt-24 pb-20 flex flex-col md:flex-row items-center gap-16">
         {/* Left Visual */}
         <div className="w-full md:w-1/2 relative flex justify-center">
             <div className="w-80 h-80 md:w-96 md:h-96 bg-blue-50 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10"></div>
             
             {/* Center Graphic replacing image */}
             <div className="relative">
                <div className="w-80 h-80 md:w-80 md:h-[340px] bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center justify-center gap-4 relative z-10 overflow-hidden">
                   <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#e6f4ff] to-white/0"></div>
                   <ShieldCheck size={100} className="text-[#0096ff] opacity-10 absolute" />
                   <div className="z-10 text-center -mt-12">
                     <h3 className="text-4xl font-black text-[#0096ff] mb-2 tracking-tight">Store Car</h3>
                     <p className="font-semibold text-gray-500 text-lg">Dịch vụ chuyên nghiệp</p>
                   </div>
                </div>

                {/* Floating Badges */}
                <div className="absolute -left-6 md:-left-10 top-16 bg-white px-5 py-3 rounded-2xl shadow-lg border border-gray-50 flex items-center gap-3 z-20">
                  <ShieldCheck size={20} className="text-[#0096ff]" />
                  <span className="font-bold text-gray-700 text-sm">Cam kết uy tín</span>
                </div>
                <div className="absolute -right-4 md:-right-8 bottom-10 bg-white px-5 py-4 rounded-2xl shadow-lg border border-gray-50 flex flex-col gap-1 z-20 border-b-4 border-[#0096ff]">
                  <span className="text-sm font-bold text-gray-800">Kết nối bán xe giá tốt</span>
                  <span className="font-black text-[#0096ff] text-xl">2000+ người mua</span>
                </div>
             </div>
         </div>

         {/* Right Text */}
         <div className="w-full md:w-1/2">
             <h2 className="text-4xl md:text-[42px] font-bold text-gray-800 mb-6">Sứ mệnh của chúng tôi</h2>
             <p className="text-lg text-gray-600 mb-6 leading-relaxed">
               Bị ép giá, không tìm được người mua giá tốt, thủ tục phức tạp - chúng tôi thấu hiểu những nỗi sợ của các khách hàng lần đầu tiên bán xe. Từ đây, Store Car hướng đến giải pháp hoàn toàn mới: <strong className="text-[#0096ff] font-bold">Kết nối bán xe giá cao nhất với 2000+ người mua.</strong>
             </p>
             <p className="text-lg text-gray-600 leading-relaxed">
               Với sự đồng hành xuyên suốt của Store Car trong hành trình bán xe, chúng tôi cam kết mang đến dịch vụ uy tín và trải nghiệm tốt chưa từng có.
             </p>
         </div>
      </section>

      {/* 4. Core Values */}
      <section className="bg-gray-50/50 py-24">
         <div className="max-w-7xl mx-auto px-4 xl:px-8 text-center flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a2b3c] mb-16">Những giá trị chúng tôi đảm bảo trong mỗi giao dịch</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
               <div className="bg-white rounded-3xl p-10 border-2 border-transparent hover:border-[#0096ff] transition-all shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,150,255,0.15)] flex flex-col items-center group">
                 <div className="w-20 h-20 bg-[#e6f4ff] rounded-2xl flex items-center justify-center text-[#0096ff] mb-6 group-hover:scale-110 transition-transform">
                   <Zap size={36} strokeWidth={2.5} />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-800 mb-4">Minh bạch</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Giá cả - tình trạng xe - giấy tờ, chúng tôi đảm bảo mọi thông tin được xác thực rõ ràng và minh bạch.
                 </p>
               </div>

               <div className="bg-white rounded-3xl p-10 border-2 border-[#0096ff] shadow-[0_20px_50px_rgba(0,150,255,0.1)] flex flex-col items-center relative transform md:-translate-y-4">
                 {/* Decorative Top Accent */}
                 <div className="absolute top-0 inset-x-0 h-1 bg-[#0096ff] rounded-t-3xl"></div>
                 <div className="w-20 h-20 bg-[#0096ff] rounded-2xl flex items-center justify-center text-white mb-6 animate-pulse-slow">
                   <Award size={36} strokeWidth={2.5} />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-800 mb-4">Uy tín</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Với chính sách xác thực thông tin và đảm bảo quyền lợi khách hàng, chúng tôi cam kết chất lượng trong mỗi giao dịch.
                 </p>
               </div>

               <div className="bg-white rounded-3xl p-10 border-2 border-transparent hover:border-[#0096ff] transition-all shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,150,255,0.15)] flex flex-col items-center group">
                 <div className="w-20 h-20 bg-[#e6f4ff] rounded-2xl flex items-center justify-center text-[#0096ff] mb-6 group-hover:scale-110 transition-transform">
                   <Cpu size={36} strokeWidth={2.5} />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-800 mb-4">Thông minh</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Ứng dụng AI vào định giá xe, xác thực thông tin và kết nối người mua, chúng tôi mang đến trải nghiệm hiện đại.
                 </p>
               </div>
            </div>
         </div>
      </section>

      {/* 5. Comparison Section */}
      <section className="max-w-7xl mx-auto px-4 xl:px-8 py-24 text-center">
         <h2 className="text-3xl md:text-[38px] font-bold text-[#1a2b3c] mb-16 max-w-4xl mx-auto leading-tight">
           So sánh Bán xe truyền thống <br className="hidden md:block" />
           và <span className="text-[#0096ff]">Kết nối bán xe với 2000+ người mua của Store Car</span>
         </h2>

         <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 items-center flex-col-reverse lg:flex-row relative">
            
            {/* Left Box: Traditional */}
            <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_10px_50px_rgba(0,0,0,0.06)] border border-gray-100 text-left w-full">
               <h3 className="text-2xl font-bold text-gray-800 mb-8 border-b border-gray-100 pb-4">Bán xe truyền thống</h3>
               <ul className="space-y-5 text-gray-600 font-medium">
                 <li className="flex items-start gap-3">
                   <XOctagon className="text-red-500 mt-0.5 shrink-0" size={20} /> Tự tìm kiếm người mua
                 </li>
                 <li className="flex items-start gap-3">
                   <XOctagon className="text-red-500 mt-0.5 shrink-0" size={20} /> Tự xác định tình trạng xe
                 </li>
                 <li className="flex items-start gap-3">
                   <XOctagon className="text-red-500 mt-0.5 shrink-0" size={20} /> Tự thương lượng giá mua - bán
                 </li>
                 <li className="flex items-start gap-3">
                   <XOctagon className="text-red-500 mt-0.5 shrink-0" size={20} /> Tự xử lý thủ tục giấy tờ
                 </li>
                 <li className="flex items-start gap-3">
                   <XOctagon className="text-red-500 mt-0.5 shrink-0" size={20} /> Chi phí quảng cáo và môi giới cao
                 </li>
                 <li className="flex items-start gap-3">
                   <XOctagon className="text-red-500 mt-0.5 shrink-0" size={20} /> Tự xử lý rủi ro
                 </li>
               </ul>
            </div>

            {/* VS Badge */}
            <div className="hidden lg:flex w-24 h-24 bg-white rounded-full shadow-2xl items-center justify-center z-10 mx-auto text-[#0096ff] font-black text-3xl border-4 border-[#e6f4ff]">
               VS
            </div>

            {/* Right Box: Store Car (Blue) */}
            <div className="bg-gradient-to-br from-[#0096ff] to-[#007cdb] rounded-3xl p-8 lg:p-12 shadow-[0_20px_50px_rgba(0,150,255,0.3)] text-left text-white relative overflow-hidden w-full">
               {/* Decorative Circles */}
               <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
               <div className="absolute bottom-[-100px] right-0 w-64 h-64 bg-[#004e96]/30 rounded-full blur-3xl"></div>

               <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/20 pb-4">
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight">
                    Nền tảng kết nối bán xe<br />
                    2000+ người mua của Store Car
                  </h3>
                  <Link to="/sell-car" className="bg-white text-[#0096ff] font-bold py-2.5 px-6 rounded-xl hover:bg-gray-50 transition shadow-lg shrink-0 flex items-center gap-2">
                    Bán xe ngay <ChevronRight size={18} />
                  </Link>
               </div>
               
               <ul className="space-y-5 font-medium relative z-10 text-blue-50">
                 <li className="flex items-start gap-3">
                   <div className="bg-white/20 p-1 rounded-full shrink-0"><CheckCircle2 className="text-white" size={16} /></div> 
                   Kết nối 2000+ người mua có nhu cầu
                 </li>
                 <li className="flex items-start gap-3">
                   <div className="bg-white/20 p-1 rounded-full shrink-0"><CheckCircle2 className="text-white" size={16} /></div> 
                   Kiểm tra xe miễn phí, tận nơi
                 </li>
                 <li className="flex items-start gap-3">
                   <div className="bg-white/20 p-1 rounded-full shrink-0"><CheckCircle2 className="text-white" size={16} /></div> 
                   Chọn người mua đấu giá cao nhất sau 24h
                 </li>
                 <li className="flex items-start gap-3">
                   <div className="bg-white/20 p-1 rounded-full shrink-0"><CheckCircle2 className="text-white" size={16} /></div> 
                   Hỗ trợ xử lý giấy tờ từ A-Z
                 </li>
                 <li className="flex items-start gap-3">
                   <div className="bg-white/20 p-1 rounded-full shrink-0"><CheckCircle2 className="text-white" size={16} /></div> 
                   Chỉ thu phí khi hỗ trợ thành công
                 </li>
                 <li className="flex items-start gap-3">
                   <div className="bg-white/20 p-1 rounded-full shrink-0"><CheckCircle2 className="text-white" size={16} /></div> 
                   Hỗ trợ và đảm bảo cho mỗi giao dịch
                 </li>
               </ul>
            </div>
         </div>
      </section>

      {/* Tailwind Custom Animations via arbitrary values or classes if needed - added inline above or standard ones used */}
    </div>
  );
};

export default About;
