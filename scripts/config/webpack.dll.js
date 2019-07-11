const path = require('path');
const webpack = require('webpack');
// 源码目录
module.exports = {
  mode: 'development',

  entry: {
    // 定义程序中打包公共文件的入口文件vendor.js
    vendor: [path.join(__dirname, '../dll', 'vendor.js')],
  },

  output: {
    path: path.join(__dirname, '../dll'),
    filename: '[name].dll.js',
    library: '[name]_[hash]',
    libraryTarget: 'this',
  },

  plugins: [
    new webpack.DllPlugin({
      context: path.join(__dirname, '../../src'),
      // manifest.json文件的输出位置
      path: path.join(__dirname, '../dll', '[name]-manifest.json'),
      // 定义打包的公共vendor文件对外暴露的函数名
      name: '[name]_[hash]',
    }),
  ],
};
