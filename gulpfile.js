
const gulp = require("gulp");
const jshint = require("gulp-jshint");


const jsFiles = "src/**/*.js";


gulp.task("lint", function() {
  return gulp.src(jsFiles)
    .pipe(jshint())
    .pipe(jshint.reporter("default"));
});

gulp.task("default", ["lint"]);
