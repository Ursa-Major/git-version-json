# git-version-json
[![npm version](https://badge.fury.io/js/git-version-json.svg)](http://badge.fury.io/js/git-version-json)
[![Build Status](https://travis-ci.org/Ursa-Major/git-version-json.svg?branch=master)](https://travis-ci.org/Ursa-Major/git-version-json)

Generate a json variable with git version informations.

It is *NOT* a gulp plugin, but gulp friendly.
It is usually use with gulp-replace, gulp-header or gulp-footer.
It is also can use separatedly.

The generated json looks like as:
```javascript
var gitVersion={"branch":"master","rev":"2","hash":"53d4271","hash160":"53d4271d8d7e7647fabc0d5086acd4f000a04046"};
```
Check [index.js](https://github.com/Ursa-Major/git-version-json/blob/master/index.js#L1)

## Sample
```javascript
var gulp = require('gulp');
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var header = require('gulp-header');
var footer = require('gulp-footer');
var GitVersionJson = require('git-version-json');

// automatic use git-rev in version field of package.json
gulp.task('npm-git-rev', [GitVersionJson.task], ()=>{
    return gulp.src('package.json')
        .pipe(replace(/(\"version\"\s*:\s*\"\d+\.\d+\.)(\d+)(\")/,
            "$1" + GitVersionJson.gitVer.rev + "$3"))
        .pipe(gulp.dest('.'))
});

// add a header json variable
gulp.task('build-header', [GitVersionJson.task], function(){
    return gulp.src('js/**/*')
        .pipe(concat('all.min.js'))
        .pipe(header("var gitVersion=${version};\n",
            { version: GitVersionJson.getGitVerStr() }))
        .pipe(gulp.dest('build/js'));
});

// add a footer
gulp.task('build-footer', [GitVersionJson.task], function(){
    return gulp.src('js/**/*')
        .pipe(concat('all.min.js'))
        .pipe(footer("var gitVersion=<%=version%>;\n",
            { version: JSON.stringify(GitVersionJson.gitVer) }))
        .pipe(gulp.dest('build/js'));
});

```

A complete sample locates in [ali-mns/gulpfile.js](https://github.com/InCar/ali-mns/blob/master/gulpfile.js)

# Privacy Policy
We collect information about how you use the `git-version-json` packages for better service.

By default a tracing information is sent to google analytics when fetching version number,
The tracing information contains only a rev number.
Any of your data will not be sent.
You can check [code](https://github.com/Ursa-Major/git-version-json/blob/master/ts/MarkGitVersion.ts#L49) about data collection.

You can always disable data collection as you wish.
```javascript
    var GitVersionJson = require('git-version-json');
    // Disable google analytics data collection
    GitVersionJson.disableGA(true);
    
```

# License
MIT