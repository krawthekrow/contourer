const gulp = require('gulp');
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

gulp.task('default', () => {
    return gutil.log('Gulp is running!');
});

gulp.task('build', () => {
    gulp.src([
        'src/utils/utils.js',
        'src/utils/canvasUtils.js',
        'src/utils/webglUtils.js',
        'src/utils/gpgpuUtils.js',
        'src/contourer.js',
        'src/demoFunctions.js',
        'src/reactComponents.jsx'
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('bundle.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('bin'));
});
