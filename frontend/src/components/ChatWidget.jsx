import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { sendMessage, getChatHistory } from '../services/chatbotService';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  const options = [
    "Tôi muốn bán xe",
    "Hỏi về giấy tờ mua bán",
    "Store Car hoạt động thế nào?"
  ];

  // Khởi tạo hoặc lấy sessionId hiện tại
  useEffect(() => {
    let sId = localStorage.getItem('chat_session_id');
    if (!sId) {
      sId = 'session_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('chat_session_id', sId);
    }
    setSessionId(sId);

    // Lấy lịch sử trò chuyện từ DB
    const fetchHistory = async () => {
      try {
        const history = await getChatHistory(sId);
        if (history && history.length > 0) {
          const formatted = history.map(log => ({
            text: log.message,
            sender: log.sender,
            id: log._id,
            intent: log.intent
          }));
          setMessages(formatted);
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
      }
    };
    fetchHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    // Hiển thị tin nhắn của user ngay lập tức
    const userMessage = { text, sender: 'user', id: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      // Gọi API gửi tin nhắn để lưu vào collection chatlogs
      const result = await sendMessage(text, sessionId);
      if (result && result.botReply) {
        const botMessage = {
          text: result.botReply.message,
          sender: 'bot',
          id: result.botReply._id,
          intent: result.botReply.intent
        };

        if (text === "Tôi muốn bán xe") {
          const formMessage = {
            text: "Cho em xin thông tin về xe của anh/chị như sau nhé:",
            sender: 'bot',
            id: Date.now() + 2,
            type: 'form',
            formType: 'sell_car'
          };
          setMessages(prev => [...prev, botMessage, formMessage]);
        } else {
          setMessages(prev => [...prev, botMessage]);
        }
      }
    } catch (err) {
      console.error('Failed to send message to chatbot', err);
      // Fallback phản hồi nếu API lỗi
      setTimeout(() => {
        const botMessage = {
          text: "Xin lỗi, kết nối của em đến tổng đài đang bị gián đoạn. Anh/chị có thể thử lại sau nhé!",
          sender: 'bot',
          id: Date.now() + 1
        };
        setMessages(prev => [...prev, botMessage]);
      }, 800);
    }
  };

  // The custom SVGs to match the design logo
  const LogoSVG = () => (
    <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#0096ff]">
      <path d="M7 16H25V18H7V16ZM4 20H28C29.1046 20 30 20.8954 30 22V24H2V22C2 20.8954 2.89543 20 4 20ZM7 12L9 8H23L25 12H7Z" fill="currentColor"/>
    </svg>
  );

  const SmallLogoSVG = () => (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#0096ff]">
      <path d="M7 16H25V18H7V16ZM4 20H28C29.1046 20 30 20.8954 30 22V24H2V22C2 20.8954 2.89543 20 4 20ZM7 12L9 8H23L25 12H7Z" fill="currentColor"/>
    </svg>
  );

  const SellCarForm = () => (
    <div className="mt-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full mb-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Hãng xe <span className="text-red-500">*</span></label>
          <select className="border border-[#0096ff] rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#0096ff] bg-white">
            <option>Chọn hãng xe</option>
            <option>Toyota</option>
            <option>Honda</option>
            <option>Mazda</option>
            <option>Kia</option>
            <option>VinFast</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Dòng xe <span className="text-red-500">*</span></label>
          <select className="border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50/50 focus:outline-none">
            <option>Chọn dòng xe</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Đời xe <span className="text-red-500">*</span></label>
          <select className="border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50/50 focus:outline-none">
            <option>Chọn đời xe</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Phiên bản</label>
          <select className="border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50/50 focus:outline-none">
            <option>Chọn phiên bản</option>
          </select>
        </div>
      </div>
      <button className="mt-4 bg-[#0096ff] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition w-max">
        Xác nhận
      </button>
    </div>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col w-[420px] h-[550px] mb-4 pointer-events-auto overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
             <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 text-[15px]">Trợ lý ảo</span>
                <div className="flex items-center gap-1 font-bold text-[#0096ff] text-lg leading-none">
                  <SmallLogoSVG />
                  <span className="mb-0.5">store car</span>
                </div>
             </div>
             <div className="flex items-center gap-3">
               <span className="text-xs bg-gray-50 border border-gray-200 text-gray-500 px-2 py-1 rounded-full">
                 Thử nghiệm
               </span>
               <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                 <X size={20} />
               </button>
             </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col bg-white">
            
            {/* If no messages, show welcoming screen */}
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 w-full text-center mt-8">
                 <div className="flex items-center gap-2 font-bold text-[#0096ff] text-3xl mb-4">
                  <LogoSVG />
                  <span>store car</span>
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 px-4">Xin chào. Em ở đây để hỗ trợ mình ạ</h3>
                 
                 {/* Options buttons directly on main screen if no messages yet */}
                 <div className="flex flex-wrap justify-center gap-2 mt-auto mb-4 w-full">
                   {options.map((opt, idx) => (
                     <button 
                       key={idx}
                       onClick={() => handleSend(opt)}
                       className={`border rounded-lg px-4 py-2 text-sm font-medium transition hover:border-[#0096ff] hover:text-[#0096ff] ${idx === 0 ? 'border-[#0096ff] text-[#0096ff] ring-1 ring-[#0096ff]/20' : 'border-gray-200 text-gray-700'}`}
                     >
                       {opt}
                     </button>
                   ))}
                 </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Intro message matching the empty state concept */}
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] text-sm">
                    Xin chào. Em ở đây để hỗ trợ mình ạ!
                  </div>
                </div>

                {/* Render chat messages */}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${msg.sender === 'user' ? 'bg-[#0096ff] text-white rounded-2xl rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'} px-4 py-3 ${msg.type === 'form' ? 'w-[95%] max-w-[95%]' : 'max-w-[85%]'} text-[15px]`}>
                      <span className="leading-relaxed">{msg.text}</span>
                      {msg.type === 'form' && msg.formType === 'sell_car' && <SellCarForm />}
                    </div>
                  </div>
                ))}
                
                {/* Options below the conversation if last message is from bot (optional, but let's keep it simple and just show options if messages < 2 to not clutter) */}
                {messages.length === 2 && (
                   <div className="flex flex-wrap gap-2 mt-2 w-full">
                     {options.filter(opt => opt !== messages[0].text).map((opt, idx) => (
                       <button 
                         key={idx}
                         onClick={() => handleSend(opt)}
                         className="bg-white border border-gray-200 text-gray-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:border-[#0096ff] hover:text-[#0096ff] transition"
                       >
                         {opt}
                       </button>
                     ))}
                   </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
              className="flex items-center gap-2"
            >
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Hỏi Store Car..." 
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0096ff] focus:ring-1 focus:ring-[#0096ff]"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="w-10 h-10 rounded-lg bg-[#0096ff] text-white flex items-center justify-center hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON GROUP (only visible when chat is closed or we can keep it, but standard is to hide bubble if open) */}
      {!isOpen && (
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          {/* Chat bubble hint */}
          <div className="bg-white rounded-2xl rounded-br-sm shadow-xl p-4 max-w-[200px] relative border border-gray-100 flex items-center justify-center animate-bounce-slow">
            <p className="text-sm font-semibold text-gray-800 text-center">Xin chào. Em ở đây để hỗ trợ mình ạ!</p>
            {/* Triangle tip */}
            <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-b border-r border-gray-100 transform rotate-45"></div>
          </div>
          {/* Chat button */}
          <button 
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-[#0096ff] rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-600 transition-colors pointer-events-auto"
          >
            <MessageCircle size={28} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
