// frontend/src/pages/Unauthorized.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="text-center p-10">
      <h1 className="text-3xl font-bold text-red-600">403 - Không có quyền truy cập</h1>
      <p className="mt-4">Bạn không có quyền xem trang này.</p>
      <Link to="/" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">Về trang chủ</Link>
    </div>
  );
};

export default Unauthorized;