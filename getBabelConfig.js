module.exports = (modules = true) => ({
  presets: [
    [
      '@babel/preset-env',
      {
        modules: modules === false ? false : 'auto',
        targets: {
          browsers: [
            'last 2 versions',
            'Firefox ESR',
            '> 1%',
            'ie >= 9',
            'iOS >= 8',
            'Android >= 4',
          ],
        },
      },
    ],
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-object-assign',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-export-namespace-from',
    ['babel-plugin-transform-react-remove-prop-types', { mode: 'wrap' }],
    ['babel-plugin-import', { libraryName: 'antd', style: true }, 'antd-plus'],
    ['babel-plugin-styled-components', { displayName: true, minify: true, pure: true }],
  ],
});
