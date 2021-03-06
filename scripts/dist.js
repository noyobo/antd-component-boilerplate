const babel = require('gulp-babel');
const gulp = require('gulp');
const gulpTypescript = require('gulp-typescript');
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

function compileJsx(modules) {
  let stream = gulp.src([
    'components/**/*.js',
    'components/**/*.jsx',
    '!components/**/__tests__/**/*',
  ]);

  return babelify(stream, modules).on('end', () => {
    log('jsx compiled', { modules });
  });
}

function compileTsx(modules) {
  const output = modules === false ? esDir : libDir;
  const tsProject = gulpTypescript.createProject('tsconfig.json');
  const tsResult = gulp
    .src(['components/**/*.ts', 'components/**/*.tsx', 'components/**/*.d.ts'])
    .pipe(tsProject());

  tsResult.dts.pipe(gulp.dest(output)).on('end', () => {
    log('dts generate done!');
  });

  return babelify(tsResult.js, modules).on('end', () => {
    log('tsx compiled', { modules });
  });
}

function babelify(js, modules) {
  const output = modules === false ? esDir : libDir;
  const babelConfig = getBabelConfig(modules);
  delete babelConfig.cacheDirectory;
  if (modules === false) {
    babelConfig.plugins.push(replaceLib);
  } else {
    babelConfig.plugins.push(require.resolve('babel-plugin-add-module-exports'));
  }

  let stream = js.pipe(babel(babelConfig)).pipe(
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
  return stream.pipe(gulp.dest(output));
}

function compile(modules) {
  const output = modules === false ? esDir : libDir;
  const less = gulp
    .src(['components/**/*.less'])
    .pipe(
      through2.obj(function(file, encoding, next) {
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
    .src(['components/**/*.@(png|svg)'])
    .pipe(gulp.dest(output))
    .on('end', () => {
      log('assets compiled', { modules });
    });
  const js = compileJsx(modules);
  const ts = compileTsx(modules);
  return merge2([less, assets, js, ts]);
}

compile(true);
compile(false);
