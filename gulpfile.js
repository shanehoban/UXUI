var gulp = require("gulp"),                  // Gulp itself.
    rimraf = require("rimraf"),              // For deleting folders recursively.
    concat = require("gulp-concat"),         // For file concatenation.
    cssmin = require("gulp-cssmin"),         // For CSS minification.
 	less = require('gulp-less'),
    uglify = require("gulp-uglify");         // For JS uglification.

var Server = require('karma').Server;

// Define a helper object, to point to various paths in our project.
var paths = {
    webroot: "./"
};
paths.js = paths.webroot + "js/**/*.js";
paths.minJs = paths.webroot + "js/**/*.min.js";
paths.css = paths.webroot + "styles/css/**/*.css";
paths.less = paths.webroot + "styles/less/**/*.less";
paths.minCss = paths.webroot + "styles/css/**/*.min.css";
paths.concatJsDest = paths.webroot + "site/site.min.js";
paths.concatCssDest = paths.webroot + "site/site.min.css";

// Tasks to clean folders and files.
gulp.task("clean:js", function (cb) {
    rimraf(paths.concatJsDest, cb);
});

gulp.task("clean:css", function (cb) {
    rimraf(paths.concatCssDest, cb);
});

gulp.task("clean", ["clean:js", "clean:css"]);

// Tasks to minify CSS files and uglify JS files.
gulp.task("min:js", function () {
    gulp.src([paths.js, "!" + paths.minJs], { base: "." })
        .pipe(concat(paths.concatJsDest))
        .pipe(uglify())
        .pipe(gulp.dest("."));
});

gulp.task('less', function () {
  return gulp.src(paths.less)
    .pipe(less())
    .pipe(gulp.dest('./css'));
});

gulp.task("min:css", function () {
    gulp.src([paths.css, "!" + paths.minCss])
        .pipe(concat(paths.concatCssDest))
        .pipe(cssmin())
        .pipe(gulp.dest("."));
});

gulp.task("minify", ["min:js", "less", "min:css"]);

gulp.task('test-karma', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task("create", ["clean", "minify"]);

gulp.task("build",["create","test-karma"]);