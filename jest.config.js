module.exports = {
  collectCoverage: true,
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
  moduleDirectories: ['node_modules', 'packages'],
  moduleNameMapper: {
    '\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': '<rootDir>/__mocks__/styleMock.js',
  },
  transform: {
    '\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
};
