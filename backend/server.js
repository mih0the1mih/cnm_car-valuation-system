// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const carListingRoutes = require('./routes/carListing');
const technicianRoutes = require('./routes/technician');
const valuationRoutes  = require('./routes/valuation');
const chatRoutes = require('./routes/chat');
const analyticsRoutes = require('./routes/analytics');
const carPriceListRoutes = require('./routes/carPriceList');
const { startCrawlScheduler } = require('./crawlers/crawlScheduler');

dotenv.config();
connectDB();


const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startCrawlScheduler(); // Khởi động cron job cào bonbanh.com mỗi ngày
});

app.use('/api/car-listings', carListingRoutes);

app.use('/api/technician', technicianRoutes);
app.use('/api/valuation', valuationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/price-list', carPriceListRoutes);