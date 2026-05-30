// frontend/src/App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import ChangePassword from './pages/ChangePassword';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CreateListing from './pages/customer/CreateListing';
import ListingDetail from './pages/customer/ListingDetail';
import BuyCar from './pages/BuyCar';
import SellCar from './pages/SellCar';
import ValuationResult from './pages/ValuationResult';
import AdminDashboard from './pages/admin/AdminDashboard';

import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import InspectCar from './pages/technician/InspectCar';
import InternalPostCar from './pages/internal/InternalPostCar';
import InternalManageCars from './pages/internal/InternalManageCars';
import InternalCarDetail from './pages/internal/InternalCarDetail';
import InternalBuyRequests from './pages/internal/InternalBuyRequests';

import PublicCarDetail from './pages/PublicCarDetail';
import InfoPage from './pages/InfoPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/buy-car" element={<BuyCar />} />
          <Route path="/sell-car" element={<SellCar />} />
          <Route path="/buy-car/:id" element={<PublicCarDetail />} />
          <Route path="/info/:slug" element={<InfoPage />} />
          <Route path="/valuation-result" element={<ValuationResult />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Các route yêu cầu đăng nhập */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>

          {/* Ví dụ route chỉ dành cho admin (có thể mở rộng) */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
             <Route path="/admin" element={<AdminDashboard />} />
          </Route>
             
          {/* Route cho khách hàng */}
          <Route element={<PrivateRoute allowedRoles={['customer']} />}>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/new-listing" element={<CreateListing />} />
            <Route path="/customer/listing/:id" element={<ListingDetail />} />
            {/* Có thể thêm route sửa nếu muốn */}
          </Route>

          <Route element={<PrivateRoute allowedRoles={['technician', 'admin']} />}>
            <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
            <Route path="/technician/inspect/:id" element={<InspectCar />} />
          </Route>

          {/* Quy trình đăng xe nội bộ (Dành chung cho mua hàng, quản lý, admin) */}
          <Route element={<PrivateRoute allowedRoles={['purchasing_staff', 'manager', 'admin']} />}>
            <Route path="/internal/post-car" element={<InternalPostCar />} />
            <Route path="/internal/manage-cars" element={<InternalManageCars />} />
            <Route path="/internal/car/:id" element={<InternalCarDetail />} />
            <Route path="/internal/buy-requests" element={<InternalBuyRequests />} />
          </Route>

        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;