#!/usr/bin/env node

const chalk = require('chalk');
const express = require('express');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const openBrowser = require('react-dev-utils/openBrowser');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

const prepareUrLs = require('./lib/prepareURLs');

const webpackConfig = require('./config/webpack.config');

const pageView = path.resolve(__dirname, './views/page.html');
const indexView = path.resolve(__dirname, './views/index.ejs');

const componentName = path.basename(process.cwd());

const demos = glob.sync('./demo/*.js');

/* eslint-disable no-console */
const chunks = demos.map((file) => {
  const chunkName = path.basename(file).replace(path.extname(file), '');
  return [chunkName, file];
});

chunks.forEach(([chunkName, file]) => {
  webpackConfig
    .entry(chunkName)
    .add('webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000')
    .add(file)
    .end();
});

chunks.forEach(([chunkName]) => {
  webpackConfig
    .plugin(`page-${chunkName}`)
    .use(HtmlWebpackPlugin, [
      {
        excludeChunks: chunks.filter((c) => c[0] !== chunkName).map((c) => c[0]),
        filename: `${chunkName}.html`,
        inject: true,
        templateParameters: { chunks },
        template: pageView,
        minify: false,
      },
    ])
    .end();
});

webpackConfig.devtool('#eval-source-map');

webpackConfig
  .plugin(`page-index`)
  .use(HtmlWebpackPlugin, [
    {
      excludeChunks: chunks.map((c) => c[0]),
      filename: `index.html`,
      templateParameters: { chunks, componentName },
      template: indexView,
      minify: false,
    },
  ])
  .end();

webpackConfig.plugin('dll').use(webpack.DllReferencePlugin, [
  {
    context: path.join(__dirname, '../src'),
    // eslint-disable-next-line global-require
    manifest: require('./dll/vendor-manifest.json'),
  },
]);

const compiler = webpack(webpackConfig.toConfig());
const HOST = '0.0.0.0';
const PORT = process.env.PORT || 8088;
let isFirstCompile = true;
const urls = prepareUrLs('http', HOST, PORT);
compiler.hooks.done.tap('done', (stats) => {
  if (isFirstCompile) {
    console.log('');
    console.log(chalk.cyan('Starting the development server...'));
    console.log(
      [
        `    - Local:   ${chalk.yellow(urls.localUrlForTerminal)}`,
        `    - Network: ${chalk.yellow(urls.lanUrlForTerminal)}`,
      ].join('\n')
    );
    isFirstCompile = false;
    openBrowser(urls.localUrlForBrowser);
  }
  const rawMessages = stats.toJson({}, true);
  const messages = formatWebpackMessages(rawMessages);
  if (!messages.errors.length && !messages.warnings.length) {
    console.log('Compiled successfully!');
    console.log(
      stats.toString({ colors: true, chunks: false, assets: true, children: false, modules: false })
    );
  }
  if (messages.errors.length) {
    console.log('Failed to compile.');
    messages.errors.forEach((e) => console.log(e));
    return;
  }
  if (messages.warnings.length) {
    console.log('Compiled with warnings.');
    messages.warnings.forEach((w) => console.log(w));
  }
});

compiler.hooks.invalid.tap('invalid', () => {
  console.log('Compiling...');
});

const app = express();
app.use(express.static(path.join(__dirname, 'dll')));
app.use(webpackDevMiddleware(compiler, { logLevel: 'silent' }));
app.use(
  webpackHotMiddleware(compiler, { log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000 })
);

app.listen(PORT, HOST, (err) => {
  if (err) {
    console.error(err);
    process.exit(500);
  }
});
