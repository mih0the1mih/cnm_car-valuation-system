// backend/cron/cleanPipeline.js
const RawMarketCar = require('../models/RawMarketCar');
const MarketCar = require('../models/MarketCar');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsePrice(str) {
  if (!str) return null;
  const s = str.toString().toLowerCase().replace(/\s+/g, ' ').trim();
  let total = 0;
  const tyMatch  = s.match(/(\d+[\.,]?\d*)\s*tỷ/);
  const trieuMatch = s.match(/(\d+[\.,]?\d*)\s*triệu/);
  if (tyMatch)    total += parseFloat(tyMatch[1].replace(',', '.'))  * 1_000_000_000;
  if (trieuMatch) total += parseFloat(trieuMatch[1].replace(',', '.')) * 1_000_000;
  
  if (total > 0) return Math.round(total);
  // Trường hợp priceStr đã là số nguyên dạng chuỗi (ví dụ: "460000000")
  const num = parseInt(s.replace(/[^0-9]/g, ''));
  return num > 0 ? num : null;
}

function parseMileage(str) {
  if (!str) return 50000;
  const m = str.toString().replace(/\./g, '').replace(/,/g, '').match(/(\d+)/);
  return m ? parseInt(m[1]) : 50000;
}

function parseYear(str) {
  if (!str) return null;
  const m = str.toString().match(/(\d{4})/);
  return m ? parseInt(m[1]) : null;
}

function classifyVersion(version) {
  if (!version) return 'other';
  const v = version.toString().toUpperCase();
  if (v.includes('PREMIUM') || v.includes('SIGNATURE') || v.includes('Q') || v.includes('V') || v.includes('LUX') || v.includes('RS') || v.includes('GT') || v.includes('WILDTRAK') || v.includes('SPORT') || v.includes('HIGHLINE')) {
    return 'premium';
  }
  if (v.includes('BASE') || v.includes('E') || v.includes('MT') || v.includes('STD') || v.includes('ACTIVE') || v.includes('DELUXE') || v.includes('AMBIENTE')) {
    return 'standard';
  }
  return 'other';
}

function parseBrandModel(title) {
  if (!title) return { brand: null, model: null, version: '' };
  const clean = title.replace(/-?\s*\d{4}\s*$/, '').trim();
  const parts  = clean.split(/\s+/);
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

  const model = modelParts.length > 0 ? modelParts.join(' ') : parts[1];
  const version = versionIndex !== -1 ? parts.slice(versionIndex).join(' ') : '';
  return { brand, model, version };
}

function normalizeBrandModelData(rawBrand, rawModel, rawVersion) {
  let brand = rawBrand ? rawBrand.trim() : '';
  let model = rawModel ? rawModel.trim() : '';
  let version = rawVersion ? rawVersion.trim() : '';

  const brandUpper = brand.toUpperCase();
  if (brandUpper.includes('TOYOTA')) brand = 'Toyota';
  else if (brandUpper.includes('HONDA')) brand = 'Honda';
  else if (brandUpper.includes('KIA')) brand = 'Kia';
  else if (brandUpper.includes('HYUNDAI')) brand = 'Hyundai';
  else if (brandUpper.includes('MAZDA')) brand = 'Mazda';
  else if (brandUpper.includes('MITSUBISHI')) brand = 'Mitsubishi';
  else if (brandUpper.includes('FORD')) brand = 'Ford';
  else if (brandUpper.includes('VINFAST')) brand = 'VinFast';
  else if (brandUpper.includes('MERCEDES') || brandUpper.includes('BENZ')) brand = 'Mercedes-Benz';
  else if (brandUpper.includes('BMW')) brand = 'BMW';
  else if (brandUpper.includes('NISSAN')) brand = 'Nissan';
  else if (brandUpper.includes('SUZUKI')) brand = 'Suzuki';
  else if (brandUpper.includes('MG')) brand = 'MG';

  if (brand === 'Mercedes-Benz') {
    if (model.toUpperCase().startsWith('BENZ ')) {
      model = model.substring(5);
    }
    const mUpper = model.toUpperCase();
    if (mUpper.includes('GLC')) {
      model = 'GLC';
    } else if (mUpper.includes('C-CLASS') || mUpper.startsWith('C ')) {
      model = 'C-Class';
    } else if (mUpper.includes('E-CLASS') || mUpper.startsWith('E ')) {
      model = 'E-Class';
    } else if (mUpper.includes('S-CLASS') || mUpper.startsWith('S ')) {
      model = 'S-Class';
    }
  }

  if (brand === 'VinFast') {
    model = model.replace(/VF(\d)/i, 'VF $1');
  }

  if (brand === 'BMW') {
    const mUpper = model.toUpperCase();
    if (mUpper.startsWith('3') || mUpper.includes('3 SERIES')) {
      model = '3 Series';
    } else if (mUpper.startsWith('5') || mUpper.includes('5 SERIES')) {
      model = '5 Series';
    } else if (mUpper.startsWith('7') || mUpper.includes('7 SERIES')) {
      model = '7 Series';
    }
  }

  const modelUpper = model.toUpperCase();
  if (modelUpper === 'SANTAFE' || modelUpper === 'SANTA FE') model = 'Santa Fe';
  if (modelUpper === 'XPANDER CROSS') {
    model = 'Xpander Cross';
  } else if (modelUpper === 'XPANDER') {
    model = 'Xpander';
  }
  if (modelUpper === 'COROLLA ALTIS' || modelUpper === 'ALTIS') model = 'Corolla Altis';
  if (modelUpper === 'CRV' || modelUpper === 'CR-V') model = 'CR-V';
  if (modelUpper === 'HRV' || modelUpper === 'HR-V') model = 'HR-V';
  if (modelUpper === 'GRAND I10' || modelUpper === 'I10') model = 'i10';

  return { brand, model, version };
}

