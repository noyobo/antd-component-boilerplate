/* eslint-disable no-param-reassign */
const babel = require('gulp-babel');
const gulp = require('gulp');
const log = require('fancy-log');
const merge2 = require('merge2');
const path = require('path');
const rimraf = require('rimraf');
const stripCode = require('gulp-strip-code');
const through2 = require('through2');

const transformLess = require('./lib/transformLess');
const cssInjection = require('./lib/cssInjection');
const replaceLib = require('./lib/replaceLib');
const getBabelConfig = require('../getBabelConfig.js');

const cwd = process.cwd();
const libDir = path.join(cwd, 'lib');
const esDir = path.join(cwd, 'es');

rimraf.sync(libDir);
rimraf.sync(esDir);

log('clean output done.');

function babelify(modules) {
  const output = modules === false ? esDir : libDir;
  const babelConfig = getBabelConfig(modules);
  delete babelConfig.cacheDirectory;
  if (modules === false) {
    babelConfig.plugins.push(replaceLib);
  } else {
    babelConfig.plugins.push(require.resolve('babel-plugin-add-module-exports'));
  }

  let stream = gulp
    .src(['src/**/*.js', 'src/**/*.jsx', '!src/**/__tests__/**/*', '!src/*/demo/**/*'])
    .pipe(babel(babelConfig))
    .pipe(
      through2.obj(function z(file, encoding, next) {
        this.push(file.clone());
        if (file.path.match(/(\/|\\)style(\/|\\)index\.js/)) {
          const content = file.contents.toString(encoding);

          file.contents = Buffer.from(cssInjection(content));
          file.path = file.path.replace(/index\.js/, 'css.js');
          this.push(file);
          next();
        } else {
          next();
        }
      })
    );
  if (modules === false) {
    stream = stream.pipe(
      stripCode({
        start_comment: '@remove-on-es-build-begin',
        end_comment: '@remove-on-es-build-end',
      })
    );
  }
  return stream.pipe(gulp.dest(output)).on('end', () => {
    log('babel compiled', { modules });
  });
}

function compile(modules) {
  const output = modules === false ? esDir : libDir;
  const less = gulp
    .src(['src/**/*.less'])
    .pipe(
      through2.obj(function compileLess(file, encoding, next) {
        this.push(file.clone());
        if (file.path.match(/(\/|\\)style(\/|\\)index\.less$/)) {
          transformLess(file.path)
            .then((css) => {
              file.contents = Buffer.from(css);
              file.path = file.path.replace(/\.less$/, '.css');
              this.push(file);
              next();
            })
            .catch((e) => {
              log.error(e);
            });
        } else {
          next();
        }
      })
    )
    .pipe(gulp.dest(output))
    .on('end', () => {
      log('less compiled', { modules });
    });
  const assets = gulp
    .src(['src/**/*.@(png|svg)'])
    .pipe(gulp.dest(output))
    .on('end', () => {
      log('assets compiled', { modules });
    });
  const js = babelify(modules);
  return merge2([js, less, assets]);
}

compile(true);
compile(false);
