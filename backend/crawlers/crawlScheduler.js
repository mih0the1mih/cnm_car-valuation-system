// backend/cron/crawlScheduler.js
// Tự động cào dữ liệu từ bonbanh.com mỗi ngày lúc 2:00 sáng
const cron = require('node-cron');
const axios   = require('axios');
const cheerio = require('cheerio');
const RawMarketCar = require('../models/RawMarketCar');
const { cleanRawMarketData } = require('./cleanPipeline');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'vi-VN,vi;q=0.9',
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function crawlOnePage(pageNum) {
  const url = pageNum === 1
    ? 'https://bonbanh.com/oto-cu'
    : `https://bonbanh.com/oto-cu/p${pageNum}`;

  try {
    const resp = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(resp.data);
    const cars = [];

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

        cars.push({
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

    return cars;
  } catch (err) {
    console.error(`[CrawlScheduler] Lỗi trang bonbanh ${pageNum}:`, err.message);
    return [];
  }
}

async function crawlChoTot() {
  const cars = [];
  try {
    for (let page = 0; page < 5; page++) {
      const offset = page * 20;
      const url = `https://gateway.chotot.com/v1/public/ad-listing?cg=2010&limit=20&o=${offset}`;
      const resp = await axios.get(url, { headers: HEADERS, timeout: 15000 });
      
      if (resp.data && resp.data.ads) {
        resp.data.ads.forEach(ad => {
          try {
            cars.push({
              title: ad.subject || `${ad.carbrand_name || ''} ${ad.carmodel_name || ''}`.trim(),
              priceStr: ad.price ? String(ad.price) : '',
              mileageStr: ad.mileage_v2 ? String(ad.mileage_v2) : '',
              yearStr: ad.mfdate ? String(ad.mfdate) : (ad.regdate ? String(ad.regdate) : ''),
              locationStr: ad.region_name || '',
              descStr: ad.body || '',
              source: 'chotot',
              rawPayload: ad
            });
          } catch (_) {}
        });
      }
      
      const delayMs = Math.floor(Math.random() * 3000) + 2000;
      await sleep(delayMs);
    }
  } catch (err) {
    console.error(`[CrawlScheduler] Lỗi cào chotot.com:`, err.message);
  }
  return cars;
}

async function runCrawl() {
  console.log('[CrawlScheduler] Bắt đầu cào dữ liệu...');
  let all = [];
  
  // 1. Cào bonbanh
  for (let page = 1; page <= 5; page++) {
    const cars = await crawlOnePage(page);
    all = all.concat(cars);
    const delayMs = Math.floor(Math.random() * 3000) + 2000;
    await sleep(delayMs);
  }

  // 2. Cào chotot
  console.log('[CrawlScheduler] Bắt đầu cào dữ liệu chotot.com...');
  const chototCars = await crawlChoTot();
  all = all.concat(chototCars);

  const seen = new Set();
  const unique = all.filter(c => {
    const key = `${c.title}-${c.priceStr}-${c.yearStr}-${c.source}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

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
    console.log(`[CrawlScheduler] ✅ Đã lưu ${result.upsertedCount} tin xe thô mới vào RawMarketCar.`);
    
    // Gọi tiến trình dọn dẹp dữ liệu
    await cleanRawMarketData();
  } else {
    console.warn('[CrawlScheduler] ⚠️ Không cào được dữ liệu hôm nay');
  }
}

// Chạy mỗi ngày lúc 2:00 sáng
function startCrawlScheduler() {
  cron.schedule('0 2 * * *', () => {
    runCrawl().catch(err => console.error('[CrawlScheduler] Lỗi:', err.message));
  }, { timezone: 'Asia/Ho_Chi_Minh' });

  console.log('[CrawlScheduler] ✅ Đã đăng ký cào dữ liệu bonbanh.com mỗi ngày lúc 02:00 AM');
}

module.exports = { startCrawlScheduler, runCrawl };
