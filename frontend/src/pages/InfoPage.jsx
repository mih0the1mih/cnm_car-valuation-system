import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { infoPagesData } from '../constants/infoPagesData';
import './InfoPage.css';

const InfoPage = () => {
  const { slug } = useParams();
  const pageData = infoPagesData[slug];

  useEffect(() => {
    // Cuộn lên đầu trang khi chuyển trang
    window.scrollTo(0, 0);
  }, [slug]);

  if (!pageData) {
    return (
      <div className="info-page-not-found">
        <h1>404</h1>
        <p>Không tìm thấy trang bạn yêu cầu.</p>
        <Link to="/" className="info-page-home-btn">Trở về Trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="info-page-wrapper">
      <div className="info-page-header">
        <span className="info-page-icon">{pageData.icon}</span>
        <h1 className="info-page-title">{pageData.title}</h1>
      </div>
      
      <div className="info-page-content-wrapper">
        <div 
          className="info-page-content" 
          dangerouslySetInnerHTML={{ __html: pageData.content }} 
        />
      </div>
    </div>
  );
};

export default InfoPage;