function parseFuel(text) {
  if (!text) return 'gasoline';
  const t = text.toLowerCase();
  if (t.includes('điện') || t.includes('electric')) return 'electric';
  if (t.includes('hybrid'))                          return 'hybrid';
  if (t.includes('dầu') || t.includes('diesel'))     return 'diesel';
  return 'gasoline';
}

function parseTransmission(text) {
  if (!text) return 'AT';
  const t = text.toLowerCase();
  if (t.includes('số tay') || t.includes(' mt'))     return 'MT';
  if (t.includes('cvt'))                              return 'CVT';
  return 'AT';
}

function parseLocation(text) {
  if (!text) return null;
  const locations = ['Hà Nội', 'TP HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
    'Bình Dương', 'Đồng Nai', 'Bà Rịa', 'Vũng Tàu', 'Khánh Hòa', 'Nghệ An',
    'Đăk Lăk', 'Lâm Đồng', 'Huế', 'Quảng Nam', 'Quảng Ngãi', 'HCM'];
  for (const loc of locations) {
    if (text.includes(loc)) {
      return loc === 'HCM' ? 'TP HCM' : loc;
    }
  }
  return text.trim();
}

// ─── Main Cleaning Pipeline ──────────────────────────────────────────────────

async function cleanRawMarketData() {
  console.log('[Cleaner] Bắt đầu dọn dẹp và chuẩn hóa dữ liệu từ raw_marketcars...');
  try {
    const rawCars = await RawMarketCar.find({ isProcessed: false });
    if (rawCars.length === 0) {
      console.log('[Cleaner] Không có dữ liệu thô mới cần xử lý.');
      return;
    }

    console.log(`[Cleaner] Tìm thấy ${rawCars.length} bản ghi thô cần xử lý.`);
    let cleanCount = 0;

    for (const raw of rawCars) {
      try {
        const year = raw.yearStr ? (parseYear(raw.yearStr) || parseYear(raw.title)) : parseYear(raw.title);
        const price = parsePrice(raw.priceStr);
        const mileage = parseMileage(raw.mileageStr);
        const location = parseLocation(raw.locationStr || raw.descStr);

        // Lọc các bản ghi thô không hợp lệ
        if (!year || !price || price < 50_000_000 || price > 30_000_000_000 || year < 1995 || year > 2026) {
          raw.isProcessed = true;
          await raw.save();
          continue;
        }

        const { brand: rawBrand, model: rawModel, version: rawVersion } = parseBrandModel(raw.title);
        const { brand, model, version } = normalizeBrandModelData(rawBrand, rawModel, rawVersion);

        if (!brand || !model || brand.length < 2) {
          raw.isProcessed = true;
          await raw.save();
          continue;
        }

        const cleanPayload = {
          brand,
          model,
          version,
          versionClass: classifyVersion(version),
          year,
          mileage,
          price,
          fuel: parseFuel(raw.descStr || raw.title),
          transmission: parseTransmission(raw.descStr || raw.title),
          location,
          source: raw.source,
          rawMarketCarId: raw._id
        };

        // Upsert vào MarketCar để tránh trùng lặp dữ liệu sạch
        await MarketCar.findOneAndUpdate(
          {
            brand: cleanPayload.brand,
            model: cleanPayload.model,
            year: cleanPayload.year,
            price: cleanPayload.price,
            mileage: cleanPayload.mileage,
            source: cleanPayload.source
          },
          { $setOnInsert: cleanPayload },
          { upsert: true }
        );

        raw.isProcessed = true;
        await raw.save();
        cleanCount++;
      } catch (err) {
        console.error(`[Cleaner] Lỗi xử lý bản ghi ID ${raw._id}:`, err.message);
        // Đánh dấu là đã xử lý để tránh vòng lặp lỗi vô tận
        raw.isProcessed = true;
        await raw.save();
      }
    }

    console.log(`[Cleaner] ✅ Đã dọn dẹp xong. Thêm mới/cập nhật ${cleanCount} xe vào collection MarketCar.`);
  } catch (err) {
    console.error('[Cleaner Error] Lỗi trong tiến trình dọn dẹp:', err);
  }
}

module.exports = { cleanRawMarketData };
