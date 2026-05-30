const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { runCrawl } = require('./crawlScheduler');

async function main() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/car_valuation';
  await mongoose.connect(mongoUri);
  console.log('✅ Đã kết nối MongoDB:', mongoUri.replace(/\/\/.*@/, '//***@'));
  
  console.log('🚀 Bắt đầu quá trình cào dữ liệu đồng thời từ Bonbanh và Chợ Tốt...');
  await runCrawl();
  
  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB. Cào dữ liệu hoàn tất!');
}

main().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
