// backend/crawl/seedData.js
// Chạy: node crawl/seedData.js
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const MarketCar = require('../models/MarketCar');

const data = [
  // ===== TOYOTA =====
  { brand:'Toyota', model:'Camry',   version:'2.0G', versionClass: 'other', year:2020, mileage:45000, price:870000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'Toyota', model:'Camry',   version:'2.0G', versionClass: 'other', year:2020, mileage:62000, price:840000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Toyota', model:'Camry',   version:'2.5Q', versionClass: 'premium', year:2020, mileage:30000, price:1050000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Toyota', model:'Camry',   version:'2.0G', versionClass: 'other', year:2019, mileage:78000, price:760000000, fuel:'gasoline', transmission:'AT', location:'Đà Nẵng' },
  { brand:'Toyota', model:'Camry',   version:'2.5Q', versionClass: 'premium', year:2022, mileage:18000, price:1150000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'Toyota', model:'Fortuner',version:'2.4G AT', versionClass: 'other', year:2020, mileage:55000, price:920000000, fuel:'diesel',   transmission:'AT', location:'HCM' },
  { brand:'Toyota', model:'Fortuner',version:'2.4G AT', versionClass: 'other', year:2020, mileage:48000, price:950000000, fuel:'diesel',   transmission:'AT', location:'Hà Nội' },
  { brand:'Toyota', model:'Fortuner',version:'Legender', versionClass: 'premium', year:2021, mileage:35000, price:1120000000, fuel:'diesel',  transmission:'AT', location:'HCM' },
  { brand:'Toyota', model:'Fortuner',version:'2.4G MT', versionClass: 'standard', year:2019, mileage:80000, price:820000000, fuel:'diesel',   transmission:'MT', location:'Bình Dương' },
  { brand:'Toyota', model:'Fortuner',version:'Legender', versionClass: 'premium', year:2022, mileage:20000, price:1200000000, fuel:'diesel',  transmission:'AT', location:'Hà Nội' },
  { brand:'Toyota', model:'Corolla Altis', year:2020, mileage:40000, price:620000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Toyota', model:'Corolla Altis', year:2019, mileage:65000, price:560000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'Toyota', model:'Corolla Altis', year:2021, mileage:25000, price:680000000, fuel:'gasoline', transmission:'AT', location:'Đà Nẵng' },
  { brand:'Toyota', model:'Vios',    year:2020, mileage:42000, price:430000000, fuel:'gasoline', transmission:'CVT', location:'HCM' },
  { brand:'Toyota', model:'Vios',    year:2020, mileage:55000, price:410000000, fuel:'gasoline', transmission:'CVT', location:'Hà Nội' },
  { brand:'Toyota', model:'Vios',    year:2021, mileage:28000, price:480000000, fuel:'gasoline', transmission:'CVT', location:'HCM' },
  { brand:'Toyota', model:'Vios',    year:2019, mileage:70000, price:370000000, fuel:'gasoline', transmission:'MT',  location:'Cần Thơ' },
  { brand:'Toyota', model:'Vios',    year:2022, mileage:15000, price:530000000, fuel:'gasoline', transmission:'CVT', location:'Hà Nội' },
  { brand:'Toyota', model:'Rush',    year:2020, mileage:45000, price:560000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Toyota', model:'Rush',    year:2019, mileage:68000, price:490000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'Toyota', model:'Rush',    year:2021, mileage:32000, price:620000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Toyota', model:'Innova',  year:2020, mileage:50000, price:680000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Toyota', model:'Innova',  year:2019, mileage:75000, price:600000000, fuel:'gasoline', transmission:'MT', location:'Hà Nội' },
  { brand:'Toyota', model:'Innova',  year:2021, mileage:30000, price:750000000, fuel:'gasoline', transmission:'AT', location:'Đà Nẵng' },
  { brand:'Toyota', model:'Raize',   year:2022, mileage:22000, price:490000000, fuel:'gasoline', transmission:'CVT', location:'HCM' },
  { brand:'Toyota', model:'Raize',   year:2021, mileage:40000, price:450000000, fuel:'gasoline', transmission:'CVT', location:'Hà Nội' },
  // ===== HONDA =====
  { brand:'Honda', model:'Civic',    year:2020, mileage:38000, price:680000000, fuel:'gasoline', transmission:'CVT', location:'HCM' },
  { brand:'Honda', model:'Civic',    year:2020, mileage:55000, price:650000000, fuel:'gasoline', transmission:'CVT', location:'Hà Nội' },
  { brand:'Honda', model:'Civic',    year:2021, mileage:25000, price:750000000, fuel:'gasoline', transmission:'CVT', location:'HCM' },
  { brand:'Honda', model:'Civic',    year:2019, mileage:72000, price:580000000, fuel:'gasoline', transmission:'CVT', location:'Bình Dương' },
  { brand:'Honda', model:'City',     year:2020, mileage:40000, price:450000000, fuel:'gasoline', transmission:'CVT', location:'HCM' },
  { brand:'Honda', model:'City',     year:2021, mileage:25000, price:510000000, fuel:'gasoline', transmission:'CVT', location:'Hà Nội' },
  { brand:'Honda', model:'City',     year:2019, mileage:65000, price:390000000, fuel:'gasoline', transmission:'CVT', location:'Cần Thơ' },
  { brand:'Honda', model:'City',     year:2022, mileage:12000, price:560000000, fuel:'gasoline', transmission:'CVT', location:'HCM' },
  { brand:'Honda', model:'CR-V',     year:2020, mileage:45000, price:820000000, fuel:'gasoline', transmission:'CVT', location:'HCM' },
  { brand:'Honda', model:'CR-V',     year:2021, mileage:30000, price:920000000, fuel:'gasoline', transmission:'CVT', location:'Hà Nội' },
  { brand:'Honda', model:'CR-V',     year:2019, mileage:68000, price:730000000, fuel:'gasoline', transmission:'CVT', location:'Đà Nẵng' },
  { brand:'Honda', model:'HR-V',     year:2021, mileage:28000, price:650000000, fuel:'gasoline', transmission:'CVT', location:'HCM' },
  { brand:'Honda', model:'HR-V',     year:2020, mileage:42000, price:590000000, fuel:'gasoline', transmission:'CVT', location:'Hà Nội' },
  { brand:'Honda', model:'Accord',   year:2020, mileage:40000, price:950000000, fuel:'gasoline', transmission:'CVT', location:'HCM' },
  { brand:'Honda', model:'Accord',   year:2021, mileage:22000, price:1050000000, fuel:'gasoline',transmission:'CVT', location:'Hà Nội' },
  // ===== KIA =====
  { brand:'Kia', model:'K3',         year:2020, mileage:38000, price:490000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Kia', model:'K3',         year:2021, mileage:22000, price:550000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'Kia', model:'K3',         year:2019, mileage:62000, price:430000000, fuel:'gasoline', transmission:'AT', location:'Đà Nẵng' },
  { brand:'Kia', model:'Seltos',     year:2020, mileage:35000, price:590000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Kia', model:'Seltos',     year:2021, mileage:20000, price:660000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'Kia', model:'Sorento',    year:2021, mileage:30000, price:920000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Kia', model:'Sorento',    year:2020, mileage:48000, price:840000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'Kia', model:'Carnival',   year:2022, mileage:18000, price:1050000000, fuel:'gasoline',transmission:'AT', location:'HCM' },
  { brand:'Kia', model:'Carnival',   year:2021, mileage:32000, price:960000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'Kia', model:'Morning',    year:2020, mileage:35000, price:290000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Kia', model:'Morning',    year:2019, mileage:55000, price:255000000, fuel:'gasoline', transmission:'MT', location:'Cần Thơ' },
  // ===== HYUNDAI =====
  { brand:'Hyundai', model:'Accent', year:2020, mileage:40000, price:420000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Hyundai', model:'Accent', year:2021, mileage:25000, price:480000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'Hyundai', model:'Accent', year:2019, mileage:65000, price:365000000, fuel:'gasoline', transmission:'AT', location:'Đà Nẵng' },
  { brand:'Hyundai', model:'Elantra',year:2020, mileage:38000, price:530000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Hyundai', model:'Elantra',year:2021, mileage:22000, price:600000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'Hyundai', model:'Tucson', year:2020, mileage:42000, price:720000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Hyundai', model:'Tucson', year:2021, mileage:28000, price:800000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'Hyundai', model:'Santa Fe',year:2020, mileage:45000, price:870000000, fuel:'diesel',  transmission:'AT', location:'HCM' },
  { brand:'Hyundai', model:'Santa Fe',year:2021, mileage:30000, price:960000000, fuel:'diesel',  transmission:'AT', location:'Hà Nội' },
  { brand:'Hyundai', model:'i10',    year:2020, mileage:30000, price:310000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Hyundai', model:'i10',    year:2021, mileage:18000, price:355000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  // ===== MAZDA =====
  { brand:'Mazda', model:'Mazda3',   year:2020, mileage:38000, price:590000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Mazda', model:'Mazda3',   year:2021, mileage:22000, price:660000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'Mazda', model:'Mazda3',   year:2019, mileage:62000, price:520000000, fuel:'gasoline', transmission:'AT', location:'Đà Nẵng' },
  { brand:'Mazda', model:'CX-5',     year:2020, mileage:42000, price:750000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Mazda', model:'CX-5',     year:2021, mileage:28000, price:840000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'Mazda', model:'CX-5',     year:2019, mileage:68000, price:670000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Mazda', model:'CX-8',     year:2020, mileage:40000, price:920000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Mazda', model:'CX-8',     year:2021, mileage:25000, price:1020000000, fuel:'gasoline',transmission:'AT', location:'Hà Nội' },
  { brand:'Mazda', model:'Mazda2',   year:2020, mileage:35000, price:390000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Mazda', model:'Mazda6',   year:2020, mileage:40000, price:720000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  // ===== MITSUBISHI =====
  { brand:'Mitsubishi', model:'Xpander',      year:2020, mileage:40000, price:520000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Mitsubishi', model:'Xpander',      year:2021, mileage:25000, price:590000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'Mitsubishi', model:'Xpander Cross',year:2021, mileage:28000, price:630000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Mitsubishi', model:'Xpander Cross',year:2020, mileage:42000, price:570000000, fuel:'gasoline', transmission:'AT', location:'Đà Nẵng' },
  { brand:'Mitsubishi', model:'Outlander',    year:2020, mileage:45000, price:720000000, fuel:'gasoline', transmission:'CVT', location:'HCM' },
  { brand:'Mitsubishi', model:'Outlander',    year:2021, mileage:28000, price:810000000, fuel:'gasoline', transmission:'CVT', location:'Hà Nội' },
  { brand:'Mitsubishi', model:'Pajero Sport', year:2020, mileage:48000, price:840000000, fuel:'diesel',   transmission:'AT', location:'HCM' },
  { brand:'Mitsubishi', model:'Pajero Sport', year:2021, mileage:32000, price:920000000, fuel:'diesel',   transmission:'AT', location:'Hà Nội' },
  { brand:'Mitsubishi', model:'Attrage',      year:2020, mileage:35000, price:330000000, fuel:'gasoline', transmission:'CVT', location:'HCM' },
  // ===== FORD =====
  { brand:'Ford', model:'Ranger',    year:2020, mileage:50000, price:680000000, fuel:'diesel', transmission:'AT', location:'HCM' },
  { brand:'Ford', model:'Ranger',    year:2021, mileage:32000, price:760000000, fuel:'diesel', transmission:'AT', location:'Hà Nội' },
  { brand:'Ford', model:'Ranger',    year:2019, mileage:75000, price:590000000, fuel:'diesel', transmission:'AT', location:'Bình Dương' },
  { brand:'Ford', model:'Everest',   year:2020, mileage:45000, price:920000000, fuel:'diesel', transmission:'AT', location:'HCM' },
  { brand:'Ford', model:'Everest',   year:2021, mileage:28000, price:1020000000, fuel:'diesel',transmission:'AT', location:'Hà Nội' },
  { brand:'Ford', model:'Territory', year:2021, mileage:25000, price:680000000, fuel:'gasoline',transmission:'CVT', location:'HCM' },
  { brand:'Ford', model:'Territory', year:2022, mileage:12000, price:750000000, fuel:'gasoline',transmission:'CVT', location:'Hà Nội' },
  { brand:'Ford', model:'EcoSport',  year:2020, mileage:40000, price:470000000, fuel:'gasoline',transmission:'AT', location:'HCM' },
  // ===== VINFAST =====
  { brand:'VinFast', model:'VF 8',   year:2023, mileage:15000, price:870000000, fuel:'electric', transmission:'AT', location:'HCM' },
  { brand:'VinFast', model:'VF 8',   year:2022, mileage:28000, price:790000000, fuel:'electric', transmission:'AT', location:'Hà Nội' },
  { brand:'VinFast', model:'VF 9',   year:2023, mileage:12000, price:1200000000, fuel:'electric',transmission:'AT', location:'HCM' },
  { brand:'VinFast', model:'VF 6',   year:2023, mileage:10000, price:575000000, fuel:'electric', transmission:'AT', location:'HCM' },
  { brand:'VinFast', model:'VF 5',   year:2023, mileage:12000, price:398000000, fuel:'electric', transmission:'AT', location:'Hà Nội' },
  { brand:'VinFast', model:'Fadil',  year:2020, mileage:35000, price:320000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'VinFast', model:'Fadil',  year:2021, mileage:22000, price:370000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'VinFast', model:'Lux A2.0',year:2020,mileage:40000, price:650000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  // ===== MERCEDES-BENZ =====
  { brand:'Mercedes-Benz', model:'C-Class', year:2020, mileage:35000, price:1350000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Mercedes-Benz', model:'C-Class', year:2021, mileage:22000, price:1550000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'Mercedes-Benz', model:'E-Class', year:2020, mileage:38000, price:1850000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Mercedes-Benz', model:'E-Class', year:2021, mileage:25000, price:2100000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'Mercedes-Benz', model:'GLC',     year:2020, mileage:40000, price:1750000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Mercedes-Benz', model:'GLC',     year:2021, mileage:25000, price:1950000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  // ===== BMW =====
  { brand:'BMW', model:'3 Series', year:2020, mileage:35000, price:1450000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'BMW', model:'3 Series', year:2021, mileage:22000, price:1650000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'BMW', model:'5 Series', year:2020, mileage:38000, price:1950000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'BMW', model:'X3',       year:2020, mileage:40000, price:1750000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'BMW', model:'X5',       year:2020, mileage:42000, price:2850000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  // ===== NISSAN =====
  { brand:'Nissan', model:'Almera',  year:2021, mileage:25000, price:430000000, fuel:'gasoline', transmission:'CVT', location:'HCM' },
  { brand:'Nissan', model:'Almera',  year:2022, mileage:12000, price:490000000, fuel:'gasoline', transmission:'CVT', location:'Hà Nội' },
  { brand:'Nissan', model:'Terra',   year:2020, mileage:48000, price:720000000, fuel:'diesel',   transmission:'AT', location:'HCM' },
  { brand:'Nissan', model:'X-Trail', year:2020, mileage:42000, price:780000000, fuel:'gasoline', transmission:'CVT', location:'HCM' },
  // ===== SUZUKI =====
  { brand:'Suzuki', model:'XL7',    year:2020, mileage:38000, price:490000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Suzuki', model:'XL7',    year:2021, mileage:22000, price:550000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'Suzuki', model:'Ertiga', year:2020, mileage:40000, price:420000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'Suzuki', model:'Swift',  year:2020, mileage:32000, price:440000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  // ===== MG =====
  { brand:'MG', model:'ZS',  year:2021, mileage:25000, price:480000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
  { brand:'MG', model:'ZS',  year:2022, mileage:12000, price:540000000, fuel:'gasoline', transmission:'AT', location:'Hà Nội' },
  { brand:'MG', model:'HS',  year:2021, mileage:28000, price:650000000, fuel:'gasoline', transmission:'AT', location:'HCM' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/car_valuation');
    console.log('✅ Đã kết nối MongoDB');

    // Xóa dữ liệu cũ (nếu muốn chạy lại)
    await MarketCar.deleteMany({});
    console.log('🗑️  Đã xóa dữ liệu cũ');

    // Default missing fields for rest of the data
    const populatedData = data.map(car => ({
      ...car,
      version: car.version || '',
      versionClass: car.versionClass || 'other'
    }));

    await MarketCar.insertMany(populatedData);
    console.log(`🚗 Đã seed ${populatedData.length} xe vào collection MarketCar`);

    const brands = [...new Set(data.map(d => d.brand))];
    console.log(`📊 Hãng xe: ${brands.join(', ')}`);

  } catch (err) {
    console.error('❌ Lỗi seed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB');
  }
}

seed();
