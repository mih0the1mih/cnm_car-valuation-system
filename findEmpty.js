const h = require('./frontend/src/utils/valuationHelpers.js');
const result = [];
for(const b in h.carModels) {
  for(const m in h.carModels[b]) {
    if(h.carModels[b][m].length === 0) {
      result.push(`${b} ${m}`);
    }
  }
}
console.log(result.join('\n'));
