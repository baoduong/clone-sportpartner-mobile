const gulp = require('gulp');
let { parallel } = require('gulp');

const
  sass = require("gulp-sass"),
  uglify = require("gulp-uglify"),
  babel = require('gulp-babel'),
  concat = require("gulp-concat"),
  gulpMinifyCss = require('gulp-clean-css'),
  CleanCSS = require('clean-css');
sourcemaps = require('gulp-sourcemaps');

const paths = {
  webroot: "../sportpartner-files/src/Services/Files/Files.API/wwwroot/",
};

paths.css = paths.webroot + "css/**/*.css";
paths.minCss = paths.webroot + "css/**/*.min.css";
paths.concatJsDest = paths.webroot + "js/site.min.js";
paths.concatCssDest = paths.webroot + "css/site.min.css";
paths.desktopScss = "./source/scss/style.scss";
paths.mobileScss = "./source/scss/style.mobile.scss";
paths._scss = "./source/scss/**/*.scss";

const cssSources = [
  `${paths.webroot}/css/_override.css`,
  `${paths.webroot}/css/overlay.css`,
  `${paths.webroot}/css/croppie/_override.css`,
  `${paths.webroot}/css/sports-icon.css`
];

paths.cssDesktopSources = [
  `${paths.webroot}/css/style.css`,
  ...cssSources
];

paths.cssMobileSources = [
  `${paths.webroot}/css/style.mobile.css`,
  ...cssSources
];

paths.cssLibsSources = [
  `${paths.webroot}/lib/bootstrap-v4/bootstrap-v4.css`,
  `${paths.webroot}/lib/bootstrap-v4/bootstrap-slider.css`,
  `${paths.webroot}/lib/jquery-mmenu/jquery-mmenu-all.min.css`,
  `${paths.webroot}/lib/jquery-mhead/jquery-mhead.css`,
  `${paths.webroot}/lib/croppie/croppie.css`,
];

paths.concatDesktopCssSite = paths.webroot + "css/sportpartner.min.css";
paths.concatMobileCssSite = paths.webroot + "css/sportpartner.mobile.min.css";

paths.concatCssLibs = paths.webroot + "css/sportpartner-libs.min.css";

function desktopScss() {
  return gulp.src([paths.desktopScss])
    .pipe(sourcemaps.init({
      largeFile: true
    }))
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    // .pipe(gulpMinifyCss())
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest(`${paths.webroot}css/`));
}

function mobileScss() {
  return gulp.src([paths.mobileScss])
    .pipe(sourcemaps.init({
      largeFile: true
    }))
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    // .pipe(gulpMinifyCss())
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest(`${paths.webroot}css/`));
}

function minDesktopCss() {
  return gulp.src(paths.cssDesktopSources)
    .pipe(concat(paths.concatDesktopCssSite))
    .pipe(gulpMinifyCss())
    .pipe(gulp.dest('.'));
}

function minMobileCss() {
  return gulp.src(paths.cssMobileSources)
    .pipe(concat(paths.concatMobileCssSite))
    .pipe(gulpMinifyCss())
    .pipe(gulp.dest('.'));
}

function cleanMobileCss() {
  return gulp.src(paths.cssMobileSources)
    .pipe(CleanCSS({ compatibility: 'ie9', advanced: false }))
    .pipe(gulp.dest('.'));
}

function minCssLibs() {
  return gulp.src(paths.cssLibsSources)
    .pipe(concat(paths.concatCssLibs))
    .pipe(gulpMinifyCss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'));
}

function defaultTask(cb) {
  // place code for your default task here
  cb();
}

exports.mobileScss = mobileScss;
exports.desktopScss = desktopScss;

exports.cleanMobileCss = cleanMobileCss;

exports.default = defaultTask;

paths.js = paths.webroot + "js/**/*.js";
paths.jsSource = paths.webroot + "js.src/**/*.js";
paths.jsDest = paths.webroot + "js";
paths.minJs = paths.webroot + "js/**/*.min.js";

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

paths.minJsDest = paths.webroot + "js.min";

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


// gulp.task("min-js-libs");
function minJsLibs() {
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
}

// sportpartner:common:min:js
function minCommonJs() {
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
}

// min-js
function minJsSource() {
  return gulp.src(paths.minJsSource)
    .pipe(babel({
      presets: ["@babel/preset-env"],
      sourceType: "script"
    }))
    .pipe(uglify())
    .pipe(gulp.dest(paths.minJsDest));
}

// build:js
function buildJs() {
  return gulp.src([paths.jsSource])
    .pipe(babel({
      presets: ["@babel/preset-env"],
      sourceType: "script"
    }))
    .pipe(gulp.dest(paths.jsDest));
}

exports.buildJs = buildJs;
exports.minJsSource = minJsSource;
exports.minCommonJs = minCommonJs;
exports.minJsLibs = minJsLibs;

exports.prod = parallel(minJsSource, minCommonJs, minJsLibs, minMobileCss, minDesktopCss, minCssLibs);

// New themes v2.0
paths.bootstrapV2 = "./source/scss/styles-v20/bootstrap-theme/bootstrap.scss";
paths.stylesScssV20 = "./source/scss/styles-v20/styles-v20.scss";
paths.invitationPage = "./source/scss/styles-v20/invitationPage.scss";
paths.fixesMatchesListV2 = "./source/scss/styles-v20/fixesMatchesListV2.scss";
paths.topCommonHeaderPage = "./source/scss/styles-v20/topCommonHeaderPage.scss";
paths._scss_V_20 = "./source/scss/**/*.scss";

function stylesScssV20() {
  return gulp.src([
    paths.bootstrapV2,
    paths.stylesScssV20,
    paths.invitationPage,
    paths.topCommonHeaderPage,
    paths.fixesMatchesListV2
  ])
    .pipe(sourcemaps.init({
      largeFile: true
    }))
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    // .pipe(gulpMinifyCss())
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest(`${paths.webroot}theme-v20/css`));
}

exports.stylesScssV20 = stylesScssV20;
exports.scss = parallel(mobileScss, desktopScss, stylesScssV20);
exports.mincss = parallel(minMobileCss, minDesktopCss, minCssLibs);

function watchScss() {
  return gulp.watch([
    paths._scss
  ], stylesScssV20);
}

exports.watch = watchScss;
