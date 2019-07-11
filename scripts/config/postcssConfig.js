const autoprefixer = require('autoprefixer');
const rucksack = require('rucksack-css');

module.exports = {
  plugins: [
    rucksack(),
    autoprefixer({
      overrideBrowserslist: [
        'last 2 versions',
        'Firefox ESR',
        '> 1%',
        'ie >= 9',
        'iOS >= 8',
        'Android >= 4',
      ],
    }),
  ],
};
