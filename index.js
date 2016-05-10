var gitVersion={"branch":"master","rev":"2","hash":"53d4271","hash160":"53d4271d8d7e7647fabc0d5086acd4f000a04046"};
/// <reference path="../dts/external.d.ts" />
// dependencies
var debug = require("debug")("git-version-json");
var Promise = require("promise");
var git = require("gulp-git");
var gulp = require("gulp");
var UA = require('universal-analytics');
var MarkGitVersion = (function () {
    function MarkGitVersion() {
        this.gitTasks = new Array(4);
        this.gitTasks[0] = new Promise(function (resolve, reject) {
            git.exec({ args: "symbolic-ref --short HEAD", quiet: true }, function (ex, out) {
                MarkGitVersion.gitVer.branch = ex ? ex.message : out.trim();
                resolve(MarkGitVersion.gitVer.branch);
            });
        });
        this.gitTasks[1] = new Promise(function (resolve, reject) {
            git.exec({ args: "rev-list --count HEAD", quiet: true }, function (ex, out) {
                MarkGitVersion.gitVer.rev = ex ? ex.message : out.trim();
                resolve(MarkGitVersion.gitVer.rev);
            });
        });
        this.gitTasks[2] = new Promise(function (resolve, reject) {
            git.revParse({ args: "--short HEAD", quiet: true }, function (ex, out) {
                MarkGitVersion.gitVer.hash = ex ? ex.message : out.trim();
                resolve(MarkGitVersion.gitVer.hash);
            });
        });
        this.gitTasks[3] = new Promise(function (resolve, reject) {
            git.revParse({ args: "HEAD", quiet: true }, function (ex, out) {
                MarkGitVersion.gitVer.hash160 = ex ? ex.message : out.trim();
                resolve(MarkGitVersion.gitVer.hash160);
            });
        });
    }
    MarkGitVersion.prototype.get = function () { return MarkGitVersion.gitVer; };
    MarkGitVersion.prototype.fetchP = function () {
        return Promise.all(this.gitTasks).then(function () {
            debug(MarkGitVersion.gitVer);
            if ((!MarkGitVersion._bDisabled) && typeof (gitVersion) !== "undefined") {
                var visitor = UA("UA-75293894-5");
                var gitMark = gitVersion.branch + "." + gitVersion.rev + "@" + gitVersion.hash;
                visitor.event("git-version-json", "MarkGitVersion.fetchP", gitMark, MarkGitVersion.gitVer.rev);
            }
            return MarkGitVersion.gitVer;
        });
    };
    MarkGitVersion._bDisabled = false;
    MarkGitVersion.task = "mark-git-version";
    MarkGitVersion.gitVer = { branch: "$branch$", rev: "$rev$", hash: "$hash$", hash160: "$hash160$" };
    MarkGitVersion.getGitVerStr = function () { return JSON.stringify(MarkGitVersion.gitVer); };
    MarkGitVersion.disableGA = function (value) { MarkGitVersion._bDisabled = value; };
    return MarkGitVersion;
}());
gulp.task(MarkGitVersion.task, function () {
    var mark = new MarkGitVersion();
    return mark.fetchP();
});
/// <reference path="../dts/external.d.ts" />
/// <reference path="MarkGitVersion.ts" />
// Exports the MarkGitVersion
module.exports = MarkGitVersion;

//# sourceMappingURL=index.js.map
