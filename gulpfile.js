var gulp = require('gulp');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var debug = require('gulp-debug');
var Promise = require('promise');
var header = require('gulp-header');
var GitVersionJson = null;

var tsProject = ts.createProject('ts/tsconfig.json');

gulp.task('pre-build', ()=>{
    var tsResult = tsProject.src()
        .pipe(tsProject());
    return tsResult.js
        .pipe(gulp.dest('.'))
        .pipe(debug({ title: 'out: ' }));
});

gulp.task('fetch-git-version', ['pre-build'], ()=>{
    GitVersionJson = require('.');
    
    var p = new Promise((resolve)=>{
        gulp.task('fetch', [GitVersionJson.task], ()=>{ resolve(0); return p; }); 
        gulp.start('fetch');
    });
    return p;
});

gulp.task('build', ['fetch-git-version'], ()=>{
    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(debug({ title: 'ts: ' }))
        .pipe(tsProject());
    return tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(header("var gitVersion=${version};\n", { version: GitVersionJson.getGitVerStr() }))
        .pipe(gulp.dest('.'))
        .pipe(debug({ title: 'out: ' }));
});

gulp.task('clean', ()=>{
    return del(['index.js', 'index.js.map']);
});

gulp.task('default', ['build']);