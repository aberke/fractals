
var gulp = require("gulp");
// babel compiles ES6 javascript to be compatible with older browsers
const babel = require("gulp-babel");
const jshint = require("gulp-jshint");


const jsFiles = "src/**/*.js";
const destination = "./dist";


gulp.task("lint", function() {
  return gulp.src(jsFiles)
    .pipe(jshint())
    .pipe(jshint.reporter("default"));
});


/** Build Tasks **/

gulp.task("js", function (cb) {
  return gulp.src([jsFiles])
    .pipe(babel())
    .pipe(gulp.dest(destination))
});

/** Build Tasks **/


gulp.task("build", ["js"]);

gulp.task("default", ["build", "lint"]);
