/// <binding Clean='clean' />
var gulp = require("gulp"),
  rimraf = require("rimraf"),
  concat = require("gulp-concat"),
  cssmin = require("gulp-cssmin"),
  sass = require("gulp-sass"),
  uglify = require("gulp-uglify"),
  watch = require("gulp-watch"),
  gulpMinifyCss = require('gulp-clean-css'),
  babel = require('gulp-babel'),
  sourcemaps = require('gulp-sourcemaps');
var paths = {
  webroot: "../sportpartner-files/src/Services/Files/Files.API/wwwroot/"
};

paths.js = paths.webroot + "js/**/*.js";
paths.jsSource = paths.webroot + "js.src/**/*.js";
paths.jsDest = paths.webroot + "js";
paths.minJs = paths.webroot + "js/**/*.min.js";

paths.css = paths.webroot + "css/**/*.css";
paths.minCss = paths.webroot + "css/**/*.min.css";
paths.concatJsDest = paths.webroot + "js/site.min.js";
paths.concatCssDest = paths.webroot + "css/site.min.css";
paths.scss = "./source/scss/style.scss";
paths._scss = "./source/scss/**/*.scss";

paths.commonjs = [
  paths.webroot + "js.src/ajaxcommon.js",
  paths.webroot + "js.src/_utils.js",
  paths.webroot + "js.src/_config.js",
  paths.webroot + "js.src/main.js",
  paths.webroot + "js.src/google/tracker.js",
  "!" + paths.webroot + "js.src/**/*.min.js"
];
paths.concatJsSite = paths.webroot + "js.min/sportpartner.common.min.js";

paths.minJsSource = [
  paths.jsSource,
  "!" + paths.webroot + "js.src/ajaxcommon.js",
  "!" + paths.webroot + "js.src/_utils.js",
  "!" + paths.webroot + "js.src/_config.js",
  "!" + paths.webroot + "js.src/main.js",
  "!" + paths.webroot + "js.src/google/tracker.js",
  "!" + paths.webroot + "js.src/**/*.min.js"
];

paths.cssSources = [
  `${paths.webroot}/css/style.css`,
  `${paths.webroot}/css/_override.css`,
  `${paths.webroot}/css/overlay.css`,
  `${paths.webroot}/css/croppie/_override.css`,
  `${paths.webroot}/css/sports-icon.css`,
];

paths.cssLibsSources = [
  `${paths.webroot}/lib/bootstrap-v4/bootstrap-v4.css`,
  `${paths.webroot}/lib/bootstrap-v4/bootstrap-slider.css`,
  `${paths.webroot}/lib/jquery-mmenu/jquery-mmenu-all.min.css`,
  `${paths.webroot}/lib/jquery-mhead/jquery-mhead.css`,
  `${paths.webroot}/lib/croppie/croppie.css`,
];

paths.minJsDest = paths.webroot + "js.min";

paths.concatCssSite = paths.webroot + "css/sportpartner.min.css";

paths.concatCssLibs = paths.webroot + "css/sportpartner-libs.min.css";

gulp.task("clean:js", function (cb) {
  rimraf(paths.concatJsDest, cb);
});

gulp.task("clean:css", function (cb) {
  rimraf(paths.concatCssDest, cb);
});

gulp.task("clean", ["clean:js", "clean:css"]);

gulp.task("sportpartner:common:min:js", function () {
  return gulp.src(paths.commonjs)
    .pipe(babel({
      presets: ["@babel/preset-env"],
      sourceType: "script"
    }))
    .pipe(concat(paths.concatJsSite))
    .pipe(uglify().on('error', function (e) {
      console.log(e);
    }))
    .pipe(gulp.dest("."));
});

gulp.task("min-js", function () {
  return gulp.src(paths.minJsSource)
    .pipe(babel({
      presets: ["@babel/preset-env"],
      sourceType: "script"
    }))
    .pipe(uglify())
    .pipe(gulp.dest(paths.minJsDest));
});

gulp.task('build:js', function () {
  return gulp.src([paths.jsSource])
    .pipe(babel({
      presets: ["@babel/preset-env"],
      sourceType: "script"
    }))
    .pipe(gulp.dest(paths.jsDest));
});

gulp.task("min-css", function () {
  return gulp.src(
    paths.cssSources
  )
    .pipe(concat(paths.concatCssSite))
    .pipe(gulpMinifyCss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'));
});

gulp.task("min-css-libs", function () {
  return gulp.src(
    paths.cssLibsSources
  )
    .pipe(concat(paths.concatCssLibs))
    .pipe(gulpMinifyCss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'));
});

paths.minJsLibs = paths.webroot + "js.min/sportpartner.libs.min.js";
paths.LibsJsSource = [
  paths.webroot + "lib/jquery/jquery-3.3.1.min.js",
  paths.webroot + "lib/jquery/jquery.auto-complete.min.js",
  paths.webroot + "lib/popper.min.js",
  paths.webroot + "lib/bootstrap-v4/bootstrap.min.js",
  paths.webroot + "lib/bootstrap-v4/bootstrap-slider.min.js",
  paths.webroot + "lib/jquery-mmenu/jquery.mmenu.all.js",
  paths.webroot + "lib/jquery-mhead/jquery.mhead.js",

  // Emoj picker
  paths.webroot + "lib/emoticon/emoji-picker.config.js",
  paths.webroot + "lib/emoticon/emoji-picker.util.js",
  paths.webroot + "lib/emoticon/jquery.emojiarea.min.js",
  paths.webroot + "lib/emoticon/emoji-picker.js",

  paths.webroot + "lib/jquery.cookie/jquery.cookie.js",
  paths.webroot + "lib/jquery.ba-outside-events.min.js",
  paths.webroot + "lib/bodyscrolllock.js"
];
gulp.task("min-js-libs", function () {
  return gulp.src(paths.LibsJsSource)
    .pipe(babel({
      presets: ["@babel/preset-env"],
      sourceType: "script"
    }))
    .pipe(concat(paths.minJsLibs))
    .pipe(uglify().on('error', function (e) {
      console.log(e);
    }))
    .pipe(gulp.dest("."));
});

gulp.task("min", ["sportpartner:common:min:js", "min-js-libs"]);

gulp.task("build", ["min", "build:js"]);

gulp.task("scss", function () {
  return gulp.src([paths.scss])
    .pipe(sourcemaps.init({
      largeFile: true
    }))
    .pipe(sourcemaps.write())
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest(`${paths.webroot}css/`));
});

gulp.task('watchJs', function () {
  gulp.watch(paths.jsSource, ['build:js']);
});

gulp.task('watchScss', function () {
  gulp.watch(paths._scss, ['scss']);
});

gulp.task("watchUI", ["watchJs", "watchScss"]);
