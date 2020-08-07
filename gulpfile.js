"use strict";

// Load plugins
const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const minifyCSS = require('gulp-csso');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const del = require('del');

// Directories here
const paths = {
    src: './src/**/*.ts',
    dist: './dist',
    views: './views/**/*.pug',
    assets: './public'
};

// Scripts
function scripts() {
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest(paths.dist));
}

// Views
function views() {
    return gulp.src(paths.views)
        .pipe(gulp.dest(paths.dist + '/views/'));
}

// CSS task
function styles() {
    return gulp.src(paths.assets+'/style/*.scss')
        .pipe(sourcemaps.init())
        // Stay live and reload on error
        .pipe(plumber({
            handleError: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(sass({ outputStyle: "expanded" }))
        .pipe(autoprefixer(['last 15 versions','> 1%','ie 8','ie 7','iOS >= 9','Safari >= 9','Android >= 4.4','Opera >= 30'], {
            cascade: true
        }))
        .pipe(minifyCSS())
        .pipe(concat('style.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist+'/'+paths.assets + '/style'));
}

// Fonts
function fonts() {
    return gulp.src(paths.assets+'/fonts/**/*')
        .pipe(gulp.dest(paths.dist+'/'+paths.assets + '/fonts'));
};


// Watch files
function watchFiles() {
    gulp.watch(paths.src, gulp.series(scripts));
    gulp.watch(paths.views, gulp.series(views));
    gulp.watch(paths.assets+'/style/*.scss', gulp.series(styles));
}

// Define complex tasks
const build = gulp.parallel(scripts, views, styles, fonts);
const watch = gulp.parallel(watchFiles);

// Export tasks
exports.scripts = scripts;
exports.views = views;
exports.styles = styles;
exports.fonts = fonts;
exports.build = build;
exports.watch = watch;
exports.default = build;
