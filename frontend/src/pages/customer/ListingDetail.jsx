import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getListingById } from '../../services/carListingService';
import toast from 'react-hot-toast';

const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getListingById(id);
        setListing(data);
      } catch (err) {
        toast.error('Không thể tải thông tin');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="text-center p-8">Đang tải...</div>;
  if (!listing) return <div className="text-center p-8">Không tìm thấy</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4">
        <Link to="/customer/dashboard" className="text-blue-600 hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">
            {listing.brand} {listing.model} ({listing.year})
          </h1>
          <span className={`px-3 py-1 rounded text-sm font-semibold ${
            listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            listing.status === 'priced' ? 'bg-blue-100 text-blue-800' :
            listing.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {listing.status === 'pending' && 'Chờ xử lý'}
            {listing.status === 'priced' && 'Đã định giá'}
            {listing.status === 'accepted' && 'Đã chấp thuận'}
            {listing.status === 'rejected' && 'Từ chối'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div><strong>Số km:</strong> {listing.mileage.toLocaleString()} km</div>
          <div><strong>Tình trạng:</strong> {listing.condition}</div>
          <div><strong>Giá mong muốn:</strong> {listing.desiredPrice.toLocaleString()} VND</div>
          {listing.suggestedPrice && (
            <div className="text-green-700 font-semibold">
              <strong>Giá đề xuất:</strong> {listing.suggestedPrice.toLocaleString()} VND
            </div>
          )}
          {listing.aiConfidence && (
            <div><strong>Độ tin cậy:</strong> {listing.aiConfidence}%</div>
          )}
          {listing.riskAssessment && (
            <div><strong>Đánh giá rủi ro:</strong> {listing.riskAssessment}</div>
          )}
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-lg mb-2">Chi tiết tình trạng</h3>
          {listing.exterior && <p><strong>Ngoại thất:</strong> {listing.exterior}</p>}
          {listing.interior && <p><strong>Nội thất:</strong> {listing.interior}</p>}
          {listing.engine && <p><strong>Động cơ:</strong> {listing.engine}</p>}
          {listing.notes && <p><strong>Ghi chú:</strong> {listing.notes}</p>}
        </div>

        <div className="mt-6 text-sm text-gray-500">
          Ngày tạo: {new Date(listing.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;