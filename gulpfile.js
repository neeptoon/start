"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var csso = require("gulp-csso");
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var htmlmin = require("gulp-htmlmin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");
var tinypng = require('gulp-tinypng-compress');

gulp.task("css", function () {
    return gulp
        .src("source/sass/style.scss")
        .pipe(plumber())
        .pipe(sourcemap.init())
        .pipe(sass())
        .pipe(postcss([autoprefixer()]))
        .pipe(csso())
        .pipe(rename("style.min.css"))
        .pipe(sourcemap.write("."))
        .pipe(gulp.dest("build/css", "source/css"));
});

gulp.task("server", function () {
    server.init({
        server: "build/"
    });

    gulp.watch("source/sass/**/*.scss", gulp.series("css", "refresh"));
    gulp.watch("source/img/icon-*.svg", gulp.series("sprite", "html", "refresh"));
    gulp.watch("source/*.html", gulp.series("html", "refresh"));
    gulp.watch("source/js/*.js", gulp.series("js", "refresh"));
});

gulp.task("refresh", function (done) {
    server.reload();
    done();
});

gulp.task("images", function () {
    return gulp
        .src("source/img/**/*.{png,jpg,svg}")
        .pipe(
            imagemin([
                imagemin.optipng({optimizationLevel: 3}),
                imagemin.jpegtran({progressive: true}),
                imagemin.svgo()
            ])
        )
        .pipe(gulp.dest("source/img"));
});

gulp.task('tinypng', function () {
    return gulp
        .src("source/img/**/*.{png,jpg,svg,webp}")
        .pipe(tinypng({
            key: 'Jzrv9pk1jSn6nCY4N9ZGK1Txlk1p2TW5',
            sigFile: 'source/img/.tinypng-sigs',
            sameDest: true,
            summarize: true,
            parallelMax: 100,
            log: true
        }))
        .pipe(gulp.dest("source/img"));
});

gulp.task("webp", function () {
    return gulp
        .src("source/img/**/*.{png,jpg}")
        .pipe(webp({quality: 90}))
        .pipe(gulp.dest("source/img"));
});

gulp.task("sprite", function () {
    return gulp
        .src("source/img/icon-*.svg")
        .pipe(
            svgstore({
                inlineSvg: true
            })
        )
        .pipe(rename("sprite.svg"))
        .pipe(gulp.dest("build/img"));
});

gulp.task("html", function () {
    return gulp
        .src("source/*.html")
        .pipe(posthtml([include()]))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest("build"));
});

gulp.task("js", function () {
    return gulp
        .src("source/js/*.js")
        // .pipe(uglify()) turn on for es-5 minify
        .pipe(gulp.dest("build/js"));
});

gulp.task("copy", function () {
    return gulp
        .src(
            [
                "source/fonts/**/*.{woff,woff2}",
                "source/img/**",
                "source/*.ico"
            ],
            {
                base: "source"
            }
        )
        .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
    return del("build");
});

gulp.task("build", gulp.series("clean", "copy", "css", "sprite", "html", "js"));
gulp.task("start", gulp.series("build", "server"));
