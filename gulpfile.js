var gulp = require('gulp'),
	react = require('gulp-react'),
	less = require('gulp-less'),
	changed = require('gulp-changed'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	sourcemaps = require('gulp-sourcemaps'),
	minify = require('gulp-minify-css'),
	jshint = require('gulp-jshint'),
	stylish = require('jshint-stylish');

var taskPaths = {
	react: {
		src: './private/js/react-components/**/*.js',
		dest: './public/js/react-components'
	},
	scripts: {
		src: './private/js/*.js',
		dest: './public/js'
	},
	less: {
		src: './private/less/**/*.less',
		dest: './public/css'
	}
};

var watchPaths = {
	reactComponents: [taskPaths.react.src],
	scripts: [taskPaths.scripts.src],
	less: ['./private/less/**/*.less']
};

gulp.task('react', function() {
    return gulp.src(taskPaths.react.src)
    	.pipe(react())
        .pipe(gulp.dest(taskPaths.react.dest));
});

gulp.task('scripts', function() {
    return gulp.src(taskPaths.scripts.src)
    	//.pipe(sourcemaps.init())
    	//.pipe(uglify())
    	//.pipe(jshint())
    	//.pipe(jshint.reporter('jshint-stylish'))
    	.pipe(rename('wgsa.min.js'))
    	//.pipe(sourcemaps.write())
        .pipe(gulp.dest(taskPaths.scripts.dest));
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

// Rerun the task when a file changes
gulp.task('watch', function() {
 	gulp.watch(watchPaths.reactComponents, ['react']);
	gulp.watch(watchPaths.scripts, ['scripts']);
	gulp.watch(watchPaths.less, ['less']);
});

gulp.task('default', ['watch', 'react', 'scripts', 'less']);