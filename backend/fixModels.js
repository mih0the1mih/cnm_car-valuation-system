const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/utils/valuationHelpers.js');
let content = fs.readFileSync(filePath, 'utf8');

// Use a regex to extract the carModels object
const regex = /export const carModels = (\{[\s\S]*?\n\});/;
const match = content.match(regex);
if (!match) {
  console.log('Could not find carModels');
  process.exit(1);
}

let carModels = eval('(' + match[1] + ')');

// 1. Process "Model Version" strings into proper versions
const brandFixes = {
  "Toyota": [
    { model: "Yaris Cross", parent: "Yaris Cross", version: "Cross" }, // Wait, Yaris Cross is a real model.
    { model: "Sienna Platinum", parent: "Sienna", version: "Platinum" },
    { model: "Vios E", parent: "Vios", version: "E" },
    { model: "Sienna Limited", parent: "Sienna", version: "Limited" },
    { model: "Rush", parent: "Rush", version: "S" } // Just add a default version
  ],
  "Honda": [
    { model: "CRV e:HEV", parent: "CRV", version: "e:HEV RS" },
    { model: "CRV L", parent: "CRV", version: "L" },
    { model: "Brio RS", parent: "Brio", version: "RS" },
    { model: "HRV RS", parent: "HRV", version: "RS" },
    { model: "HRV L", parent: "HRV", version: "L" },
    { model: "BR V", parent: "BRV", version: "L" },
  ],
  "Ford": [
    { model: "Everest Titanium", parent: "Everest", version: "Titanium" },
    { model: "Territory Titanium", parent: "Territory", version: "Titanium" },
    { model: "EcoSport Titanium", parent: "EcoSport", version: "Titanium" },
    { model: "Ranger XLS", parent: "Ranger", version: "XLS" },
    { model: "Everest Ambiente", parent: "Everest", version: "Ambiente" },
    { model: "Ranger Wildtrak", parent: "Ranger", version: "Wildtrak" },
    { model: "Ranger Raptor", parent: "Ranger", version: "Raptor" },
    { model: "Fiesta", parent: "Fiesta", version: "Titanium" },
    { model: "F150", parent: "F150", version: "Platinum" },
  ],
  "Hyundai": [
    { model: "SantaFe Prestige", parent: "SantaFe", version: "Prestige" },
    { model: "SantaFe Cao", parent: "SantaFe", version: "Cao Cấp" },
    { model: "Creta Cao", parent: "Creta", version: "Cao Cấp" },
    { model: "Stargazer Cao", parent: "Stargazer", version: "Cao Cấp" },
    { model: "Custin Đặc", parent: "Custin", version: "Đặc Biệt" },
    { model: "Creta Đặc", parent: "Creta", version: "Đặc Biệt" },
    { model: "Kona Đặc", parent: "Kona", version: "Đặc Biệt" },
    { model: "i10", parent: "Grand i10", version: "MT Base" },
    { model: "Sonata", parent: "Sonata", version: "2.0 AT" },
  ],
  "Mitsubishi": [
    { model: "Xpander Cross", parent: "Xpander", version: "Cross" },
    { model: "Zinger GLS", parent: "Zinger", version: "GLS" },
    { model: "Xforce GLX", parent: "Xforce", version: "GLX" },
    { model: "Xforce Ultimate", parent: "Xforce", version: "Ultimate" },
    { model: "Destinator Ultimate", parent: "Xforce", version: "Ultimate" }, // Cleanup
  ],
  "Nissan": [
    { model: "Navara EL", parent: "Navara", version: "EL" },
    { model: "Navara LE", parent: "Navara", version: "LE" },
    { model: "Navara VL", parent: "Navara", version: "VL" },
    { model: "Terra V", parent: "Terra", version: "V" },
    { model: "Terra S", parent: "Terra", version: "S" },
    { model: "Terra E", parent: "Terra", version: "E" },
    { model: "Almera VL", parent: "Almera", version: "VL" },
    { model: "Sunny Q", parent: "Sunny", version: "Q-Series" },
    { model: "X trail", parent: "X-Trail", version: "2.0 SL" },
    { model: "Juke", parent: "Juke", version: "1.6 CVT" },
    { model: "Tiida", parent: "Tiida", version: "1.6 AT" },
  ],
  "Suzuki": [
    { model: "Swift GLX", parent: "Swift", version: "GLX" },
    { model: "Swift GL", parent: "Swift", version: "GL" },
    { model: "Blind Van", parent: "Blind Van", version: "Standard" },
    { model: "Super Carry", parent: "Super Carry", version: "Pro" },
    { model: "Carry Pro", parent: "Super Carry", version: "Pro" },
    { model: "Grand vitara", parent: "Grand Vitara", version: "2.0 AT" },
    { model: "Jimny", parent: "Jimny", version: "GLX" },
    { model: "Ciaz", parent: "Ciaz", version: "1.4 AT" },
    { model: "Celerio", parent: "Celerio", version: "1.0 CVT" },
  ],
  "VinFast": [
    { model: "VF e34", parent: "VF e34", version: "Standard" },
    { model: "VF3", parent: "VF 3", version: "Eco" },
    { model: "VF5", parent: "VF 5", version: "Plus" },
    { model: "VF6", parent: "VF 6", version: "Plus" },
    { model: "VF8", parent: "VF 8", version: "Eco" },
    { model: "VF9", parent: "VF 9", version: "Plus" },
    { model: "Lux SA", parent: "Lux SA2.0", version: "Premium" },
    { model: "Lux A", parent: "Lux A2.0", version: "Premium" },
    { model: "Limo Green", parent: "VF 8", version: "Limo" },
    { model: "Herio Green", parent: "VF 8", version: "Herio" },
  ],
  "Kia": [
    { model: "Seltos X-Line", parent: "Seltos", version: "X-Line" },
    { model: "Optima", parent: "Optima", version: "2.0 AT" },
    { model: "K5", parent: "K5", version: "2.0 Luxury" },
    { model: "Cerato", parent: "Cerato", version: "1.6 Luxury" },
  ]
};

