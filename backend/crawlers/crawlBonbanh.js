// backend/crawl/crawlBonbanh.js
// Cào dữ liệu xe thật từ bonbanh.com và lưu vào MongoDB
// Chạy: node crawl/crawlBonbanh.js
//
// Cài thêm: npm install axios cheerio
//
require('dotenv').config({ path: '../.env' });
const axios   = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const RawMarketCar = require('../models/RawMarketCar');
const { cleanRawMarketData } = require('../cron/cleanPipeline');

// ─── Config ───────────────────────────────────────────────────────────────────
const BASE_URL    = 'https://bonbanh.com';
const PAGES_TO_CRAWL = 10;   // 20 xe/trang × 10 trang = ~200 xe
const DELAY_MS    = 1500;    // Tạm dừng giữa các request (tránh bị block)

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Cache-Control': 'max-age=0',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Parse giá từ chuỗi kiểu "3 Tỷ 989 Triệu" hoặc "548 Triệu"
 * Trả về số VND (số nguyên)
 */
function parsePrice(str) {
  if (!str) return null;
  const s = str.toLowerCase().replace(/\s+/g, ' ').trim();
  let total = 0;
  const tyMatch  = s.match(/(\d+[\.,]?\d*)\s*tỷ/);
  const trieuMatch = s.match(/(\d+[\.,]?\d*)\s*triệu/);
  if (tyMatch)    total += parseFloat(tyMatch[1].replace(',', '.'))  * 1_000_000_000;
  if (trieuMatch) total += parseFloat(trieuMatch[1].replace(',', '.')) * 1_000_000;
  return total > 0 ? Math.round(total) : null;
}

/**
 * Parse km từ chuỗi kiểu "đã đi 38,000 km" hoặc "38.000 km"
 */
function parseMileage(str) {
  if (!str) return null;
  const m = str.replace(/\./g, '').replace(/,/g, '').match(/(\d+)/);
  return m ? parseInt(m[1]) : null;
}

/**
 * Parse năm từ chuỗi tiêu đề kiểu "Toyota Camry - 2020"
 */
function parseYear(str) {
  if (!str) return null;
  const m = str.match(/(\d{4})/);
  return m ? parseInt(m[1]) : null;
}

/**
 * Phân loại phiên bản (versionClass)
 */
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

/**
 * Trích xuất hãng + dòng xe từ tiêu đề listing
 * Ví dụ: "Toyota Camry 2.5Q - 2020" → { brand: "Toyota", model: "Camry" }
 * Ví dụ: "Mercedes Benz GLC 300 - 2021" → { brand: "Mercedes", model: "Benz GLC" }
 */
function parseBrandModel(title) {
  if (!title) return { brand: null, model: null, version: '' };
  // Loại bỏ phần "- 2020" ở cuối
  const clean = title.replace(/-?\s*\d{4}\s*$/, '').trim();
  const parts  = clean.split(/\s+/);
  if (parts.length < 2) return { brand: parts[0] || null, model: null, version: '' };

  const brand = parts[0];

  // Nhận biết các model 2-3 chữ: loại bỏ các từ có số/ký hiệu (là phiên bản)
  const modelParts = [];
  let versionIndex = -1;
  for (let i = 1; i < Math.min(parts.length, 4); i++) {
    // Dừng khi gặp phần có số như "2.5Q", "1.5L", "4x4" hoặc các từ khóa phiên bản
    if (/\d/.test(parts[i]) || ['Premium', 'Signature', 'Luxury', 'Deluxe', 'MT', 'AT', 'CVT'].includes(parts[i])) {
      versionIndex = i;
      break;
    }
    modelParts.push(parts[i]);
    if (modelParts.length === 2) {
      if (i + 1 < parts.length) versionIndex = i + 1;
      break; // Tối đa 2 từ cho model
    }
  }

  const model = modelParts.length > 0 ? modelParts.join(' ') : parts[1];
  const version = versionIndex !== -1 ? parts.slice(versionIndex).join(' ') : '';
  return { brand, model, version };
}

/**
 * Chuẩn hóa Hãng, Dòng xe và Phiên bản để tránh dữ liệu thô hỗn loạn
 */
