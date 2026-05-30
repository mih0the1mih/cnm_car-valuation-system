// backend/utils/carHelpers.js
// Các hàm helper dùng chung cho toàn bộ hệ thống

/**
 * Phân loại phiên bản xe thành: 'premium' | 'standard' | 'other'
 */
function classifyVersion(version) {
  if (!version) return 'other';
  const v = version.toString().toUpperCase();
  if (
    v.includes('PREMIUM') || v.includes('SIGNATURE') || v.includes('Q') ||
    v.includes('V') || v.includes('LUX') || v.includes('RS') || v.includes('GT') ||
    v.includes('WILDTRAK') || v.includes('SPORT') || v.includes('HIGHLINE')
  ) return 'premium';
  if (
    v.includes('BASE') || v.includes('E') || v.includes('MT') || v.includes('STD') ||
    v.includes('ACTIVE') || v.includes('DELUXE') || v.includes('AMBIENTE')
  ) return 'standard';
  return 'other';
}

/**
 * Phân tích giá từ chuỗi text (ví dụ: "1 Tỷ 980 Triệu" → 1980000000)
 */
function parsePrice(str) {
  if (!str) return null;
  const s = str.toString().toLowerCase().replace(/\s+/g, ' ').trim();
  let total = 0;
  const tyMatch    = s.match(/(\d+[\.,]?\d*)\s*tỷ/);
  const trieuMatch = s.match(/(\d+[\.,]?\d*)\s*triệu/);
  if (tyMatch)    total += parseFloat(tyMatch[1].replace(',', '.'))    * 1_000_000_000;
  if (trieuMatch) total += parseFloat(trieuMatch[1].replace(',', '.')) * 1_000_000;
  if (total > 0) return Math.round(total);
  const num = parseInt(s.replace(/[^0-9]/g, ''));
  return num > 0 ? num : null;
}

/**
 * Phân tích số km từ chuỗi text
 */
function parseMileage(str) {
  if (!str) return 50000;
  const m = str.toString().replace(/\./g, '').replace(/,/g, '').match(/(\d+)/);
  return m ? parseInt(m[1]) : 50000;
}

/**
 * Phân tích năm sản xuất từ chuỗi text
 */
function parseYear(str) {
  if (!str) return null;
  const m = str.toString().match(/(\d{4})/);
  return m ? parseInt(m[1]) : null;
}

/**
 * Tách brand/model/version từ tiêu đề (ví dụ: "Toyota Vios 1.5G đời 2019")
 */
function parseBrandModel(title) {
  if (!title) return { brand: null, model: null, version: '' };
  const clean = title.replace(/-?\s*\d{4}\s*$/, '').trim();
  const parts = clean.split(/\s+/);
  if (parts.length < 2) return { brand: parts[0] || null, model: null, version: '' };
  const brand = parts[0];
  const modelParts = [];
  let versionIndex = -1;
  for (let i = 1; i < Math.min(parts.length, 4); i++) {
    if (/\d/.test(parts[i]) || ['Premium', 'Signature', 'Luxury', 'Deluxe', 'MT', 'AT', 'CVT'].includes(parts[i])) {
      versionIndex = i;
      break;
    }
    modelParts.push(parts[i]);
    if (modelParts.length === 2) {
      if (i + 1 < parts.length) versionIndex = i + 1;
      break;
    }
  }
  const model   = modelParts.length > 0 ? modelParts.join(' ') : parts[1];
  const version = versionIndex !== -1 ? parts.slice(versionIndex).join(' ') : '';
  return { brand, model, version };
}

/**
 * Chuẩn hóa tên hãng/model về dạng chuẩn (Toyota, Honda, Mercedes-Benz…)
 */
