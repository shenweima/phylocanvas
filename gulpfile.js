var gulp = require('gulp');
var react = require('gulp-react');
var less = require('gulp-less');
var changed = require('gulp-changed');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var minify = require('gulp-minify-css');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var concat = require('gulp-concat');

var taskPaths = {
	js: {
		src: './private/js/**/*.js',
		dest: './public/js'
	},
	less: {
		src: './private/less/**/*.less',
		dest: './public/css'
	}
};

var watchPaths = {
	js: [taskPaths.js.src],
	less: [taskPaths.less.src]
};

gulp.task('js', function() {
	//
	// File order is important.
	// We want client.js to be the last one because it depends on all other libraries.
	//
    return gulp.src(['./private/js/lib/**/*.js', './private/js/client.js'])
    	//.pipe(sourcemaps.init())
    	.pipe(uglify())
    	//.pipe(jshint())
    	//.pipe(jshint.reporter('jshint-stylish'))
    	.pipe(concat('wgsa.js'))
    	//.pipe(sourcemaps.write())
        .pipe(gulp.dest(taskPaths.js.dest));
});

gulp.task('less', function() {
  	return gulp.src(taskPaths.less.src)
	    .pipe(less())
	    .pipe(sourcemaps.init())
	    .pipe(minify())
	    //.pipe(rename('wgsa.min.css'))
	    .pipe(sourcemaps.write())
    	.pipe(gulp.dest(taskPaths.less.dest));
});

gulp.task('watch', function() {
	gulp.watch(watchPaths.js, ['js']);
	gulp.watch(watchPaths.less, ['less']);
});

gulp.task('default', ['watch', 'js', 'less']);