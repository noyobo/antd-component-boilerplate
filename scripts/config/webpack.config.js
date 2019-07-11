const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const webpack = require('webpack');
const WebpackChain = require('webpack-chain');

const postcssConfig = require('./postcssConfig');
const babelConfig = require('../../babel.config');

const config = new WebpackChain();

config.mode('development');
config.devtool('#eval-source-map');

const pkgName = require('../../package.json').name;

config
  .entry('simple')
    .add('./demo/simple.js')
    .end()
  .output
    .path(path.resolve('dist'))
    .publicPath('/')
    .filename('[name].bundle.js');

config.resolve.alias
  .set(pkgName, path.join(__dirname, '../../src'))

config.module
  .rule('compile')
    .test(/\.js$/)
      .exclude
        .add(/\/node_modules\//)
        .end()
      .use('babel')
      .loader('babel-loader')
      .options(babelConfig);

config.module
  .rule('less')
    .test(/\.less$/)
      .use('mini-css')
      .loader(MiniCssExtractPlugin.loader)
      .end()
    .use('css')
      .loader('css-loader')
      .options({ sourceMap: true })
      .end()
    .use('postcss')
      .loader('postcss-loader')
      .options(Object.assign({}, postcssConfig, { sourceMap: true }))
      .end()
    .use('less')
      .loader('less-loader')
      .options({
        javascriptEnabled: true,
        sourceMap: true,
      })
      .end()

config
  .plugin('HotModuleReplacementPlugin')
    .use(webpack.HotModuleReplacementPlugin)
      .end()
  .plugin('NamedModulesPlugin')
    .use(webpack.NamedModulesPlugin)
      .end()
  .plugin('OccurrenceOrderPlugin')
    .use(webpack.optimize.OccurrenceOrderPlugin)
      .end()
  .plugin('NoEmitOnErrorsPlugin')
    .use(webpack.NoEmitOnErrorsPlugin)
      .end()
  .plugin('ProgressPlugin')
    .use(webpack.ProgressPlugin)
      .end()
  .plugin('MiniCssExtractPlugin')
    .use(MiniCssExtractPlugin, [{
      filename: '[name].css',
      chunkFilename: '[id].css',
    }])
      .end()

module.exports = config;