for (const brand in brandFixes) {
  if (!carModels[brand]) continue;
  
  brandFixes[brand].forEach(fix => {
    if (carModels[brand][fix.model] !== undefined) {
      // Add parent model if it doesn't exist
      if (!carModels[brand][fix.parent]) {
        carModels[brand][fix.parent] = [];
      }
      
      // Add version to parent model
      if (!carModels[brand][fix.parent].includes(fix.version)) {
        carModels[brand][fix.parent].push(fix.version);
      }
      
      // Merge any existing versions from the old model
      if (Array.isArray(carModels[brand][fix.model])) {
        carModels[brand][fix.model].forEach(v => {
          if (!carModels[brand][fix.parent].includes(v)) {
            carModels[brand][fix.parent].push(v);
          }
        });
      }
      
      // Delete old model if it's different from parent
      if (fix.model !== fix.parent) {
        delete carModels[brand][fix.model];
      }
    }
  });
}

// 2. Add common versions for luxury empty arrays
const luxuryDefaults = {
  "Mercedes-Benz": {
    "C-Class": ["C200", "C200 Plus", "C300 AMG"],
    "E-Class": ["E180", "E200 Exclusive", "E300 AMG"],
    "GLC": ["GLC 200", "GLC 200 4MATIC", "GLC 300 4MATIC"],
  },
  "BMW": {
    "3": ["320i", "330i"],
    "4": ["420i", "430i"],
    "5": ["520i", "530i"],
    "7": ["730Li", "740Li"],
    "3 Series": ["320i Sport Line", "320i M Sport", "330i M Sport"],
    "5 Series": ["520i", "520i M Sport", "530i M Sport"],
    "X3": ["xDrive20i", "xDrive20i M Sport", "xDrive30i M Sport"],
    "X5": ["xDrive40i xLine", "xDrive40i M Sport", "xDrive40i xLine Plus"],
    "X1": ["sDrive18i xLine"],
    "X2": ["sDrive18i M Sport"],
    "X6": ["xDrive40i M Sport"],
    "X7": ["xDrive40i Pure Excellence"]
  },
  "MG": {
    "ZS": ["STD", "COM", "LUX"],
    "HS": ["1.5T 2WD Sport", "1.5T 2WD Trophy", "2.0T AWD Trophy"]
  }
};

for (const brand in luxuryDefaults) {
  if (!carModels[brand]) continue;
  for (const model in luxuryDefaults[brand]) {
    if (carModels[brand][model] && carModels[brand][model].length === 0) {
      carModels[brand][model] = luxuryDefaults[brand][model];
    }
  }
}

// 3. Remove "Mercedes" brand (duplicate of Mercedes-Benz)
if (carModels["Mercedes"]) {
  if (!carModels["Mercedes-Benz"]) carModels["Mercedes-Benz"] = {};
  for(const m in carModels["Mercedes"]) {
    let cleanM = m.replace("Benz ", "");
    if (!carModels["Mercedes-Benz"][cleanM]) {
      carModels["Mercedes-Benz"][cleanM] = ["Base"];
    }
  }
  delete carModels["Mercedes"];
}

const updatedContent = content.replace(regex, 'export const carModels = ' + JSON.stringify(carModels, null, 2) + ';');

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('Successfully updated carModels in valuationHelpers.js');
