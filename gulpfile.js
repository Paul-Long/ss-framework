const gulp = require('gulp');
const path = require('path');
const fs = require('fs');
const content = fs.readFileSync(path.resolve(__dirname, './package.json'));
let packageJson = JSON.parse(content);

gulp.task('copy-theme', function () {
  return gulp.src(['src/theme/**',
    '!src/theme/ant.js',
  ]).pipe(gulp.dest('dist/theme'));
});

gulp.task('build', ['copy-theme'], function () {
  delete packageJson.scripts;
  packageJson.main = 'index.js';
  fs.writeFileSync(path.resolve(__dirname, './dist/package.json'), JSON.stringify(packageJson, null, 2));
});
