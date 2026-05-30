// backend/database/seeders/seedCarPriceList.js
// Script nạp dữ liệu giá niêm yết trung tâm cho tất cả các dòng xe phổ biến tại Việt Nam
// Chạy: node database/seeders/seedCarPriceList.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const CarPriceList = require('../../models/CarPriceList');

// =====================================================
// DỮ LIỆU GIÁ NIÊM YẾT (triệu VNĐ → chuyển sang VNĐ)
// Nguồn tham khảo: giá lăn bánh trung bình tại Việt Nam 2024-2025
// =====================================================
const M = 1_000_000; // 1 triệu

const PRICE_DATA = [
  // ========== TOYOTA ==========
  { brand: 'Toyota', model: 'Vios', version: '1.5E MT', priceNew: 478 * M },
  { brand: 'Toyota', model: 'Vios', version: '1.5E CVT', priceNew: 530 * M },
  { brand: 'Toyota', model: 'Vios', version: '1.5G CVT', priceNew: 580 * M },
  { brand: 'Toyota', model: 'Vios', version: 'GR-S', priceNew: 615 * M },
  { brand: 'Toyota', model: 'Camry', version: '2.0G', priceNew: 1100 * M },
  { brand: 'Toyota', model: 'Camry', version: '2.0Q', priceNew: 1200 * M },
  { brand: 'Toyota', model: 'Camry', version: '2.5Q', priceNew: 1380 * M },
  { brand: 'Toyota', model: 'Camry', version: '2.5HV', priceNew: 1500 * M },
  { brand: 'Toyota', model: 'Corolla Altis', version: '1.8G', priceNew: 733 * M },
  { brand: 'Toyota', model: 'Corolla Altis', version: '1.8V', priceNew: 810 * M },
  { brand: 'Toyota', model: 'Corolla Altis', version: '1.8HEV', priceNew: 868 * M },
  { brand: 'Toyota', model: 'Corolla Cross', version: '1.8G', priceNew: 750 * M },
  { brand: 'Toyota', model: 'Corolla Cross', version: '1.8V', priceNew: 830 * M },
  { brand: 'Toyota', model: 'Corolla Cross', version: '1.8HV', priceNew: 910 * M },
  { brand: 'Toyota', model: 'Fortuner', version: '2.4G MT', priceNew: 1015 * M },
  { brand: 'Toyota', model: 'Fortuner', version: '2.4G AT', priceNew: 1080 * M },
  { brand: 'Toyota', model: 'Fortuner', version: '2.7V', priceNew: 1200 * M },
  { brand: 'Toyota', model: 'Fortuner', version: '2.8V', priceNew: 1430 * M },
  { brand: 'Toyota', model: 'Fortuner', version: 'Legender', priceNew: 1475 * M },
  { brand: 'Toyota', model: 'Innova', version: '2.0E', priceNew: 750 * M },
  { brand: 'Toyota', model: 'Innova', version: '2.0G', priceNew: 830 * M },
  { brand: 'Toyota', model: 'Innova', version: '2.0V', priceNew: 930 * M },
  { brand: 'Toyota', model: 'Innova', version: 'Cross', priceNew: 1000 * M },
  { brand: 'Toyota', model: 'Yaris', version: '1.5G', priceNew: 670 * M },
  { brand: 'Toyota', model: 'Raize', version: '1.0 Turbo', priceNew: 550 * M },
  { brand: 'Toyota', model: 'Veloz Cross', version: 'CVT', priceNew: 658 * M },
  { brand: 'Toyota', model: 'Veloz Cross', version: 'Top', priceNew: 698 * M },
  { brand: 'Toyota', model: 'Avanza Premio', version: 'MT', priceNew: 558 * M },
  { brand: 'Toyota', model: 'Avanza Premio', version: 'CVT', priceNew: 598 * M },
  { brand: 'Toyota', model: 'Land Cruiser', version: 'LC300', priceNew: 4100 * M },
  { brand: 'Toyota', model: 'Land Cruiser', version: 'Prado VX', priceNew: 2550 * M },
  { brand: 'Toyota', model: 'Rush', version: 'S', priceNew: 634 * M },
  { brand: 'Toyota', model: 'Yaris Cross', version: 'Cross', priceNew: 730 * M },

  // ========== HONDA ==========
  { brand: 'Honda', model: 'City', version: '1.5G', priceNew: 559 * M },
  { brand: 'Honda', model: 'City', version: '1.5L', priceNew: 530 * M },
  { brand: 'Honda', model: 'City', version: '1.5RS', priceNew: 599 * M },
  { brand: 'Honda', model: 'Civic', version: '1.5E', priceNew: 750 * M },
  { brand: 'Honda', model: 'Civic', version: '1.5G', priceNew: 810 * M },
  { brand: 'Honda', model: 'Civic', version: '1.5RS', priceNew: 870 * M },
  { brand: 'Honda', model: 'CR-V', version: '1.5E', priceNew: 998 * M },
  { brand: 'Honda', model: 'CR-V', version: '1.5G', priceNew: 1060 * M },
  { brand: 'Honda', model: 'CR-V', version: '1.5L', priceNew: 1120 * M },
  { brand: 'Honda', model: 'CR-V', version: 'Hybrid', priceNew: 1260 * M },
  { brand: 'Honda', model: 'HR-V', version: '1.5G', priceNew: 699 * M },
  { brand: 'Honda', model: 'HR-V', version: '1.5L', priceNew: 786 * M },
  { brand: 'Honda', model: 'HR-V', version: '1.5RS', priceNew: 871 * M },
  { brand: 'Honda', model: 'Accord', version: '1.5 Turbo', priceNew: 1319 * M },
  { brand: 'Honda', model: 'Brio', version: 'G', priceNew: 418 * M },
  { brand: 'Honda', model: 'Brio', version: 'RS', priceNew: 452 * M },
  { brand: 'Honda', model: 'BR-V', version: 'G', priceNew: 620 * M },
  { brand: 'Honda', model: 'BR-V', version: 'L', priceNew: 680 * M },

  // ========== HYUNDAI ==========
  { brand: 'Hyundai', model: 'Grand i10', version: '1.2 MT Base', priceNew: 360 * M },
  { brand: 'Hyundai', model: 'Grand i10', version: '1.2 MT', priceNew: 400 * M },
  { brand: 'Hyundai', model: 'Grand i10', version: '1.2 AT', priceNew: 455 * M },
  { brand: 'Hyundai', model: 'Accent', version: '1.4 MT Base', priceNew: 439 * M },
  { brand: 'Hyundai', model: 'Accent', version: '1.4 MT', priceNew: 489 * M },
  { brand: 'Hyundai', model: 'Accent', version: '1.4 AT', priceNew: 529 * M },
  { brand: 'Hyundai', model: 'Accent', version: '1.4 AT Đặc biệt', priceNew: 569 * M },
  { brand: 'Hyundai', model: 'Elantra', version: '1.6 AT Tiêu chuẩn', priceNew: 599 * M },
  { brand: 'Hyundai', model: 'Elantra', version: '1.6 AT Đặc biệt', priceNew: 669 * M },
  { brand: 'Hyundai', model: 'Elantra', version: 'N-Line', priceNew: 799 * M },
  { brand: 'Hyundai', model: 'Creta', version: '1.5 Tiêu chuẩn', priceNew: 599 * M },
  { brand: 'Hyundai', model: 'Creta', version: '1.5 Đặc biệt', priceNew: 659 * M },
  { brand: 'Hyundai', model: 'Creta', version: '1.5 Cao cấp', priceNew: 720 * M },
  { brand: 'Hyundai', model: 'Tucson', version: '2.0 Xăng Tiêu chuẩn', priceNew: 825 * M },
  { brand: 'Hyundai', model: 'Tucson', version: '2.0 Xăng Đặc biệt', priceNew: 870 * M },
  { brand: 'Hyundai', model: 'Tucson', version: '1.6 Turbo', priceNew: 1030 * M },
  { brand: 'Hyundai', model: 'Santa Fe', version: '2.5 Xăng Tiêu chuẩn', priceNew: 1060 * M },
  { brand: 'Hyundai', model: 'Santa Fe', version: '2.5 Xăng Cao cấp', priceNew: 1240 * M },
  { brand: 'Hyundai', model: 'Santa Fe', version: '2.2 Dầu Cao cấp', priceNew: 1340 * M },
  { brand: 'Hyundai', model: 'Stargazer', version: '1.5 Tiêu chuẩn', priceNew: 575 * M },
  { brand: 'Hyundai', model: 'Stargazer', version: '1.5 Cao cấp', priceNew: 685 * M },
  { brand: 'Hyundai', model: 'Kona', version: '2.0 AT Tiêu chuẩn', priceNew: 634 * M },
  { brand: 'Hyundai', model: 'Kona', version: '1.6 Turbo', priceNew: 750 * M },

  // ========== KIA ==========
  { brand: 'Kia', model: 'Morning', version: 'MT', priceNew: 349 * M },
  { brand: 'Kia', model: 'Morning', version: 'AT', priceNew: 389 * M },
  { brand: 'Kia', model: 'Morning', version: 'Premium', priceNew: 419 * M },
  { brand: 'Kia', model: 'Morning', version: 'X-Line', priceNew: 449 * M },
  { brand: 'Kia', model: 'Soluto', version: 'MT', priceNew: 399 * M },
  { brand: 'Kia', model: 'Soluto', version: 'AT Luxury', priceNew: 479 * M },
  { brand: 'Kia', model: 'K3', version: '1.6 MT', priceNew: 559 * M },
  { brand: 'Kia', model: 'K3', version: '1.6 Luxury', priceNew: 619 * M },
  { brand: 'Kia', model: 'K3', version: '1.6 Premium', priceNew: 659 * M },
  { brand: 'Kia', model: 'K3', version: '1.6 Turbo GT', priceNew: 739 * M },
  { brand: 'Kia', model: 'Sonet', version: '1.5 Deluxe', priceNew: 539 * M },
  { brand: 'Kia', model: 'Sonet', version: '1.5 Premium', priceNew: 624 * M },
  { brand: 'Kia', model: 'Seltos', version: '1.4 Deluxe', priceNew: 599 * M },
  { brand: 'Kia', model: 'Seltos', version: '1.4 Luxury', priceNew: 659 * M },
  { brand: 'Kia', model: 'Seltos', version: '1.4 Premium', priceNew: 729 * M },
  { brand: 'Kia', model: 'Carens', version: '1.5G MT', priceNew: 619 * M },
  { brand: 'Kia', model: 'Carens', version: '1.4T Premium', priceNew: 759 * M },
  { brand: 'Kia', model: 'Sportage', version: '2.0G Luxury', priceNew: 899 * M },
  { brand: 'Kia', model: 'Sportage', version: '2.0G Signature', priceNew: 999 * M },
  { brand: 'Kia', model: 'Sorento', version: '2.5G Premium', priceNew: 1079 * M },
  { brand: 'Kia', model: 'Sorento', version: '2.2D Signature', priceNew: 1279 * M },
  { brand: 'Kia', model: 'Carnival', version: '2.2D Luxury', priceNew: 1199 * M },
  { brand: 'Kia', model: 'Carnival', version: '2.2D Signature', priceNew: 1429 * M },

  // ========== MAZDA ==========
  { brand: 'Mazda', model: 'Mazda2', version: '1.5 AT', priceNew: 479 * M },
  { brand: 'Mazda', model: 'Mazda2', version: '1.5 Premium', priceNew: 579 * M },
  { brand: 'Mazda', model: 'Mazda3', version: '1.5 Deluxe', priceNew: 619 * M },
  { brand: 'Mazda', model: 'Mazda3', version: '1.5 Luxury', priceNew: 669 * M },
  { brand: 'Mazda', model: 'Mazda3', version: '1.5 Premium', priceNew: 749 * M },
  { brand: 'Mazda', model: 'Mazda3', version: '2.0 Signature', priceNew: 849 * M },
  { brand: 'Mazda', model: 'Mazda6', version: '2.0 Luxury', priceNew: 889 * M },
  { brand: 'Mazda', model: 'Mazda6', version: '2.5 Signature Premium', priceNew: 1049 * M },
  { brand: 'Mazda', model: 'CX-3', version: '1.5 Deluxe', priceNew: 524 * M },
  { brand: 'Mazda', model: 'CX-3', version: '1.5 Premium', priceNew: 614 * M },
  { brand: 'Mazda', model: 'CX-30', version: '2.0 Luxury', priceNew: 699 * M },
  { brand: 'Mazda', model: 'CX-30', version: '2.0 Premium', priceNew: 849 * M },
  { brand: 'Mazda', model: 'CX-5', version: '2.0 Deluxe', priceNew: 749 * M },
  { brand: 'Mazda', model: 'CX-5', version: '2.0 Luxury', priceNew: 820 * M },
  { brand: 'Mazda', model: 'CX-5', version: '2.0 Premium', priceNew: 879 * M },
  { brand: 'Mazda', model: 'CX-5', version: '2.5 Signature', priceNew: 979 * M },
  { brand: 'Mazda', model: 'CX-8', version: '2.5 Luxury', priceNew: 999 * M },
  { brand: 'Mazda', model: 'CX-8', version: '2.5 Premium AWD', priceNew: 1149 * M },

  // ========== FORD ==========
  { brand: 'Ford', model: 'Ranger', version: 'XL 2.2 MT', priceNew: 659 * M },
  { brand: 'Ford', model: 'Ranger', version: 'XLS 2.2 AT', priceNew: 729 * M },
  { brand: 'Ford', model: 'Ranger', version: 'Wildtrak 2.0 AT', priceNew: 965 * M },
  { brand: 'Ford', model: 'Ranger', version: 'Raptor', priceNew: 1299 * M },
  { brand: 'Ford', model: 'Everest', version: 'Ambiente', priceNew: 1060 * M },
  { brand: 'Ford', model: 'Everest', version: 'Sport', priceNew: 1099 * M },
  { brand: 'Ford', model: 'Everest', version: 'Titanium 4x2', priceNew: 1260 * M },
  { brand: 'Ford', model: 'Everest', version: 'Titanium 4x4', priceNew: 1450 * M },
  { brand: 'Ford', model: 'Territory', version: 'Trend', priceNew: 822 * M },
  { brand: 'Ford', model: 'Territory', version: 'Titanium X', priceNew: 929 * M },
  { brand: 'Ford', model: 'Explorer', version: 'Limited 2.3 Ecoboost', priceNew: 2366 * M },

  // ========== MITSUBISHI ==========
  { brand: 'Mitsubishi', model: 'Attrage', version: 'MT', priceNew: 380 * M },
  { brand: 'Mitsubishi', model: 'Attrage', version: 'CVT Premium', priceNew: 485 * M },
  { brand: 'Mitsubishi', model: 'Xpander', version: 'MT', priceNew: 560 * M },
  { brand: 'Mitsubishi', model: 'Xpander', version: 'AT Premium', priceNew: 658 * M },
  { brand: 'Mitsubishi', model: 'Xpander', version: 'Cross', priceNew: 698 * M },
  { brand: 'Mitsubishi', model: 'Outlander', version: '2.0 CVT', priceNew: 825 * M },
  { brand: 'Mitsubishi', model: 'Outlander', version: '2.4 CVT Premium', priceNew: 1058 * M },
  { brand: 'Mitsubishi', model: 'Pajero Sport', version: 'Diesel 4x2 AT', priceNew: 1110 * M },
  { brand: 'Mitsubishi', model: 'Pajero Sport', version: 'Diesel 4x4 AT', priceNew: 1345 * M },
  { brand: 'Mitsubishi', model: 'Triton', version: '4x2 AT MIVEC', priceNew: 630 * M },
  { brand: 'Mitsubishi', model: 'Triton', version: '4x4 AT Athlete', priceNew: 924 * M },
  { brand: 'Mitsubishi', model: 'Xforce', version: 'GLX', priceNew: 560 * M },
  { brand: 'Mitsubishi', model: 'Xforce', version: 'Ultimate', priceNew: 705 * M },

  // ========== VINFAST ==========
  { brand: 'VinFast', model: 'Fadil', version: 'Tiêu chuẩn', priceNew: 382 * M },
  { brand: 'VinFast', model: 'Fadil', version: 'Nâng cao', priceNew: 425 * M },
  { brand: 'VinFast', model: 'Fadil', version: 'Cao cấp', priceNew: 499 * M },
  { brand: 'VinFast', model: 'Lux A2.0', version: 'Tiêu chuẩn', priceNew: 881 * M },
  { brand: 'VinFast', model: 'Lux A2.0', version: 'Nâng cao', priceNew: 999 * M },
  { brand: 'VinFast', model: 'Lux A2.0', version: 'Premium', priceNew: 1290 * M },
  { brand: 'VinFast', model: 'Lux SA2.0', version: 'Tiêu chuẩn', priceNew: 1099 * M },
  { brand: 'VinFast', model: 'Lux SA2.0', version: 'Nâng cao', priceNew: 1199 * M },
  { brand: 'VinFast', model: 'Lux SA2.0', version: 'Premium', priceNew: 1530 * M },
  { brand: 'VinFast', model: 'VF 5', version: 'Plus', priceNew: 468 * M },
  { brand: 'VinFast', model: 'VF e34', version: 'Standard', priceNew: 690 * M },
  { brand: 'VinFast', model: 'VF 6', version: 'Eco', priceNew: 675 * M },
  { brand: 'VinFast', model: 'VF 6', version: 'Plus', priceNew: 765 * M },
  { brand: 'VinFast', model: 'VF 7', version: 'Eco', priceNew: 850 * M },
  { brand: 'VinFast', model: 'VF 7', version: 'Plus', priceNew: 999 * M },
  { brand: 'VinFast', model: 'VF 8', version: 'Eco', priceNew: 1057 * M },
  { brand: 'VinFast', model: 'VF 8', version: 'Plus', priceNew: 1199 * M },
  { brand: 'VinFast', model: 'VF 9', version: 'Eco', priceNew: 1499 * M },
  { brand: 'VinFast', model: 'VF 9', version: 'Plus', priceNew: 1699 * M },
  { brand: 'VinFast', model: 'VF 3', version: 'Eco', priceNew: 315 * M },

  // ========== SUZUKI ==========
  { brand: 'Suzuki', model: 'Swift', version: 'GLX', priceNew: 550 * M },
  { brand: 'Suzuki', model: 'Ertiga', version: 'MT', priceNew: 480 * M },
  { brand: 'Suzuki', model: 'Ertiga', version: 'AT', priceNew: 530 * M },
  { brand: 'Suzuki', model: 'Ertiga', version: 'Hybrid', priceNew: 579 * M },
  { brand: 'Suzuki', model: 'XL7', version: 'GLX', priceNew: 590 * M },
  { brand: 'Suzuki', model: 'Jimny', version: 'GLX', priceNew: 789 * M },
  { brand: 'Suzuki', model: 'Celerio', version: '1.0 CVT', priceNew: 360 * M },
  { brand: 'Suzuki', model: 'Grand Vitara', version: '2.0 AT', priceNew: 799 * M },

  // ========== NISSAN ==========
  { brand: 'Nissan', model: 'Almera', version: 'CVT', priceNew: 519 * M },
  { brand: 'Nissan', model: 'Almera', version: 'CVT Cao cấp', priceNew: 579 * M },
  { brand: 'Nissan', model: 'Navara', version: 'EL 2WD', priceNew: 640 * M },
  { brand: 'Nissan', model: 'Navara', version: 'VL 4WD', priceNew: 805 * M },
  { brand: 'Nissan', model: 'Navara', version: 'PRO-4X', priceNew: 849 * M },
  { brand: 'Nissan', model: 'Kicks', version: 'V', priceNew: 700 * M },
  { brand: 'Nissan', model: 'Terra', version: 'V', priceNew: 1050 * M },
  { brand: 'Nissan', model: 'X-Trail', version: '2.0 SL', priceNew: 1010 * M },

  // ========== PEUGEOT ==========
  { brand: 'Peugeot', model: '2008', version: 'Active', priceNew: 749 * M },
  { brand: 'Peugeot', model: '2008', version: 'GT-Line', priceNew: 829 * M },
  { brand: 'Peugeot', model: '3008', version: 'Active', priceNew: 979 * M },
  { brand: 'Peugeot', model: '3008', version: 'Allure', priceNew: 1069 * M },
  { brand: 'Peugeot', model: '3008', version: 'GT', priceNew: 1199 * M },
  { brand: 'Peugeot', model: '5008', version: 'Allure', priceNew: 1199 * M },
  { brand: 'Peugeot', model: '5008', version: 'GT', priceNew: 1349 * M },

  // ========== SUBARU ==========
  { brand: 'Subaru', model: 'Forester', version: 'i-L', priceNew: 969 * M },
  { brand: 'Subaru', model: 'Forester', version: 'i-S EyeSight', priceNew: 1199 * M },
  { brand: 'Subaru', model: 'Outback', version: '2.5 i-T EyeSight', priceNew: 1969 * M },
  { brand: 'Subaru', model: 'WRX', version: '2.4 CVT EyeSight', priceNew: 2199 * M },

  // ========== MERCEDES-BENZ ==========
  { brand: 'Mercedes-Benz', model: 'C-Class', version: 'C200', priceNew: 1539 * M },
  { brand: 'Mercedes-Benz', model: 'C-Class', version: 'C200 Plus', priceNew: 1639 * M },
  { brand: 'Mercedes-Benz', model: 'C-Class', version: 'C300 AMG', priceNew: 2099 * M },
  { brand: 'Mercedes-Benz', model: 'E-Class', version: 'E180', priceNew: 2099 * M },
  { brand: 'Mercedes-Benz', model: 'E-Class', version: 'E200 Exclusive', priceNew: 2379 * M },
  { brand: 'Mercedes-Benz', model: 'E-Class', version: 'E300 AMG', priceNew: 3069 * M },
  { brand: 'Mercedes-Benz', model: 'GLC', version: 'GLC 200', priceNew: 1926 * M },
  { brand: 'Mercedes-Benz', model: 'GLC', version: 'GLC 200 4MATIC', priceNew: 2099 * M },
  { brand: 'Mercedes-Benz', model: 'GLC', version: 'GLC 300 4MATIC', priceNew: 2569 * M },

  // ========== BMW ==========
  { brand: 'BMW', model: '3 Series', version: '320i Sport Line', priceNew: 1539 * M },
  { brand: 'BMW', model: '3 Series', version: '320i M Sport', priceNew: 1669 * M },
  { brand: 'BMW', model: '3 Series', version: '330i M Sport', priceNew: 2069 * M },
  { brand: 'BMW', model: '5 Series', version: '520i', priceNew: 2499 * M },
  { brand: 'BMW', model: '5 Series', version: '530i M Sport', priceNew: 3199 * M },
  { brand: 'BMW', model: 'X3', version: 'xDrive20i', priceNew: 1899 * M },
  { brand: 'BMW', model: 'X3', version: 'xDrive30i M Sport', priceNew: 2499 * M },
  { brand: 'BMW', model: 'X5', version: 'xDrive40i xLine', priceNew: 3999 * M },
  { brand: 'BMW', model: 'X5', version: 'xDrive40i M Sport', priceNew: 4199 * M },
  { brand: 'BMW', model: 'X7', version: 'xDrive40i Pure Excellence', priceNew: 5799 * M },

  // ========== AUDI ==========
  { brand: 'Audi', model: 'A4', version: '40 TFSI', priceNew: 1699 * M },
  { brand: 'Audi', model: 'A6', version: '45 TFSI', priceNew: 2399 * M },
  { brand: 'Audi', model: 'Q5', version: '45 TFSI', priceNew: 2399 * M },
  { brand: 'Audi', model: 'Q7', version: '45 TFSI', priceNew: 3799 * M },
  { brand: 'Audi', model: 'Q8', version: 'S line', priceNew: 4399 * M },

  // ========== LEXUS ==========
  { brand: 'Lexus', model: 'RX 350', version: 'Premium', priceNew: 3750 * M },
  { brand: 'Lexus', model: 'RX 350', version: 'F SPORT', priceNew: 4380 * M },
  { brand: 'Lexus', model: 'NX 300', version: 'Base', priceNew: 2560 * M },
  { brand: 'Lexus', model: 'ES 250', version: 'Base', priceNew: 2540 * M },
  { brand: 'Lexus', model: 'LX 600', version: 'VIP', priceNew: 9199 * M },

  // ========== PORSCHE ==========
  { brand: 'Porsche', model: 'Macan', version: 'Base', priceNew: 2890 * M },
  { brand: 'Porsche', model: 'Macan', version: 'S', priceNew: 3720 * M },
  { brand: 'Porsche', model: 'Macan', version: 'GTS', priceNew: 4470 * M },
  { brand: 'Porsche', model: 'Cayenne', version: 'Base', priceNew: 4950 * M },
  { brand: 'Porsche', model: 'Cayenne', version: 'S', priceNew: 6050 * M },
  { brand: 'Porsche', model: 'Cayenne', version: 'Coupe', priceNew: 5630 * M },
  { brand: 'Porsche', model: 'Panamera', version: 'Base', priceNew: 4950 * M },
  { brand: 'Porsche', model: 'Panamera', version: '4S', priceNew: 7690 * M },
  { brand: 'Porsche', model: 'Taycan', version: '4S', priceNew: 4720 * M },
  { brand: 'Porsche', model: 'Taycan', version: 'Turbo', priceNew: 7300 * M },

  // ========== MG ==========
  { brand: 'MG', model: 'ZS', version: 'STD', priceNew: 518 * M },
  { brand: 'MG', model: 'ZS', version: 'LUX', priceNew: 618 * M },
  { brand: 'MG', model: 'HS', version: '1.5T 2WD Sport', priceNew: 699 * M },
  { brand: 'MG', model: 'HS', version: '2.0T AWD Trophy', priceNew: 899 * M },

  // ========== VOLKSWAGEN ==========
  { brand: 'Volkswagen', model: 'Tiguan', version: 'Elegance', priceNew: 1699 * M },
  { brand: 'Volkswagen', model: 'Tiguan', version: 'Luxury', priceNew: 1899 * M },
  { brand: 'Volkswagen', model: 'Teramont', version: 'X', priceNew: 2349 * M },
  { brand: 'Volkswagen', model: 'Touareg', version: 'Luxury', priceNew: 3099 * M },
];

async function seedCarPriceList() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/car_valuation';
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');

    // Xóa dữ liệu cũ
    await CarPriceList.deleteMany({});
    console.log('🗑️  Cleared old CarPriceList data');

    // Thêm source và yearApplicable
    const dataWithMeta = PRICE_DATA.map(item => ({
      ...item,
      source: 'official',
      yearApplicable: 2025,
    }));

    // Insert all
    const result = await CarPriceList.insertMany(dataWithMeta);
    console.log(`🚀 Inserted ${result.length} car price records`);

    // Summary
    const brands = [...new Set(PRICE_DATA.map(d => d.brand))];
    console.log(`📊 Brands covered: ${brands.length}`);
    brands.forEach(b => {
      const count = PRICE_DATA.filter(d => d.brand === b).length;
      console.log(`   ${b}: ${count} versions`);
    });

    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seedCarPriceList();