function normalizeBrandModelData(rawBrand, rawModel, rawVersion) {
  let brand = rawBrand ? rawBrand.trim() : '';
  let model = rawModel ? rawModel.trim() : '';
  let version = rawVersion ? rawVersion.trim() : '';

  // 1. Chuẩn hóa Hãng xe (Brand)
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

  // 2. Chuẩn hóa Dòng xe (Model) & Phiên bản (Version)
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


/**
 * Xác định loại nhiên liệu từ text mô tả
 */
function parseFuel(text) {
  if (!text) return 'gasoline';
  const t = text.toLowerCase();
  if (t.includes('điện') || t.includes('electric')) return 'electric';
  if (t.includes('hybrid'))                          return 'hybrid';
  if (t.includes('dầu') || t.includes('diesel'))     return 'diesel';
  return 'gasoline';
}

/**
 * Xác định hộp số từ text mô tả
 */
function parseTransmission(text) {
  if (!text) return 'AT';
  const t = text.toLowerCase();
  if (t.includes('số tay') || t.includes(' mt'))     return 'MT';
  if (t.includes('cvt'))                              return 'CVT';
  return 'AT';
}

/**
 * Trích xuất tỉnh/thành từ chuỗi text listing
 */
function parseLocation(text) {
  const locations = ['Hà Nội', 'TP HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
    'Bình Dương', 'Đồng Nai', 'Bà Rịa', 'Vũng Tàu', 'Khánh Hòa', 'Nghệ An',
    'Đăk Lăk', 'Lâm Đồng', 'Huế', 'Quảng Nam', 'Quảng Ngãi'];
  for (const loc of locations) {
    if (text && text.includes(loc)) return loc;
  }
  return null;
}

// ─── Core Crawler ─────────────────────────────────────────────────────────────
async function crawlPage(pageNum) {
  const url = pageNum === 1
    ? `${BASE_URL}/oto-cu`
    : `${BASE_URL}/oto-cu/p${pageNum}`;

  console.log(`📄 Đang cào trang ${pageNum}: ${url}`);

  let html;
  try {
    const resp = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    html = resp.data;
  } catch (err) {
    console.error(`  ❌ Lỗi tải trang ${pageNum}:`, err.message);
    return [];
  }

  const $ = cheerio.load(html);
  const cars = [];

  // Selector thực tế từ bonbanh.com (đã xác nhận bằng browser inspection)
  $('li.car-item').each((i, el) => {
    try {
      // Tiêu đề xe (xác nhận: selector là h3, không có itemprop)
      const title = $('h3', el).text().trim();
      if (!title) return;

      // Giá: attribute content là số nguyên VND chính xác (xác nhận từ live HTML)
      const priceContent = $('[itemprop="price"]', el).attr('content');
      const price = parseInt(priceContent);
      if (!price || price < 50_000_000 || price > 30_000_000_000) return;

      // Năm sản xuất từ .cb1 text (ví dụ: "Xe cũ 2020")
      const cb1Text = $('.cb1', el).text().trim();
      const yearMatch = cb1Text.match(/(\d{4})/);
      const year = yearMatch ? parseInt(yearMatch[1]) : parseYear(title);
      if (!year || year < 1995 || year > 2026) return;

      // Vị trí từ .cb4 (xác nhận: text trực tiếp, không cần .cb4 b)
      const location = $('.cb4', el).text().trim() || null;

      // Mô tả (chứa km, nhiên liệu, hộp số)
      const desc = $(el).find('.cb6_02, [itemprop="description"]').text().trim();

      // Km
      const kmMatch = desc.match(/đã đi\s*([\d\.,]+)\s*km/i);
      const mileage = kmMatch
        ? parseInt(kmMatch[1].replace(/\./g, '').replace(/,/g, ''))
        : 50000;

      // Brand & model từ title
      const { brand: rawBrand, model: rawModel, version: rawVersion } = parseBrandModel(title);
      const { brand, model, version } = normalizeBrandModelData(rawBrand, rawModel, rawVersion);
      if (!brand || !model || brand.length < 2) return;

      cars.push({
        brand,
        model,
        version,
        versionClass: classifyVersion(version),
        year,
        mileage,
        price,
        fuel:         parseFuel(desc),
        transmission: parseTransmission(desc),
        location,
        source:       'bonbanh',
      });
    } catch (e) {
      // skip
    }
  });

  return cars;
}



/**
 * Parse thông tin xe từ text thô
 * Ví dụ: "Toyota Camry 2.5Q - 2020  870 Triệu  Hà Nội  đã đi 45,000 km  máy xăng  số tự động"
 */
function parseCarFromText(text, href = '', locationHint = '') {
  // Lấy tiêu đề từ href nếu có: /xe-toyota-camry-2020-123456
  let title = text;
  if (href) {
    const hrefTitle = href.replace('/xe-', '').replace(/-\d+$/, '').replace(/-/g, ' ');
    title = hrefTitle.charAt(0).toUpperCase() + hrefTitle.slice(1);
  }

  const year  = parseYear(text + ' ' + href);
  const price = parsePrice(text);
  const km    = parseMileage(text);

  if (!year || !price || price <= 0) return null;
  // Lọc giá bất hợp lý (< 50M hoặc > 30B)
  if (price < 50_000_000 || price > 30_000_000_000) return null;

  const { brand: rawBrand, model: rawModel, version: rawVersion } = parseBrandModel(title);
  const { brand, model, version } = normalizeBrandModelData(rawBrand, rawModel, rawVersion);
  if (!brand || !model) return null;
  // Loại bỏ brand không hợp lệ
  if (brand.length < 2 || brand.match(/^\d/)) return null;

  return {
    brand:        brand,
    model:        model,
    version:      version,
    versionClass: classifyVersion(version),
    year:         year,
    mileage:      km || 50000,
    price:        price,
    fuel:         parseFuel(text),
    transmission: parseTransmission(text),
    location:     parseLocation(locationHint || text),
    source:       'bonbanh',
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  // Kết nối MongoDB
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/car_valuation';
  await mongoose.connect(mongoUri);
  console.log('✅ Đã kết nối MongoDB:', mongoUri.replace(/\/\/.*@/, '//***@'));

  let allCars = [];

  // Cào từ nhiều brand-specific page để có dữ liệu đa dạng hơn
  const brandSlugs = [
    'toyota', 'honda', 'kia', 'hyundai', 'mazda',
    'mitsubishi', 'ford', 'vinfast', 'mercedes_benz', 'bmw',
    'nissan', 'suzuki'
  ];

  for (const slug of brandSlugs) {
    for (let page = 1; page <= 2; page++) {
      const url = page === 1
        ? `https://bonbanh.com/oto/${slug}`
        : `https://bonbanh.com/oto/${slug}/p${page}`;

      console.log(`📄 Cào ${slug} trang ${page}: ${url}`);
      try {
        const resp = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        const $ = cheerio.load(resp.data);
        const pageCars = [];

        $('li.car-item').each((i, el) => {
          try {
            const title = $('h3', el).text().trim();
            if (!title) return;
            const priceContent = $('[itemprop="price"]', el).attr('content');
            const cb1 = $('.cb1', el).text().trim();
            const location = $('.cb4', el).text().trim() || null;
            const desc = $('.cb6_02', el).text().trim();
            const kmMatch = desc.match(/đã đi\s*([\d\.,]+)\s*km/i);
            const mileageStr = kmMatch ? kmMatch[1] : '';

            pageCars.push({
              title,
              priceStr: priceContent,
              mileageStr: mileageStr,
              yearStr: cb1,
              locationStr: location,
              descStr: desc,
              source: 'bonbanh',
              rawPayload: {}
            });
          } catch (_) {}
        });

        allCars = allCars.concat(pageCars);
        console.log(`  → ${pageCars.length} xe thô (tổng: ${allCars.length})`);
      } catch (err) {
        console.error(`  ❌ Lỗi ${slug} trang ${page}:`, err.message);
      }
      await sleep(DELAY_MS);
    }
  }

  // Loại trùng xe thô hoàn toàn
  const seen = new Set();
  const unique = allCars.filter(c => {
    const key = `${c.title}-${c.priceStr}-${c.yearStr}-${c.source}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`\n📊 Tổng xe thô thu thập: ${allCars.length} | Sau lọc trùng: ${unique.length}`);

  if (unique.length > 0) {
    const ops = unique.map(car => ({
      updateOne: {
        filter: { 
          title: car.title, 
          priceStr: car.priceStr, 
          yearStr: car.yearStr,
          source: car.source
        },
        update: { $setOnInsert: car },
        upsert: true
      }
    }));
    const result = await RawMarketCar.bulkWrite(ops, { ordered: false });
    console.log(`✅ Đã kiểm tra ${unique.length} xe thô. Thêm mới ${result.upsertedCount} xe thô vào MongoDB.`);

    // Chạy dọn dẹp và chuẩn hóa dữ liệu
    await cleanRawMarketData();
  } else {
    console.warn('⚠️ Không có dữ liệu nào được lưu.');
  }

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}

main().catch(err => {
  console.error('❌ Lỗi chính:', err.message);
  process.exit(1);
});
