const axios   = require('axios');
const cheerio  = require('cheerio');

const H = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'text/html',
  'Accept-Language': 'vi-VN,vi;q=0.9',
};

axios.get('https://bonbanh.com/oto-cu', { headers: H, timeout: 15000 })
  .then(r => {
    const $ = cheerio.load(r.data);
    $('li.car-item').slice(0, 3).each((i, el) => {
      console.log('=== CAR', i, '===');
      console.log('h3:', $('h3', el).text().trim().substring(0, 70));
      console.log('[itemprop=price] text:', $('[itemprop="price"]', el).text().trim());
      console.log('[itemprop=price] content:', $('[itemprop="price"]', el).attr('content'));
      console.log('.cb1:', $('.cb1', el).text().trim().replace(/\s+/g,' ').substring(0, 40));
      console.log('.cb4:', $('.cb4', el).text().trim().replace(/\s+/g,' ').substring(0, 40));
      console.log('.cb6_02:', $('.cb6_02', el).text().trim().replace(/\s+/g,' ').substring(0, 80));
      console.log('Full text snippet:', $(el).text().trim().replace(/\s+/g,' ').substring(0, 200));
      console.log('---');
    });
  })
  .catch(e => console.error('ERROR:', e.message));
