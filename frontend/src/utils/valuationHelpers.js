export const formatPrice = (millions) => {
  if (!millions) return '0 triệu';
  if (millions >= 1000) {
    const ty = Math.floor(millions / 1000);
    const trieu = millions % 1000;
    if (trieu === 0) return `${ty} tỷ`;
    // Thêm số 0 ở đầu nếu triệu < 100, vd: 1 tỷ 072 triệu thay vì 1 tỷ 72 triệu.
    const trieuStr = trieu < 10 ? `00${trieu}` : trieu < 100 ? `0${trieu}` : trieu;
    return `${ty} tỷ ${trieuStr} triệu`;
  }
  return `${millions} triệu`;
};

export const formatPriceShortVND = (price) => {
  if (!price) return 'Thỏa thuận';
  if (price >= 1000000000) {
    const ty = price / 1000000000;
    return `${Number.isInteger(ty) ? ty : ty.toLocaleString('vi-VN')} Tỷ`;
  } else {
    return `${(price / 1000000).toLocaleString('vi-VN')} Tr`;
  }
};

export const carModels = {
  "Toyota": {
    "Vios": [
      "1.5E MT",
      "1.5E CVT",
      "1.5G CVT",
      "GR-S",
      "E"
    ],
    "Camry": [
      "2.0G",
      "2.0E",
      "2.0Q",
      "2.5Q",
      "2.5HV"
    ],
    "Corolla Altis": [
      "1.8G",
      "1.8V",
      "1.8HEV"
    ],
    "Corolla Cross": [
      "1.8G",
      "1.8V",
      "1.8HV"
    ],
    "Fortuner": [
      "2.4G MT",
      "2.4G AT",
      "2.7V",
      "2.8V",
      "Legender"
    ],
    "Innova": [
      "2.0E",
      "2.0G",
      "2.0V",
      "Venture",
      "Cross"
    ],
    "Yaris": [
      "1.5G",
      "1.5E"
    ],
    "Raize": [
      "1.0 Turbo"
    ],
    "Veloz Cross": [
      "CVT",
      "Top"
    ],
    "Avanza Premio": [
      "MT",
      "CVT"
    ],
    "Land Cruiser": [
      "LC300",
      "Prado VX"
    ],
    "Rush": [
      "S"
    ],
    "Yaris Cross": [
      "Cross"
    ],
    "Avanza": [],
    "Sienna": [
      "Platinum",
      "Limited"
    ]
  },
  "Honda": {
    "City": [
      "1.5G",
      "1.5L",
      "1.5RS"
    ],
    "Civic": [
      "1.5E",
      "1.5G",
      "1.5RS"
    ],
    "CR-V": [
      "1.5E",
      "1.5G",
      "1.5L",
      "AWD",
      "Hybrid"
    ],
    "HR-V": [
      "1.5G",
      "1.5L",
      "1.5RS"
    ],
    "Accord": [
      "1.5 Turbo"
    ],
    "Brio": [
      "G",
      "RS"
    ],
    "BR-V": [
      "G",
      "L"
    ],
    "CRV": [
      "e:HEV RS",
      "L"
    ],
    "HRV": [
      "RS",
      "L"
    ],
    "BRV": [
      "L"
    ]
  },
  "Mazda": {
    "2": [],
    "3": [],
    "Mazda2": [
      "1.5 AT",
      "1.5 Luxury",
      "1.5 Premium"
    ],
    "Mazda3": [
      "1.5 Deluxe",
      "1.5 Luxury",
      "1.5 Premium",
      "2.0 Signature"
    ],
    "Mazda6": [
      "2.0 Luxury",
      "2.0 Premium",
      "2.5 Signature Premium"
    ],
    "CX-3": [
      "1.5 Deluxe",
      "1.5 Luxury",
      "1.5 Premium"
    ],
    "CX-30": [
      "2.0 Luxury",
      "2.0 Premium"
    ],
    "CX-5": [
      "2.0 Deluxe",
      "2.0 Luxury",
      "2.0 Premium",
      "2.5 Signature"
    ],
    "CX-8": [
      "2.5 Luxury",
      "2.5 Premium",
      "2.5 Premium AWD"
    ],
    "CX5": [],
    "CX3": [],
    "CX": [],
    "BT50": []
  },
  "Ford": {
    "Ranger": [
      "XL 2.2 MT",
      "XLS 2.2 MT",
      "XLS 2.2 AT",
      "XLT 2.2 AT",
      "Wildtrak 2.0 AT",
      "Raptor",
      "XLS",
      "Wildtrak"
    ],
    "Everest": [
      "Ambiente",
      "Sport",
      "Titanium 4x2",
      "Titanium 4x4",
      "Wildtrak",
      "Titanium"
    ],
    "Territory": [
      "Trend",
      "Titanium",
      "Titanium X"
    ],
    "Explorer": [
      "Limited 2.3 Ecoboost"
    ],
    "EcoSport": [
      "1.5 Ambiente",
      "1.5 Trend",
      "1.5 Titanium",
      "1.0 Ecoboost",
      "Titanium"
    ],
    "F150": [
      "Platinum"
    ],
    "Fiesta": [
      "Titanium"
    ]
  },
  "Hyundai": {
    "Grand i10": [
      "1.2 MT Base",
      "1.2 MT",
      "1.2 AT",
      "MT Base"
    ],
    "Accent": [
      "1.4 MT Base",
      "1.4 MT",
      "1.4 AT",
      "1.4 AT Đặc biệt"
    ],
    "Elantra": [
      "1.6 AT Tiêu chuẩn",
      "1.6 AT Đặc biệt",
      "2.0 AT",
      "N-Line"
    ],
    "Creta": [
      "1.5 Tiêu chuẩn",
      "1.5 Đặc biệt",
      "1.5 Cao cấp",
      "Cao Cấp",
      "Đặc Biệt"
    ],
    "Tucson": [
      "2.0 Xăng Tiêu chuẩn",
      "2.0 Xăng Đặc biệt",
      "2.0 Dầu Đặc biệt",
      "1.6 Turbo"
    ],
    "Santa Fe": [
      "2.5 Xăng Tiêu chuẩn",
      "2.5 Xăng Cao cấp",
      "2.2 Dầu Tiêu chuẩn",
      "2.2 Dầu Cao cấp",
      "Hybrid"
    ],
    "Stargazer": [
      "1.5 Tiêu chuẩn",
      "1.5 Đặc biệt",
      "1.5 Cao cấp",
      "X",
      "Cao Cấp"
    ],
    "Kona": [
      "2.0 AT Tiêu chuẩn",
      "2.0 AT Đặc biệt",
      "1.6 Turbo",
      "Đặc Biệt"
    ],
    "SantaFe": [
      "Prestige",
      "Cao Cấp"
    ],
    "Sonata": [
      "2.0 AT"
    ],
    "Custin": [
      "Đặc Biệt"
    ]
  },
  "Kia": {
    "Morning": [
      "MT",
      "AT",
      "Premium",
      "GT-Line",
      "X-Line"
    ],
    "Soluto": [
      "MT",
      "MT Deluxe",
      "AT Deluxe",
      "AT Luxury"
    ],
    "K3": [
      "1.6 MT",
      "1.6 Luxury",
      "1.6 Premium",
      "2.0 Premium",
      "1.6 Turbo GT"
    ],
    "Sonet": [
      "1.5 MT",
      "1.5 Deluxe",
      "1.5 Luxury",
      "1.5 Premium"
    ],
    "Seltos": [
      "1.4 Deluxe",
      "1.4 Luxury",
      "1.4 Premium",
      "1.6 Premium",
      "X-Line"
    ],
    "Carens": [
      "1.5G MT",
      "1.5G IVT",
      "1.5G Luxury",
      "1.4T Premium",
      "1.5D Signature"
    ],
    "Sportage": [
      "2.0G Luxury",
      "2.0G Premium",
      "2.0G Signature",
      "1.6T Signature AWD",
      "2.0D Signature"
    ],
    "Sorento": [
      "2.2D Luxury",
      "2.2D Premium",
      "2.2D Signature",
      "2.5G Premium",
      "2.5G Signature",
      "HEV",
      "PHEV"
    ],
    "Carnival": [
      "2.2D Luxury",
      "2.2D Premium",
      "2.2D Signature",
      "3.5G Signature"
    ],
    "Optima": [
      "2.0 AT"
    ],
    "K5": [
      "2.0 Luxury"
    ],
    "Cerato": [
      "1.6 Luxury"
    ]
  },
  "Mitsubishi": {
    "Attrage": [
      "MT",
      "CVT",
      "CVT Premium"
    ],
    "Xpander": [
      "MT",
      "AT",
      "AT Premium",
      "Cross"
    ],
    "Outlander": [
      "2.0 CVT",
      "2.0 CVT Premium",
      "2.4 CVT Premium"
    ],
    "Pajero Sport": [
      "Diesel 4x2 AT",
      "Diesel 4x4 AT"
    ],
    "Triton": [
      "4x2 MT",
      "4x2 AT MIVEC",
      "4x4 MT MIVEC",
      "4x2 AT Athlete",
      "4x4 AT Athlete"
    ],
    "Zinger": [
      "GLS"
    ],
    "Xforce": [
      "GLX",
      "Ultimate"
    ]
  },
  "VinFast": {
    "Fadil": [
      "Tiêu chuẩn",
      "Nâng cao",
      "Cao cấp"
    ],
    "Lux A2.0": [
      "Tiêu chuẩn",
      "Nâng cao",
      "Cao cấp",
      "Premium"
    ],
    "Lux SA2.0": [
      "Tiêu chuẩn",
      "Nâng cao",
      "Cao cấp",
      "Premium"
    ],
    "VF 5": [
      "Plus"
    ],
    "VF e34": [
      "Standard"
    ],
    "VF 6": [
      "Eco",
      "Plus"
    ],
    "VF 7": [
      "Eco",
      "Plus"
    ],
    "VF 8": [
      "Eco",
      "Plus",
      "Limo",
      "Herio"
    ],
    "VF 9": [
      "Eco",
      "Plus"
    ],
    "VF 3": [
      "Eco"
    ]
  },
  "Suzuki": {
    "Swift": [
      "GLX",
      "GL"
    ],
    "Ertiga": [
      "MT",
      "AT",
      "Hybrid"
    ],
    "XL7": [
      "GLX",
      "Sport Limited"
    ],
    "Ciaz": [
      "1.4 AT"
    ],
    "Blind Van": [
      "Standard"
    ],
    "Super Carry": [
      "Pro"
    ],
    "Jimny": [
      "GLX"
    ],
    "Celerio": [
      "1.0 CVT"
    ],
    "Grand Vitara": [
      "2.0 AT"
    ]
  },
  "Nissan": {
    "Almera": [
      "MT",
      "CVT",
      "CVT Cao cấp",
      "VL"
    ],
    "Navara": [
      "EL 2WD",
      "VL 4WD",
      "PRO-4X",
      "EL",
      "LE",
      "VL"
    ],
    "Kicks": [
      "E",
      "V"
    ],
    "Terra": [
      "V",
      "S",
      "E"
    ],
    "X-Trail": [
      "2.0 SL"
    ],
    "Juke": [
      "1.6 CVT"
    ],
    "Tiida": [
      "1.6 AT"
    ],
    "Sunny": [
      "Q-Series"
    ]
  },
  "Peugeot": {
    "2008": [
      "Active",
      "GT-Line"
    ],
    "3008": [
      "Active",
      "Allure",
      "GT"
    ],
    "5008": [
      "Allure",
      "GT"
    ]
  },
  "Subaru": {
    "Forester": [
      "i-L",
      "i-L EyeSight",
      "i-S EyeSight"
    ],
    "Outback": [
      "2.5 i-T EyeSight"
    ],
    "BRZ": [
      "2.4 AT EyeSight"
    ],
    "WRX": [
      "2.4 MT",
      "2.4 CVT EyeSight"
    ]
  },
  "Mercedes-Benz": {
    "C-Class": [
      "C200",
      "C200 Plus",
      "C300 AMG"
    ],
    "E-Class": [
      "E180",
      "E200 Exclusive",
      "E300 AMG"
    ],
    "GLC": [
      "GLC 200",
      "GLC 200 4MATIC",
      "GLC 300 4MATIC"
    ],
    "E": [
      "Base"
    ],
    "C": [
      "Base"
    ],
    "V": [
      "Base"
    ],
    "S": [
      "Base"
    ],
    "GLS": [
      "Base"
    ],
    "CLA": [
      "Base"
    ],
    "GLK": [
      "Base"
    ]
  },
  "BMW": {
    "3": [
      "320i",
      "330i"
    ],
    "4": [
      "420i",
      "430i"
    ],
    "5": [
      "520i",
      "530i"
    ],
    "7": [
      "730Li",
      "740Li"
    ],
    "3 Series": [
      "320i Sport Line",
      "320i M Sport",
      "330i M Sport"
    ],
    "5 Series": [
      "520i",
      "520i M Sport",
      "530i M Sport"
    ],
    "X3": [
      "xDrive20i",
      "xDrive20i M Sport",
      "xDrive30i M Sport"
    ],
    "X5": [
      "xDrive40i xLine",
      "xDrive40i M Sport",
      "xDrive40i xLine Plus"
    ],
    "X2": [
      "sDrive18i M Sport"
    ],
    "X6": [
      "xDrive40i M Sport"
    ],
    "X7": [
      "xDrive40i Pure Excellence"
    ],
    "X1": [
      "sDrive18i xLine"
    ]
  },
  "MG": {
    "ZS": [
      "STD",
      "COM",
      "LUX"
    ],
    "HS": [
      "1.5T 2WD Sport",
      "1.5T 2WD Trophy",
      "2.0T AWD Trophy"
    ]
  },
  "Volkswagen": {
    "Tiguan": [
      "Elegance",
      "Luxury"
    ],
    "Teramont": [
      "X",
      "President"
    ],
    "Polo": [
      "Hatchback"
    ],
    "Touareg": [
      "Elegance",
      "Luxury"
    ]
  },
  "Audi": {
    "A4": [
      "40 TFSI",
      "45 TFSI Quattro"
    ],
    "A6": [
      "45 TFSI",
      "55 TFSI Quattro"
    ],
    "Q5": [
      "45 TFSI"
    ],
    "Q7": [
      "45 TFSI",
      "55 TFSI"
    ],
    "Q8": [
      "S line"
    ]
  },
  "Lexus": {
    "RX 350": [
      "Premium",
      "Luxury",
      "F SPORT"
    ],
    "NX 300": [
      "Base",
      "F SPORT"
    ],
    "ES 250": [
      "Base",
      "F SPORT"
    ],
    "LX 570": [
      "Super Sport"
    ],
    "LX 600": [
      "Urban",
      "VIP"
    ]
  },
  "Porsche": {
    "Macan": [
      "Base",
      "S",
      "GTS"
    ],
    "Cayenne": [
      "Base",
      "S",
      "Coupe"
    ],
    "Panamera": [
      "Base",
      "4",
      "4S"
    ],
    "Taycan": [
      "4S",
      "Turbo"
    ]
  }
};

