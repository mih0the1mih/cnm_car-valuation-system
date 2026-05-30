// backend/ai/pricing/pricingProfiles.js

const PRICING_GROUPS = {
  JAPAN_PREMIUM: {
    brands: ['TOYOTA', 'HONDA', 'LEXUS'],
    retentionFactor: 1.15,
    kmPenalty: 2.5, // 2.5 million per 10k km
    depreciation: [
      { maxYears: 0, rate: 0.90 }, // < 1 year
      { maxYears: 3, rate: 0.78 }, // 1-3 years
      { maxYears: 5, rate: 0.68 }, // 3-5 years
      { maxYears: 7, rate: 0.58 }, // 5-7 years
      { maxYears: 99, rate: 0.45 }, // > 7 years
    ]
  },
  KOREA_CHINA: {
    brands: ['HYUNDAI', 'KIA', 'MG'],
    retentionFactor: 0.95,
    kmPenalty: 3.0,
    depreciation: [
      { maxYears: 0, rate: 0.85 },
      { maxYears: 3, rate: 0.70 },
      { maxYears: 5, rate: 0.55 },
      { maxYears: 7, rate: 0.42 },
      { maxYears: 99, rate: 0.30 },
    ]
  },
  GERMAN_LUXURY: {
    brands: ['MERCEDES-BENZ', 'MERCEDES', 'BMW', 'AUDI'],
    retentionFactor: 0.85, // luxuryFactor
    kmPenalty: 6.0,
    depreciation: [
      { maxYears: 0, rate: 0.88 },
      { maxYears: 3, rate: 0.78 },
      { maxYears: 5, rate: 0.68 },
      { maxYears: 7, rate: 0.62 },
      { maxYears: 99, rate: 0.55 },
    ]
  },
  PORSCHE: {
    brands: ['PORSCHE'],
    retentionFactor: 1.05, // rarityFactor
    kmPenalty: 4.0,
    depreciation: [
      { maxYears: 0, rate: 0.92 },
      { maxYears: 3, rate: 0.82 },
      { maxYears: 5, rate: 0.72 },
      { maxYears: 7, rate: 0.65 },
      { maxYears: 99, rate: 0.55 },
    ]
  },
  EV_VINFAST: {
    brands: ['VINFAST'],
    retentionFactor: 0.95, // dependent on batteryHealth
    kmPenalty: 3.5,
    depreciation: [
      { maxYears: 0, rate: 0.95 },
      { maxYears: 3, rate: 0.85 },
      { maxYears: 5, rate: 0.75 },
      { maxYears: 7, rate: 0.60 },
      { maxYears: 99, rate: 0.45 },
    ]
  },
  SUV_PICKUP: {
    brands: ['FORD', 'CHEVROLET', 'MITSUBISHI'],
    retentionFactor: 0.95, // terrainFactor
    kmPenalty: 3.5,
    depreciation: [
      { maxYears: 0, rate: 0.85 },
      { maxYears: 3, rate: 0.70 },
      { maxYears: 5, rate: 0.55 },
      { maxYears: 7, rate: 0.42 },
      { maxYears: 99, rate: 0.30 },
    ]
  },
  NICHE: {
    brands: ['NISSAN', 'PEUGEOT', 'SUBARU', 'VOLKSWAGEN', 'MAZDA'],
    retentionFactor: 0.88,
    kmPenalty: 4.0,
    depreciation: [
      { maxYears: 0, rate: 0.85 },
      { maxYears: 3, rate: 0.70 },
      { maxYears: 5, rate: 0.55 },
      { maxYears: 7, rate: 0.42 },
      { maxYears: 99, rate: 0.30 },
    ]
  },
  SMALL_CARS: {
    brands: ['SUZUKI'],
    retentionFactor: 0.97,
    kmPenalty: 2.8,
    depreciation: [
      { maxYears: 0, rate: 0.85 },
      { maxYears: 3, rate: 0.70 },
      { maxYears: 5, rate: 0.55 },
      { maxYears: 7, rate: 0.42 },
      { maxYears: 99, rate: 0.30 },
    ]
  }
};

const DEFAULT_PROFILE = {
  retentionFactor: 0.90,
  kmPenalty: 3.0,
  depreciation: [
    { maxYears: 0, rate: 0.85 },
    { maxYears: 3, rate: 0.70 },
    { maxYears: 5, rate: 0.55 },
    { maxYears: 7, rate: 0.42 },
    { maxYears: 99, rate: 0.30 },
  ]
};

function getProfileByBrand(brand) {
  const upperBrand = brand.toUpperCase().trim();
  for (const groupKey in PRICING_GROUPS) {
    if (PRICING_GROUPS[groupKey].brands.includes(upperBrand)) {
      return PRICING_GROUPS[groupKey];
    }
  }
  return DEFAULT_PROFILE;
}

module.exports = {
  PRICING_GROUPS,
  DEFAULT_PROFILE,
  getProfileByBrand
};
