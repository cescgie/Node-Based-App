"use strict";

// Load plugins
const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

// Directories here
const paths = {
    src: './src/**/*.ts',
    dist: './dist',
    views: './views/**/*.pug'
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

// Watch files
function watchFiles() {
    gulp.watch(paths.src, gulp.series(scripts));
    gulp.watch(paths.views, gulp.series(views));
}

// Define complex tasks
const build = gulp.parallel(scripts, views);
const watch = gulp.parallel(watchFiles);

// Export tasks
exports.scripts = scripts;
exports.views = views;
exports.build = build;
exports.watch = watch;
exports.default = build;
