// backend/ai/pricing/pricingCalculator.js
const { getProfileByBrand } = require('./pricingProfiles');

/**
 * Lấy tỉ lệ khấu hao (depreciation rate) theo số năm sử dụng
 */
function getDepreciationRate(profile, yearsOld) {
  for (const tier of profile.depreciation) {
    if (yearsOld <= tier.maxYears) {
      return tier.rate;
    }
  }
  return profile.depreciation[profile.depreciation.length - 1].rate;
}

/**
 * Tính giá xe tự động theo cấu hình (Dynamic Automotive Pricing Engine)
 * @param {object} params - { brand, priceNew, year, mileage, marketDemand, batteryHealth, rarityFactor, terrainFactor }
 * @returns {object} - { finalPrice, details }
 */
function calculateDynamicPrice({
  brand,
  priceNew,
  year,
  mileage,
  marketDemand = 1.0,
  batteryHealth = 1.0,
  rarityFactor = 1.0,
  terrainFactor = 1.0,
}) {
  const profile = getProfileByBrand(brand);
  
  const currentYear = new Date().getFullYear();
  const yearsOld = Math.max(0, currentYear - parseInt(year));
  const mileageNum = parseInt(mileage) || 0;

  // 1. Get Depreciation Rate
  const depreciationRate = getDepreciationRate(profile, yearsOld);

  // 2. Determine base retention factor based on custom factors if applicable
  let retentionFactor = profile.retentionFactor;
  if (brand.toUpperCase() === 'VINFAST' && batteryHealth !== 1.0) {
    retentionFactor = batteryHealth; // e.g., 0.95
  } else if (brand.toUpperCase() === 'PORSCHE' && rarityFactor !== 1.0) {
    retentionFactor = rarityFactor;
  } else if (['FORD', 'CHEVROLET', 'MITSUBISHI'].includes(brand.toUpperCase()) && terrainFactor !== 1.0) {
    retentionFactor = terrainFactor;
  }

  // 3. KM Penalty
  // kmPenalty is measured in millions of VND per 10,000 km
  const kmSegments = mileageNum / 10000;
  const kmPenaltyValue = kmSegments * profile.kmPenalty * 1_000_000;

  // 4. Calculate Final Price
  // finalPrice = priceNew * depreciationRate * retentionFactor * marketDemand - (km * kmPenalty)
  let baseCalculatedPrice = priceNew * depreciationRate * retentionFactor * marketDemand;
  let finalPrice = Math.max(0, baseCalculatedPrice - kmPenaltyValue);

  return {
    finalPrice: Math.round(finalPrice),
    details: {
      profileName: profile === getProfileByBrand('') ? 'DEFAULT' : 'MATCHED',
      priceNew,
      yearsOld,
      depreciationRate,
      retentionFactor,
      marketDemand,
      kmPenaltyValue,
      baseCalculatedPrice
    }
  };
}

module.exports = {
  calculateDynamicPrice,
  getDepreciationRate
};
