/// <reference path="../dts/external.d.ts" />

// dependencies
var debug:any   = require("debug")("git-version-json");
var Promise:any = require("promise");
var git:any     = require("gulp-git");
var gulp:any    = require("gulp");
var UA:any      = require('universal-analytics');

class MarkGitVersion{
    public constructor(){
        this.gitTasks[0] = new Promise((resolve, reject)=>{
            git.exec({args: "symbolic-ref --short HEAD", quiet: true}, (ex, out)=>{
                MarkGitVersion.gitVer.branch = ex ? ex.message : out.trim();
                resolve(MarkGitVersion.gitVer.branch);
            });
        }); 
        
        this.gitTasks[1] = new Promise((resolve, reject)=>{
            git.exec({args: "rev-list --count HEAD", quiet: true}, (ex, out)=>{
                MarkGitVersion.gitVer.rev = ex ? ex.message : out.trim();
                resolve(MarkGitVersion.gitVer.rev);
            });
        }); 
        
        this.gitTasks[2] = new Promise((resolve, reject)=>{
            git.revParse({args: "--short HEAD", quiet: true}, (ex, out)=>{
                MarkGitVersion.gitVer.hash = ex ? ex.message : out.trim();
                resolve(MarkGitVersion.gitVer.hash);
            });
        });
        
        this.gitTasks[3] = new Promise((resolve, reject)=>{
            git.revParse({args: "HEAD", quiet: true}, (ex, out)=>{
                MarkGitVersion.gitVer.hash160 = ex ? ex.message : out.trim();
                resolve(MarkGitVersion.gitVer.hash160);
            });
        });
    }
    
    public get(){ return MarkGitVersion.gitVer; }
    
    public fetchP(){
        return Promise.all(this.gitTasks).then(()=>{
            debug(MarkGitVersion.gitVer);
            if((!MarkGitVersion._bDisabled) && gitVersion){
                var visitor = UA("UA-75293894-5");
                var gitMark = gitVersion.branch + "." + gitVersion.rev + "@" + gitVersion.hash;
                visitor.event("git-version-json", "MarkGitVersion.fetchP", gitMark, MarkGitVersion.gitVer.rev);
            }
            return MarkGitVersion.gitVer;
        });
    }
    
    private gitTasks = new Array(4);
    private static _bDisabled = false;
    public static task = "mark-git-version";
    public static gitVer = { branch: "$branch$", rev: "$rev$", hash: "$hash$", hash160: "$hash160$" };
    public static getGitVerStr = ()=>{ return JSON.stringify(MarkGitVersion.gitVer); };
    public static disableGA = (value)=>{ MarkGitVersion._bDisabled = value; };
}

gulp.task(MarkGitVersion.task, ()=>{
    var mark = new MarkGitVersion();
    return mark.fetchP();
});