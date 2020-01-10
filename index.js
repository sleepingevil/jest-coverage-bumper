const writePkg = require('write-pkg');
const path = require('path');

module.exports = function (results) {
  const dir = process.env.PWD || process.cwd();
  const file = path.join(dir, 'package');
  const config = require(file);
  let modified = false;

  if (results.coverageMap) {
    const actuals = results.coverageMap.getCoverageSummary().toJSON();
    const thresholds = config.jest.coverageThreshold.global;
    [
      'statements',
      'branches',
      'functions',
      'lines',
    ].forEach(key => {
      const actualCovered = parseFloat(((actuals[key].covered / actuals[key].total) * 100).toFixed(2));
      const actualThreshold = Math.abs(thresholds[key]);

      if (actualCovered > actualThreshold) {
        modified = true;
        config.jest.coverageThreshold.global[key] = actualCovered;
      }
    });

    if (modified) {
      delete config.jest.rootDir;
      writePkg.sync(config, {normalize: false});
      console.log('Modified package.json to reflect new coverage thresholds');
    }
  }

  return results;

};
