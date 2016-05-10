
var debug = require("debug")("git-version-json:test");
var gulp = require('gulp');
var assert = require('assert');
var GitVersionJson = require('..');

gulp.task('default', [GitVersionJson.task], ()=>{
    debug(GitVersionJson.gitVer);
    assert(GitVersionJson.gitVer.branch !== "$branch$");
    assert(GitVersionJson.gitVer.hash.length === 7);
    assert(GitVersionJson.gitVer.hash160.length === 40);
    assert(parseInt(GitVersionJson.gitVer.rev) > 0);
});