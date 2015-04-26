var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var webpack = require('gulp-webpack');

gulp.task('css', function() {
  gulp.src('src/sass/main.scss')
    .pipe(sass())
    .pipe(autoprefixer('last 10 version'))
    .pipe(gulp.dest('build'));
});

// Builds the production bundle.js -- no hot server
gulp.task('webpack', function() {
  return gulp.src('src/js/app.js')
    .pipe(webpack( require('./webpack.config.production.js') ))
    .pipe(gulp.dest('build/'));
});

// Watch css only
gulp.task('watch', function() {
  gulp.watch('src/sass/**/*.scss', ['css']);
});

gulp.task('build', ['css', 'webpack']);