import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Clock, Share2, MessageCircle, ChevronRight, CheckCircle, Eye, AlertCircle, Phone, ShieldCheck, Tag } from 'lucide-react';

import ChatWidget from '../components/ChatWidget';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { formatPriceShortVND } from '../utils/valuationHelpers';
import './PublicCarDetail.css';

const PublicCarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState([]);
  const [views, setViews] = useState(0);
  const viewIncremented = useRef(false);

  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  const handleImageError = (e) => {
    e.target.onerror = null; 
    e.target.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' fill='%23f8fbff'%3E%3Crect width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239ca3af'%3EKh%C3%B4ng t%C3%ACm th%E1%BA%A5y %E1%BA%A3nh%3C/text%3E%3C/svg%3E";
  };

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const { getPublicListingById } = await import('../services/carListingService');
        const data = await getPublicListingById(id);

        if (data) {
          const mapped = {
            ...data,
            id: data._id,
            title: `${data.brand} ${data.model} ${data.year}`,
            highestBid: data.price ? formatPriceShortVND(data.price) : 'Thỏa thuận',
            location: data.location || 'Hà Nội',
            mileage: `${data.mileage.toLocaleString('vi-VN')} km`,
            images: data.images?.length > 0 ? data.images : [data.image || 'https://images.unsplash.com/photo-1550355291-bbee04a92027'],
            user: 'Store Car'
          };
          setCar(mapped);
        }
      } catch (err) {
        toast.error('Không tìm thấy thông tin xe');
        setCar(null);
      }
    };
    fetchCar();

    const storedComments = JSON.parse(localStorage.getItem(`storeCar_comments_${id}`)) || [
      { id: 1, author: '*****5786', text: 'Xe còn trong tình trạng tốt không, tôi có thể đến xem trực tiếp không?', time: 'khoảng 1 giờ trước' },
      { id: 2, author: '*****1201', text: 'Cho hỏi xe có hỗ trợ trả góp không ạ?', time: 'hôm qua' }
    ];
    setComments(storedComments);

    let currentViews = parseInt(localStorage.getItem(`storeCar_views_${id}`));
    if (isNaN(currentViews)) {
      currentViews = Math.floor(Math.random() * 50) + 100;
    }
    
    // Ngăn chặn React StrictMode chạy 2 lần trong môi trường Dev
    if (!viewIncremented.current) {
      currentViews += 1;
      localStorage.setItem(`storeCar_views_${id}`, currentViews);
      viewIncremented.current = true;
    }
    setViews(currentViews);
  }, [id]);

  const handleSendComment = () => {
    if (!commentInput.trim()) return;

    let authorName = `*****${Math.floor(1000 + Math.random() * 9000)}`;
    let isAdmin = false;

    const staffRoles = ['admin', 'manager', 'purchasing_staff', 'technician'];
    if (user && staffRoles.includes(user.role)) {
      authorName = 'STORE CAR';
      isAdmin = true;
    } else if (user && user.name) {
      authorName = user.name;
    }

    const newComment = {
      id: Date.now(),
      author: authorName,
      isAdmin: isAdmin,
      text: commentInput.trim(),
      time: 'Vừa xong'
    };
    const updated = [newComment, ...comments];
    setComments(updated);
    localStorage.setItem(`storeCar_comments_${id}`, JSON.stringify(updated));
    setCommentInput('');
    toast.success('Đã gửi bình luận!');
  };

  const handleContactClick = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để liên hệ người bán!');
      navigate('/login');
      return;
    }
    setShowContactModal(true);
  };

  const submitContactRequest = () => {
    if (!contactMessage.trim()) {
      toast.error('Vui lòng nhập tin nhắn!');
      return;
    }

    const newRequest = {
      id: Date.now(),
      carId: car.id || car._id || 'unknown',
      carTitle: car.title || `${car.brand || ''} ${car.model || ''}`.trim() || 'Xe không xác định',
      customerId: user._id || 'guest',
      customerName: user.name || 'Khách hàng',
      customerPhone: user.phone || 'Chưa cập nhật',
      message: contactMessage,
      status: 'pending',
      createdAt: new Date().toISOString(),
      carPrice: car.highestBid || car.price || 'Thỏa thuận'
    };

    const existingRequests = JSON.parse(localStorage.getItem('storeCar_buy_requests')) || [];
    localStorage.setItem('storeCar_buy_requests', JSON.stringify([newRequest, ...existingRequests]));
    window.dispatchEvent(new Event('buy_request_updated'));

    toast.success('Yêu cầu liên hệ đã được gửi đến hệ thống!');
    setShowContactModal(false);
    setContactMessage('');
  };

  if (!car) {
    return (
      <div className="pcd-not-found">
        <AlertCircle size={64} color="#94a3b8" />
        <h2>Không tìm thấy xe</h2>
        <button onClick={() => navigate('/buy-car')}>
          Quay lại trang danh sách
        </button>
      </div>
    );
  }

  const brandName = car.title?.split(' ')[0] || 'Unknown';
  const year = car.title?.match(/\d{4}/)?.[0] || '2020';
  const odo = car.mileage || 'Chưa cập nhật';
  const location = car.location || 'Chưa cập nhật';

  const images = Array.isArray(car.images) && car.images.length > 0
    ? car.images
    : car.image
      ? [car.image]
      : [];

  return (
    <div className="pcd-wrapper">
      <div className="pcd-container">
        
        {/* Breadcrumb */}
        <div className="pcd-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={14} />
          <Link to="/buy-car">Mua xe</Link>
          <ChevronRight size={14} />
          <span className="pcd-breadcrumb-current">{brandName}</span>
        </div>

        {/* Header */}
        <div className="pcd-header">
          <div className="pcd-location"><MapPin size={16} /> {location}</div>
          <h1 className="pcd-title">{car.title}</h1>
          <div className="pcd-badges">
            <div className="pcd-badge-info"><Tag size={16}/> Đời xe: {year}</div>
            <div className="pcd-badge-info"><Clock size={16}/> Odo: {odo}</div>
            <div className="pcd-badge-info" style={{backgroundColor: 'var(--car-success-bg)', color: 'var(--car-success)'}}>
              <ShieldCheck size={16}/> Đã kiểm định 150 điểm
            </div>
            <button className="pcd-action-btn"><MessageCircle size={16} /> Chat</button>
            <button className="pcd-action-btn"><Share2 size={16} /> Chia sẻ</button>
          </div>
        </div>

        <div className="pcd-layout">
          {/* LEFT COLUMN */}
          <div className="pcd-main-col">
            
            {/* Gallery */}
            <div className="pcd-card">
              <div className="pcd-card-body">
                <div className="pcd-gallery-main">
                  <img src={images[activeImage]} alt="Main" onError={handleImageError} />
                </div>
                <div className="pcd-gallery-thumbs">
                  {images.slice(1).map((src, idx) => (
                    <div 
                      key={idx} 
                      className="pcd-thumb"
                      onClick={() => setActiveImage(idx + 1)}
                    >
                      <img src={src} alt={`Thumb ${idx}`} onError={handleImageError} />
                    </div>
                  ))}
                  {images.length > 5 && (
                    <div className="pcd-thumb-more">
                      Xem tất cả ảnh
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="pcd-info-card">
              <div className="pcd-card-header">
                <h3 className="pcd-card-title"><ShieldCheck size={24} color="var(--car-primary)"/> Chứng nhận định giá & Tình trạng xe</h3>
              </div>
              <div className="pcd-card-body">
                <div className="pcd-specs-grid">
                  <div className="pcd-spec-item">
                    <div className="pcd-spec-icon"><Clock size={20} /></div>
                    <div>
                      <div className="pcd-spec-label">Công tơ mét (ODO)</div>
                      <div className="pcd-spec-val">{odo}</div>
                    </div>
                  </div>
                  <div className="pcd-spec-item">
                    <div className="pcd-spec-icon"><CheckCircle size={20} /></div>
                    <div>
                      <div className="pcd-spec-label">Năm sản xuất</div>
                      <div className="pcd-spec-val">{year}</div>
                    </div>
                  </div>
                  <div className="pcd-spec-item">
                    <div className="pcd-spec-icon"><CheckCircle size={20} /></div>
                    <div>
                      <div className="pcd-spec-label">Nhiên liệu</div>
                      <div className="pcd-spec-val">Xăng</div>
                    </div>
                  </div>
                  <div className="pcd-spec-item">
                    <div className="pcd-spec-icon"><CheckCircle size={20} /></div>
                    <div>
                      <div className="pcd-spec-label">Hộp số</div>
                      <div className="pcd-spec-val">Tự động (AT)</div>
                    </div>
                  </div>
                  <div className="pcd-spec-item">
                    <div className="pcd-spec-icon"><CheckCircle size={20} /></div>
                    <div>
                      <div className="pcd-spec-label">Kiểu dáng</div>
                      <div className="pcd-spec-val">SUV / Sedan</div>
                    </div>
                  </div>
                  <div className="pcd-spec-item">
                    <div className="pcd-spec-icon"><MapPin size={20} /></div>
                    <div>
                      <div className="pcd-spec-label">Vị trí</div>
                      <div className="pcd-spec-val">{location}</div>
                    </div>
                  </div>
                </div>

                <div className="pcd-overview">
                  <div className="pcd-overview-title">Tổng quan về chuyên gia đánh giá</div>
                  <div className="pcd-overview-text">
                    {car.userComment || "Xe đã vượt qua quy trình kiểm định nghiêm ngặt 150 điểm của chúng tôi. Sở hữu ngoại thất nguyên bản và nội thất được chăm sóc kỹ lưỡng. Động cơ vận hành êm ái, hệ thống điện ổn định. Cam kết không đâm đụng, không ngập nước, hồ sơ pháp lý rõ ràng. Đây là một lựa chọn hoàn hảo cho gia đình."}
                  </div>
                  <button className="pcd-btn-outline">Xem chi tiết báo cáo kiểm định ⌄</button>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="pcd-side-col">
            
            {/* Price Box */}
            <div className="pcd-price-box">
              <div className="pcd-price-header">
                <span className="pcd-status-badge">Đang bán</span>
                <span className="pcd-time-info"><Clock size={14} /> Mới cập nhật</span>
              </div>
              <div className="pcd-price-label">Giá niêm yết (Đã qua định giá)</div>
              <div className="pcd-price-value">{car.highestBid}</div>
              <div className="pcd-price-negotiable">✓ Có hỗ trợ trả góp qua ngân hàng</div>
              
              <button className="pcd-btn-primary" onClick={handleContactClick}>
                Liên hệ mua xe ngay
              </button>

              <div className="pcd-stats">
                <div className="pcd-stat-item">
                  <div className="pcd-stat-label"><Eye size={14} /> Người xem</div>
                  <div className="pcd-stat-val">{views}</div>
                </div>
                <div className="pcd-stat-item">
                  <div className="pcd-stat-label"><MessageCircle size={14} /> Bình luận</div>
                  <div className="pcd-stat-val">{comments.length}</div>
                </div>
              </div>
            </div>

            {/* Seller */}
            <div className="pcd-seller-card">
              <div className="pcd-seller-title"><ShieldCheck size={18} /> Đại lý ủy quyền Store Car</div>
              {user ? (
                <div>
                  <div className="pcd-seller-name">Trung tâm thu mua xe cũ HN</div>
                  <div className="pcd-seller-phone">0836 304 231</div>
                  <div className="pcd-seller-verified"><CheckCircle size={14} /> Đã xác thực</div>
                </div>
              ) : (
                <div>
                  <div className="pcd-login-prompt">
                    <div className="pcd-avatars">
                      <div style={{background: '#e2e8f0', color: '#475569'}}>A</div>
                      <div style={{background: '#bfdbfe', color: '#1e3a8a'}}>H</div>
                      <div style={{background: '#e9d5ff', color: '#581c87'}}>C</div>
                    </div>
                    <span className="pcd-login-link" onClick={() => navigate('/login')}>Đăng nhập để xem SĐT</span>
                  </div>
                </div>
              )}
            </div>

            {/* Banner */}
            {!user ? (
              <div className="pcd-banner pcd-banner-blue">
                <Phone size={24} color="var(--car-primary)" className="pcd-banner-icon" />
                <div>
                  <div className="pcd-banner-title">Bạn muốn bán xe?</div>
                  <div className="pcd-banner-text">Định giá xe nhanh chóng, thu mua tận nhà với giá cao nhất thị trường.</div>
                  <Link to="/login" className="pcd-btn-sm">Đăng nhập</Link>
                </div>
              </div>
            ) : (
              <div className="pcd-banner pcd-banner-green">
                <CheckCircle size={24} color="var(--car-success)" className="pcd-banner-icon" />
                <div>
                  <div className="pcd-banner-title">Đã đăng ký nhận thông báo</div>
                  <div className="pcd-banner-text">Bạn sẽ nhận được thông báo ngay khi có xe tương tự hoặc khi có giá mới!</div>
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="pcd-comments">
              <div className="pcd-comments-header">
                Hỏi đáp về xe <span className="pcd-comments-count">({comments.length})</span>
              </div>
              
              <div className="pcd-comment-input-area">
                <input 
                  type="text" 
                  className="pcd-input"
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                  placeholder="Đặt câu hỏi cho chuyên gia..."
                />
                <button className="pcd-btn-send" onClick={handleSendComment}>Gửi</button>
              </div>

              {comments.length === 0 ? (
                <div style={{textAlign: 'center', color: 'var(--car-text-light)', fontSize: '14px', padding: '16px 0'}}>
                  Chưa có câu hỏi nào. Hãy là người đầu tiên!
                </div>
              ) : (
                <div className="pcd-comment-list">
                  {comments.map((cmt) => {
                    const isStore = cmt.isAdmin || cmt.author === 'STORE CAR';
                    return (
                      <div key={cmt.id} className={`pcd-comment-item ${isStore ? 'is-admin' : ''}`}>
                        <div className="pcd-comment-meta">
                          <div className={`pcd-comment-author ${isStore ? 'pcd-author-admin' : ''}`}>
                            {cmt.author}
                            {isStore && <span className="pcd-author-badge"><CheckCircle size={10}/> Quản trị viên</span>}
                          </div>
                          <div className="pcd-comment-time">{cmt.time}</div>
                        </div>
                        <div className="pcd-comment-text">{cmt.text}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Modal Liên Hệ */}
      {showContactModal && (
        <div className="pcd-modal-overlay">
          <div className="pcd-modal-content">
            <div className="pcd-modal-header">
              <h3 className="pcd-modal-title">Liên hệ mua xe</h3>
              <button className="pcd-modal-close" onClick={() => setShowContactModal(false)}>✕</button>
            </div>
            <div className="pcd-modal-body">
              <div className="pcd-modal-car-info">
                <div style={{fontSize: '13px', color: 'var(--car-text-muted)', marginBottom: '4px'}}>Xe bạn đang quan tâm:</div>
                <div className="pcd-modal-car-title">{car.title}</div>
                <div className="pcd-modal-car-price">{car.highestBid}</div>
              </div>
              
              <div className="pcd-form-group">
                <label className="pcd-form-label">Họ và tên của bạn</label>
                <input type="text" className="pcd-input" style={{background: '#f8fafc', color: 'var(--car-text-muted)'}} value={user?.name || ''} disabled />
              </div>
              <div className="pcd-form-group">
                <label className="pcd-form-label">Số điện thoại</label>
                <input type="text" className="pcd-input" style={{background: '#f8fafc', color: 'var(--car-text-muted)'}} value={user?.phone || 'Chưa cập nhật SĐT'} disabled />
              </div>
              <div className="pcd-form-group" style={{marginBottom: 0}}>
                <label className="pcd-form-label">Lời nhắn (<span>*</span>)</label>
                <textarea 
                  className="pcd-textarea" 
                  placeholder="Tôi muốn thương lượng giá hoặc xem xe trực tiếp..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="pcd-modal-footer">
              <button className="pcd-btn-cancel" onClick={() => setShowContactModal(false)}>Hủy bỏ</button>
              <button className="pcd-btn-submit" onClick={submitContactRequest}>Gửi yêu cầu</button>
            </div>
          </div>
        </div>
      )}

      <ChatWidget />
    </div>
  );
};

export default PublicCarDetail;
