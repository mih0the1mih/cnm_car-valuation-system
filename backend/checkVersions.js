const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/car_valuation');
  const Car = mongoose.model('MarketCar', new mongoose.Schema({}, {strict:false}));
  const cars = await Car.find({
    version: { $ne: '' },
    brand: { $in: ['BMW', 'Mercedes-Benz', 'Nissan', 'Suzuki', 'MG', 'Mercedes'] }
  });
  console.log(cars.map(c => ({brand: c.brand, model: c.model, version: c.version})));
  process.exit();
}
run();
