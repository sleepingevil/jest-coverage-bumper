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
    let decimals = config.jestCoverageBumper ? parseInt(config.jestCoverageBumper.decimals) : 2;

    if (isNaN(decimals) || (decimals < 0) || (decimals > 10)) {
      console.warn(`jest-coverage-bumper: Invalid precision: "${config.jestCoverageBumper.decimals}".\nFalling back to 2 decimals.\nThe precision must be between 0 and 10 decimals.\nPlease update package.json > jestCoverageBumper > decimals.`);
      decimals = 2;
    }

    [
      'statements',
      'branches',
      'functions',
      'lines',
    ].forEach(key => {
      const multiplier = Math.pow(10, decimals);
      const actualCovered = parseFloat(Math.floor((actuals[key].covered / actuals[key].total) * 100 * multiplier) / multiplier);
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
