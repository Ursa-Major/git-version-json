/// <reference path="../dts/external.d.ts" />

// dependencies
var debug:any   = require("debug")("git-version-json");
var CryptoA:any = require("crypto");
var Promise:any = require("promise");
var git:any     = require("gulp-git");
var gulp:any    = require("gulp");
var replace:any = require('gulp-replace');
var UA:any      = require('universal-analytics');
