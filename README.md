# git-version-json
Generate a json variable with git version informations.

It is *NOT* a gulp plugin, but gulp friendly.
It is usually use with gulp-header or gulp-footer.
It is also can use separatedly.

## Sample
```javascript
var gulp = require('gulp');
var concat = require('gulp-concat');
var header = require('gulp-header');
var footer = require('gulp-footer');
var GitVersionJson = require('git-version-json');

gulp.task('build', [GitVersionJson.task], function(){
    return gulp.src('js/**/*')
        .pipe(concat('all.min.js'))
        .pipe(header("var gitVersion=${version};\n",
            { version: GitVersionJson.getGitVerStr() }))
        .pipe(gulp.dest('build/js'));
});

gulp.task('build2', [GitVersionJson.task], function(){
    return gulp.src('js/**/*')
        .pipe(concat('all.min.js'))
        .pipe(footer("var gitVersion=<%=version%>;\n",
            { version: JSON.stringify(GitVersionJson.gitVer) }))
        .pipe(gulp.dest('build/js'));
});

gulp.task('default', ['build']);
```

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