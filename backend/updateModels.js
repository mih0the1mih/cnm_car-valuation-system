const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/car_valuation');
  const Car = mongoose.model('MarketCar', new mongoose.Schema({}, {strict:false}));
  const cars = await Car.find();
  
  const dbTree = {};
  cars.forEach(c => {
    if(!c.brand || !c.model) return;
    const b = c.brand.trim();
    const m = c.model.trim();
    const v = (c.version || '').trim();
    
    if(!dbTree[b]) dbTree[b] = {};
    if(!dbTree[b][m]) dbTree[b][m] = new Set();
    if(v) dbTree[b][m].add(v);
  });

  for(const b in dbTree) {
    for(const m in dbTree[b]) {
      dbTree[b][m] = Array.from(dbTree[b][m]);
    }
  }
  
  const baseModels = {
    Toyota: {
      'Vios': ['1.5E MT', '1.5E CVT', '1.5G CVT', 'GR-S'],
      'Camry': ['2.0G', '2.0E', '2.0Q', '2.5Q', '2.5HV'],
      'Corolla Altis': ['1.8G', '1.8V', '1.8HEV'],
      'Corolla Cross': ['1.8G', '1.8V', '1.8HV'],
      'Fortuner': ['2.4G MT', '2.4G AT', '2.7V', '2.8V', 'Legender'],
      'Innova': ['2.0E', '2.0G', '2.0V', 'Venture', 'Cross'],
      'Yaris': ['1.5G', '1.5E'],
      'Raize': ['1.0 Turbo'],
      'Veloz Cross': ['CVT', 'Top'],
      'Avanza Premio': ['MT', 'CVT'],
      'Land Cruiser': ['LC300', 'Prado VX']
    },
    Honda: {
      'City': ['1.5G', '1.5L', '1.5RS'],
      'Civic': ['1.5E', '1.5G', '1.5RS'],
      'CR-V': ['1.5E', '1.5G', '1.5L', 'AWD', 'Hybrid'],
      'HR-V': ['1.5G', '1.5L', '1.5RS'],
      'Accord': ['1.5 Turbo'],
      'Brio': ['G', 'RS'],
      'BR-V': ['G', 'L']
    },
    Mazda: {
      'Mazda2': ['1.5 AT', '1.5 Luxury', '1.5 Premium'],
      'Mazda3': ['1.5 Deluxe', '1.5 Luxury', '1.5 Premium', '2.0 Signature'],
      'Mazda6': ['2.0 Luxury', '2.0 Premium', '2.5 Signature Premium'],
      'CX-3': ['1.5 Deluxe', '1.5 Luxury', '1.5 Premium'],
      'CX-30': ['2.0 Luxury', '2.0 Premium'],
      'CX-5': ['2.0 Deluxe', '2.0 Luxury', '2.0 Premium', '2.5 Signature'],
      'CX-8': ['2.5 Luxury', '2.5 Premium', '2.5 Premium AWD']
    },
    Ford: {
      'Ranger': ['XL 2.2 MT', 'XLS 2.2 MT', 'XLS 2.2 AT', 'XLT 2.2 AT', 'Wildtrak 2.0 AT', 'Raptor'],
      'Everest': ['Ambiente', 'Sport', 'Titanium 4x2', 'Titanium 4x4', 'Wildtrak'],
      'Territory': ['Trend', 'Titanium', 'Titanium X'],
      'Explorer': ['Limited 2.3 Ecoboost'],
      'EcoSport': ['1.5 Ambiente', '1.5 Trend', '1.5 Titanium', '1.0 Ecoboost']
    },
    Hyundai: {
      'Grand i10': ['1.2 MT Base', '1.2 MT', '1.2 AT'],
      'Accent': ['1.4 MT Base', '1.4 MT', '1.4 AT', '1.4 AT Đặc biệt'],
      'Elantra': ['1.6 AT Tiêu chuẩn', '1.6 AT Đặc biệt', '2.0 AT', 'N-Line'],
      'Creta': ['1.5 Tiêu chuẩn', '1.5 Đặc biệt', '1.5 Cao cấp'],
      'Tucson': ['2.0 Xăng Tiêu chuẩn', '2.0 Xăng Đặc biệt', '2.0 Dầu Đặc biệt', '1.6 Turbo'],
      'Santa Fe': ['2.5 Xăng Tiêu chuẩn', '2.5 Xăng Cao cấp', '2.2 Dầu Tiêu chuẩn', '2.2 Dầu Cao cấp', 'Hybrid'],
      'Stargazer': ['1.5 Tiêu chuẩn', '1.5 Đặc biệt', '1.5 Cao cấp', 'X'],
      'Kona': ['2.0 AT Tiêu chuẩn', '2.0 AT Đặc biệt', '1.6 Turbo']
    },
    Kia: {
      'Morning': ['MT', 'AT', 'Premium', 'GT-Line', 'X-Line'],
      'Soluto': ['MT', 'MT Deluxe', 'AT Deluxe', 'AT Luxury'],
      'K3': ['1.6 MT', '1.6 Luxury', '1.6 Premium', '2.0 Premium', '1.6 Turbo GT'],
      'Sonet': ['1.5 MT', '1.5 Deluxe', '1.5 Luxury', '1.5 Premium'],
      'Seltos': ['1.4 Deluxe', '1.4 Luxury', '1.4 Premium', '1.6 Premium'],
      'Carens': ['1.5G MT', '1.5G IVT', '1.5G Luxury', '1.4T Premium', '1.5D Signature'],
      'Sportage': ['2.0G Luxury', '2.0G Premium', '2.0G Signature', '1.6T Signature AWD', '2.0D Signature'],
      'Sorento': ['2.2D Luxury', '2.2D Premium', '2.2D Signature', '2.5G Premium', '2.5G Signature', 'HEV', 'PHEV'],
      'Carnival': ['2.2D Luxury', '2.2D Premium', '2.2D Signature', '3.5G Signature']
    },
    Mitsubishi: {
      'Attrage': ['MT', 'CVT', 'CVT Premium'],
      'Xpander': ['MT', 'AT', 'AT Premium', 'Cross'],
      'Outlander': ['2.0 CVT', '2.0 CVT Premium', '2.4 CVT Premium'],
      'Pajero Sport': ['Diesel 4x2 AT', 'Diesel 4x4 AT'],
      'Triton': ['4x2 MT', '4x2 AT MIVEC', '4x4 MT MIVEC', '4x2 AT Athlete', '4x4 AT Athlete']
    },
    VinFast: {
      'Fadil': ['Tiêu chuẩn', 'Nâng cao', 'Cao cấp'],
      'Lux A2.0': ['Tiêu chuẩn', 'Nâng cao', 'Cao cấp'],
      'Lux SA2.0': ['Tiêu chuẩn', 'Nâng cao', 'Cao cấp'],
      'VF 5': ['Plus'],
      'VF e34': [],
      'VF 6': ['Eco', 'Plus'],
      'VF 7': ['Eco', 'Plus'],
      'VF 8': ['Eco', 'Plus'],
      'VF 9': ['Eco', 'Plus']
    },
    Suzuki: {
      'Swift': ['GLX'],
      'Ertiga': ['MT', 'AT', 'Hybrid'],
      'XL7': ['GLX', 'Sport Limited'],
      'Ciaz': [],
      'Blind Van': []
    },
    Nissan: {
      'Almera': ['MT', 'CVT', 'CVT Cao cấp'],
      'Navara': ['EL 2WD', 'VL 4WD', 'PRO-4X'],
      'Kicks': ['E', 'V']
    },
    Peugeot: {
      '2008': ['Active', 'GT-Line'],
      '3008': ['Active', 'Allure', 'GT'],
      '5008': ['Allure', 'GT']
    },
    Subaru: {
      'Forester': ['i-L', 'i-L EyeSight', 'i-S EyeSight'],
      'Outback': ['2.5 i-T EyeSight'],
      'BRZ': ['2.4 AT EyeSight'],
      'WRX': ['2.4 MT', '2.4 CVT EyeSight']
    }
  };

  for(const brand in dbTree) {
    if(!baseModels[brand]) baseModels[brand] = {};
    for(const model in dbTree[brand]) {
      if(!baseModels[brand][model]) baseModels[brand][model] = [];
      const existingVersions = new Set(baseModels[brand][model]);
      dbTree[brand][model].forEach(v => {
        if(v && !existingVersions.has(v)) {
           baseModels[brand][model].push(v);
        }
      });
    }
  }

  const outputStr = 'export const carModels = ' + JSON.stringify(baseModels, null, 2) + ';';
  
  const targetFile = 'd:\\desktop\\HK2_2025_2026\\CNM\\car-valuation-system\\frontend\\src\\utils\\valuationHelpers.js';
  let content = fs.readFileSync(targetFile, 'utf8');
  
  // Replace the exact export const carModels block
  const startIdx = content.indexOf('export const carModels = {');
  
  // Find the end of the object. It ends before export const carDepreciationTable
  const nextExport = content.indexOf('export const carDepreciationTable =');
  
  if(startIdx !== -1 && nextExport !== -1) {
    const before = content.substring(0, startIdx);
    const after = content.substring(nextExport);
    fs.writeFileSync(targetFile, before + outputStr + '\n\n' + after);
    console.log('Successfully updated carModels in valuationHelpers.js');
  } else {
    console.log('Could not find the start or end of carModels object.');
  }

  process.exit(0);
}
run();