function normalizeBrandModelData(rawBrand, rawModel, rawVersion) {
  let brand   = rawBrand   ? rawBrand.trim()   : '';
  let model   = rawModel   ? rawModel.trim()   : '';
  let version = rawVersion ? rawVersion.trim() : '';

  const bu = brand.toUpperCase();
  if      (bu.includes('TOYOTA'))     brand = 'Toyota';
  else if (bu.includes('HONDA'))      brand = 'Honda';
  else if (bu.includes('KIA'))        brand = 'Kia';
  else if (bu.includes('HYUNDAI'))    brand = 'Hyundai';
  else if (bu.includes('MAZDA'))      brand = 'Mazda';
  else if (bu.includes('MITSUBISHI')) brand = 'Mitsubishi';
  else if (bu.includes('FORD'))       brand = 'Ford';
  else if (bu.includes('VINFAST'))    brand = 'VinFast';
  else if (bu.includes('MERCEDES') || bu.includes('BENZ')) brand = 'Mercedes-Benz';
  else if (bu.includes('BMW'))        brand = 'BMW';
  else if (bu.includes('NISSAN'))     brand = 'Nissan';
  else if (bu.includes('SUZUKI'))     brand = 'Suzuki';
  else if (bu.includes('MG'))         brand = 'MG';

  // Chuẩn hóa model cho từng hãng
  if (brand === 'Mercedes-Benz') {
    if (model.toUpperCase().startsWith('BENZ ')) model = model.substring(5);
    const mu = model.toUpperCase();
    if      (mu.includes('GLC'))                           model = 'GLC';
    else if (mu.includes('C-CLASS') || mu.startsWith('C ')) model = 'C-Class';
    else if (mu.includes('E-CLASS') || mu.startsWith('E ')) model = 'E-Class';
    else if (mu.includes('S-CLASS') || mu.startsWith('S ')) model = 'S-Class';
  }
  if (brand === 'VinFast') model = model.replace(/VF(\d)/i, 'VF $1');
  if (brand === 'BMW') {
    const mu = model.toUpperCase();
    if      (mu.startsWith('3') || mu.includes('3 SERIES')) model = '3 Series';
    else if (mu.startsWith('5') || mu.includes('5 SERIES')) model = '5 Series';
    else if (mu.startsWith('7') || mu.includes('7 SERIES')) model = '7 Series';
  }

  const mu = model.toUpperCase();
  if (mu === 'SANTAFE' || mu === 'SANTA FE')           model = 'Santa Fe';
  if (mu === 'XPANDER CROSS')                          model = 'Xpander Cross';
  else if (mu === 'XPANDER')                           model = 'Xpander';
  if (mu === 'COROLLA ALTIS' || mu === 'ALTIS')        model = 'Corolla Altis';
  if (mu === 'CRV'  || mu === 'CR-V')                  model = 'CR-V';
  if (mu === 'HRV'  || mu === 'HR-V')                  model = 'HR-V';
  if (mu === 'GRAND I10' || mu === 'I10')              model = 'i10';

  return { brand, model, version };
}

/**
 * Suy diễn loại nhiên liệu từ chuỗi mô tả
 */
function parseFuel(text) {
  if (!text) return 'gasoline';
  const t = text.toLowerCase();
  if (t.includes('điện')   || t.includes('electric')) return 'electric';
  if (t.includes('hybrid'))                            return 'hybrid';
  if (t.includes('dầu')    || t.includes('diesel'))   return 'diesel';
  return 'gasoline';
}

/**
 * Suy diễn loại hộp số từ chuỗi mô tả
 */
function parseTransmission(text) {
  if (!text) return 'AT';
  const t = text.toLowerCase();
  if (t.includes('số tay') || t.includes(' mt')) return 'MT';
  if (t.includes('cvt'))                         return 'CVT';
  return 'AT';
}

/**
 * Chuẩn hóa tên tỉnh/thành phố
 */
function parseLocation(text) {
  if (!text) return null;
  const locations = [
    'Hà Nội', 'TP HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Bình Dương',
    'Đồng Nai', 'Bà Rịa', 'Vũng Tàu', 'Khánh Hòa', 'Nghệ An', 'Đăk Lăk',
    'Lâm Đồng', 'Huế', 'Quảng Nam', 'Quảng Ngãi', 'HCM',
  ];
  for (const loc of locations) {
    if (text.includes(loc)) return loc === 'HCM' ? 'TP HCM' : loc;
  }
  return text.trim();
}

module.exports = {
  classifyVersion,
  parsePrice,
  parseMileage,
  parseYear,
  parseBrandModel,
  normalizeBrandModelData,
  parseFuel,
  parseTransmission,
  parseLocation,
};