export const classifyByBrand = (brand, version) => {
  if (!brand || !version) return "other";

  const v = version.toString().trim().toUpperCase();

  // Keyword checks for version classification
  if (v.includes('PREMIUM') || v.includes('SIGNATURE') || v.includes('Q') || v.includes('V') || v.includes('LUX') || v.includes('RS') || v.includes('GT') || v.includes('WILDTRAK') || v.includes('PLUS') || v.includes('PRO')) {
    return "premium";
  }
  
  if (v.includes('BASE') || v.includes('E') || v.includes('MT') || v.includes('STD') || v.includes('ACTIVE')) {
    return "standard";
  }

  return "other";
};

export const getVersionFactor = (type) => {
  switch (type) {
    case "standard": return 0.9;
    case "other": return 1.0;
    case "premium": return 1.15;
    default: return 1.0;
  }
};

export const calculateValuation = (formData) => {
  const currentYear = new Date().getFullYear();
  const year = parseInt(formData.year) || currentYear;
  let odo = parseInt(formData.odo) || 0;
  
  // 1. price_new based on brand (using average of min-max)
  let price_new = 1000000000; // default 1B
  const modelUpper = (formData.model || '').toUpperCase();
  switch (formData.brand) {
    case 'Toyota': price_new = (450000000 + 1300000000) / 2; break;
    case 'Honda': price_new = (500000000 + 1300000000) / 2; break;
    case 'Kia': price_new = (350000000 + 1100000000) / 2; break;
    case 'Hyundai': price_new = (350000000 + 800000000) / 2; break;
    case 'Mazda': price_new = (650000000 + 1000000000) / 2; break;
    case 'VinFast': 
      if (modelUpper.includes('VF 9') || modelUpper.includes('VF9')) price_new = 1500000000;
      else if (modelUpper.includes('VF 8') || modelUpper.includes('VF8')) price_new = 1100000000;
      else if (modelUpper.includes('VF 5') || modelUpper.includes('VF5')) price_new = 480000000;
      else price_new = 800000000; 
      break;
    case 'Ford': price_new = (650000000 + 1500000000) / 2; break;
    // other brands fallback to 1B
  }

  // 2. years_used
  const years_used = Math.max(0, currentYear - year);

  // 3. depreciation_rate (cập nhật sát với thị trường thực tế hơn, tránh mất giá quá nhanh)
  let depreciation_rate = 0.5;
  if (years_used < 1) depreciation_rate = 0.90; // Giữ giá 90%
  else if (years_used === 1) depreciation_rate = 0.82; 
  else if (years_used === 2) depreciation_rate = 0.75; 
  else if (years_used <= 4) depreciation_rate = 0.65; 
  else if (years_used <= 6) depreciation_rate = 0.55; 
  else if (years_used < 10) depreciation_rate = 0.45; 
  else depreciation_rate = 0.30; 

  // 4. base_price
  const base_price = price_new * depreciation_rate;

  // 5. total_factor
  let brand_factor = 1.0;
  if (['Toyota', 'Honda'].includes(formData.brand)) brand_factor = 1.05;
  else if (formData.brand === 'Kia') brand_factor = 0.95;

  // Default values for missing fields from form
  const origin_factor = 1.0; 
  const color_factor = 1.0;
  const condition_factor = 1.0;

  const versionType = classifyByBrand(formData.brand, formData.version);
  const version_factor = getVersionFactor(versionType);

  const total_factor = brand_factor * origin_factor * color_factor * condition_factor * version_factor;

  // 6. km_depreciation
  const km_depreciation = (odo / 10000) * 0.02 * price_new;

  // 7. final_price (This is Market Price estimation)
  let marketPrice = (base_price * total_factor) - km_depreciation;
  if (marketPrice < 0) marketPrice = 0;

  // Simulate buying strategy
  const riskReserve = marketPrice * 0.02;
  const storePrice = (marketPrice * 0.90) - riskReserve;

  const storeCarPriceMax = storePrice * 1.02;
  const storeCarPriceMin = storePrice * 0.98;

  const marketPriceMax = marketPrice * 1.05;
  const marketPriceMin = marketPrice * 0.95;

  return {
    estimated_price: storePrice, // Return store price as rawEstimated
    price_new,
    years_used,
    breakdown: {
      base_price,
      depreciation_rate,
      total_factor,
      km_depreciation,
      versionType,
      version_factor
    },
    uiData: {
      storeCarPrice: `${Math.round(storeCarPriceMin / 1000000)} triệu - ${Math.round(storeCarPriceMax / 1000000)} triệu`,
      marketPrice: `${Math.round(marketPriceMin / 1000000)} triệu - ${Math.round(marketPriceMax / 1000000)} triệu`,
      increasePercentage: 'Mua thẳng, giải ngân 30p' 
    }
  };
};

