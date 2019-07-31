const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const deleteEmpty = require('delete-empty');

const packages = {
  common: ts.createProject('packages/common/tsconfig.json'),
  core: ts.createProject('packages/core/tsconfig.json'),
  express: ts.createProject('packages/express/tsconfig.json'),
  rest: ts.createProject('packages/rest/tsconfig.json'),
};
const modules = Object.keys(packages);
const source = 'packages';
const distId = process.argv.indexOf('--dist');
const dist = distId < 0 ? source : process.argv[distId + 1];

gulp.task('default', function () {
  modules.forEach(module => {
    gulp.watch(
      [`${source}/${module}/**/*.ts`, `${source}/${module}/*.ts`],
      [module],
    );
  });
});

gulp.task('copy-misc', function () {
  return gulp
    .src([
      'README.md',
      'LICENSE',
      '.npmignore'
    ])
    .pipe(gulp.dest(`${source}/common`))
    .pipe(gulp.dest(`${source}/core`))
    .pipe(gulp.dest(`${source}/express`))
    .pipe(gulp.dest(`${source}/rest`))
});

gulp.task('clean:output', function () {
  return gulp
    .src(
      [
        `${source}/**/*.js`,
        `${source}/**/*.d.ts`,
        `${source}/**/*.js.map`,
        `!${source}/**/test/**`
      ],
      {
        read: false,
        allowEmpty: true
      },
    )
    .pipe(clean());
});

gulp.task('clean:dirs', function (done) {
  deleteEmpty.sync(`${source}/`);
  done();
});

gulp.task('clean:bundle', gulp.series('clean:output', 'clean:dirs'));

modules.forEach(module => {
  gulp.task(module, () => {
    return packages[module]
      .src()
      .pipe(packages[module]())
      .pipe(gulp.dest(`${dist}/${module}`));
  });
});

modules.forEach(module => {
  gulp.task(module + ':dev', () => {
    return packages[module]
      .src()
      .pipe(sourcemaps.init())
      .pipe(packages[module]())
      .pipe(
        sourcemaps.mapSources(sourcePath => './' + sourcePath.split('/').pop()),
      )
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(`${dist}/${module}`));
  });
});

modules.forEach(module => {
  gulp.task(module + ':dev:copy', () => {
    return gulp
      .src([
        `packages/${module}/package.json`,
      ])
      .pipe(gulp.dest(`${dist}/${module}`))
  });
});

gulp.task('common:dev', gulp.series(modules.map(module => module + ':dev')));
gulp.task('common:dev:copy', gulp.series(modules.map(module => module + ':dev:copy')));

gulp.task('build', gulp.series(modules));
gulp.task('build:dev', gulp.series('common:dev', 'common:dev:copy'));
