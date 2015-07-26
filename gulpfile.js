var gulp = require('gulp');
var browserify = require('browserify');
var reactify = require('reactify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var dist = 'app/assets/javascripts';

gulp.task('background', function() {
  var b =  browserify('app/src/background.js');
  return b.bundle()
    .pipe(source('background.bundle.js'))
    .pipe(gulp.dest(dist));
});

gulp.task('popup', function() {
  var b = browserify({
    entries: 'app/src/popup.jsx',
    transform: [reactify]
  });
  return b.bundle()
    .pipe(source('popup.bundle.js'))
    .pipe(gulp.dest(dist));
});

gulp.task('oauth', function() {
  var b = browserify('app/src/oauth.js')
  return b.bundle()
    .pipe(source('oauth.bundle.js'))
    .pipe(gulp.dest(dist))
});

gulp.task('build_prod', ['build'], function() {
  gulp.src('app/assets/javascripts/*.bundle.js')
    .pipe(uglify())
    .pipe(gulp.dest('app/assets/javascripts'));
});

gulp.task('build', ['background', 'popup', 'oauth']);

gulp.task('watch', function() {
  gulp.watch(['app/src/*.js', 'app/src/*.jsx'], ['build']);
});

gulp.task('default', ['watch', 'build']);
gulp.task('prod', ['build_prod']);