/**
 * Tính giá xe điện (EV) dựa trên công thức:
 * Giá thu mua = P_0 * (1 - H_t - H_p) ± ΔV
 * 
 * @param {Object} formData Dữ liệu tương tự xe xăng
 * @param {Object} evData Các thông số đặc thù của xe điện: SoH (%), deltaV (VND, có thể âm hoặc dương), priceNew (VND)
 */
export const calculateEVValuation = (formData, evData) => {
  const currentYear = new Date().getFullYear();
  const year = parseInt(formData.year) || currentYear;
  let odo = parseInt(formData.odo) || 0;
  
  // 1. P_0: Giá xe mới (Bao gồm thuế phí lăn bánh)
  let P_0 = evData?.priceNew || 1000000000; // Default 1 tỷ nếu không truyền vào
  switch (formData.brand) {
    case 'VinFast': P_0 = (500000000 + 1500000000) / 2; break; // Ví dụ range của VinFast
  }
  // Giả sử lấy giá định nghĩa cụ thể nếu user pass qua evData.priceNew

  // 2. H_t: Khấu hao thời gian và Km
  // Thường xe điện mất giá mạnh 1-2 năm đầu
  const years_used = Math.max(0, currentYear - year);
  let time_depreciation = 0; 
  if (years_used === 0) time_depreciation = 0.10; // Mất 10% ngay năm đầu
  else if (years_used <= 2) time_depreciation = 0.25; // 1-2 năm
  else if (years_used <= 5) time_depreciation = 0.45; // 3-5 năm
  else time_depreciation = 0.60;

  // Tính thêm độ mòn vật lý qua km (Ví dụ: mỗi 10,000km mất thêm 1%)
  const km_depreciation = (odo / 10000) * 0.01;
  const H_t = time_depreciation + km_depreciation;

  // 3. H_p: Khấu hao pin dựa trên SoH (State of Health)
  const SoH = evData?.SoH || 100; // Giả định pin 100% nếu không nhập
  let battery_degraded = (100 - SoH) / 100; // Ví dụ chai 5% -> 0.05
  
  // Rule: SoH < 80% giảm sâu vì thay pin đắt. SoH > 90% giữ giá
  let H_p = battery_degraded;
  if (SoH < 80) {
    H_p += 0.15; // Phạt nặng thêm 15% mòn giá trị xe nếu pin dưới 80%
  } else if (SoH > 90) {
    H_p = Math.max(0, H_p - 0.02); // Tặng thêm giữ giá nếu > 90%
  }

  // 4. ΔV: Chênh lệch khác (Lịch sử bảo dưỡng OTA, phụ kiện...)
  let delta_V = evData?.deltaV || 0; 
  // deltaV có thể là cộng thêm (bảo dưỡng full, ota mới) hoặc trừ đi (xước xát)

  // 5. Tính Giá Thu Mua
  const multiplier = Math.max(0.1, 1 - H_t - H_p); // Không để hệ số âm
  
  let final_price = (P_0 * multiplier) + delta_V;
  if (final_price < 0) final_price = 0;

  return {
    estimated_price: final_price,
    breakdown: {
      P_0,
      H_t,
      H_p,
      delta_V,
      SoH,
      multiplier
    }
  };
};
