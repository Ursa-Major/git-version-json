var gitVersion={"branch":"master","rev":"12","hash":"5d25d5f","hash160":"5d25d5f42c7014aa8db3b4ed2faddb15a4e32712"};
/// <reference path="../dts/external.d.ts" />
// dependencies
var debug = require("debug")("git-version-json");
var CryptoA = require("crypto");
var Promise = require("promise");
var git = require("gulp-git");
var gulp = require("gulp");
var replace = require('gulp-replace');
var UA = require('universal-analytics');
/// <reference path="GitVersionJson.ts" />
var GA = (function () {
    function GA(accId) {
        this._bGoogleAnalytics = true;
        this._gitMark = gitVersion.branch + "." + gitVersion.rev + "@" + gitVersion.hash;
        this._visitor = UA("UA-75293894-5", this.u2id(accId));
    }
    GA.prototype.send = function (action, value, url) {
        if (this._bGoogleAnalytics) {
            var args = { dl: url };
            // catagory, action, label, value, params
            this._visitor.event("git-version-json", action, this._gitMark, value, args).send();
        }
    };
    GA.prototype.disableGA = function (bDisable) {
        this._bGoogleAnalytics = (!bDisable);
    };
    GA.prototype.u2id = function (uid) {
        var cryptoMD5 = CryptoA.createHash("md5");
        var md5HEX = cryptoMD5.update(uid).digest("hex");
        var uxid = new Array(36);
        for (var i = 0, j = 0; i < md5HEX.length; i++, j++) {
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uxid[j] = "-";
                j++;
            }
            uxid[j] = md5HEX.charAt(i);
        }
        return uxid.join("");
    };
    return GA;
}());
/// <reference path="GitVersionJson.ts" />
/// <reference path="GA.ts" />
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
        var _this = this;
        return Promise.all(this.gitTasks).then(function () {
            debug(MarkGitVersion.gitVer);
            _this.gaSend();
            return MarkGitVersion.gitVer;
        });
    };
    MarkGitVersion.prototype.gaSend = function () {
        if ((!MarkGitVersion._bDisabled) && typeof (gitVersion) !== "undefined") {
            var tasks = new Array(2);
            tasks[0] = new Promise(function (resolve, reject) {
                git.exec({ args: "config user.email", quiet: true }, function (ex, out) {
                    if (ex)
                        reject(ex);
                    else
                        resolve(out.trim());
                });
            });
            tasks[1] = new Promise(function (resolve, reject) {
                git.exec({ args: "remote -v", quiet: true }, function (ex, out) {
                    if (ex)
                        reject(ex);
                    else {
                        var rgxRemote = /\S+\s+(.+)\s+\(fetch\)/;
                        var m = rgxRemote.exec(out);
                        if (m)
                            resolve(m[1]);
                        else
                            reject(out.trim());
                    }
                });
            });
            return Promise.all(tasks).then(function (args) {
                var ga = new GA(args[0]);
                debug("OK:", args);
                return ga.send("MarkGitVersion.fetchP", gitVersion.rev, args[1]);
            }, function (ex) {
                var ga = new GA("0");
                debug("ERROR:", ex);
                return ga.send("MarkGitVersion.fetchP.Error", gitVersion.rev, ex.message);
            });
        }
    };
    MarkGitVersion._bDisabled = false;
    MarkGitVersion.task = "mark-git-version";
    MarkGitVersion.taskPkgVersion = "package-version-git-rev";
    MarkGitVersion.gitVer = { branch: "$branch$", rev: "$rev$", hash: "$hash$", hash160: "$hash160$" };
    MarkGitVersion.getGitVerStr = function () { return JSON.stringify(MarkGitVersion.gitVer); };
    MarkGitVersion.disableGA = function (value) { MarkGitVersion._bDisabled = value; };
    return MarkGitVersion;
}());
gulp.task(MarkGitVersion.task, function () {
    var mark = new MarkGitVersion();
    return mark.fetchP();
});
gulp.task(MarkGitVersion.taskPkgVersion, [MarkGitVersion.task], function () {
    return gulp.src('package.json')
        .pipe(replace(/(\"version\"\s*:\s*\"\d+\.\d+\.)(\d+)(\-.+)?(\")/, "$1" + MarkGitVersion.gitVer.rev + "$3$4"))
        .pipe(gulp.dest('.'));
});
/// <reference path="../dts/external.d.ts" />
/// <reference path="MarkGitVersion.ts" />
// Exports the MarkGitVersion
module.exports = MarkGitVersion;

//# sourceMappingURL=index.js.map
