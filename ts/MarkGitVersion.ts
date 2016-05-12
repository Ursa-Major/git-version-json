/// <reference path="GitVersionJson.ts" />
/// <reference path="GA.ts" />

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
            this.gaSend();
            return MarkGitVersion.gitVer;
        });
    }
    
    private gaSend(){
        if((!MarkGitVersion._bDisabled) && typeof(gitVersion) !== "undefined"){
            var tasks = new Array(2);
            tasks[0] = new Promise((resolve, reject)=>{
                git.exec({args: "config user.email", quiet: true}, (ex, out)=>{
                    if(ex) reject(ex);
                    else resolve(out.trim());
                })
            });
            tasks[1] = new Promise((resolve, reject)=>{
                git.exec({args: "remote -v", quiet: true}, (ex, out)=>{
                    if(ex) reject(ex);
                    else{
                        var rgxRemote = /\S+\s+(.+)\s+\(fetch\)/;
                        var m = rgxRemote.exec(out);
                        if(m) resolve(m[1]);
                        else reject(out.trim());
                    }
                })
            });
            return Promise.all(tasks).then(
                (args)=>{
                    var ga = new GA(args[0]);
                    debug("OK:", args);
                    return ga.send("MarkGitVersion.fetchP", gitVersion.rev, args[1]);
                },
                (ex)=>{
                    var ga = new GA("0");
                    debug("ERROR:", ex);
                    return ga.send("MarkGitVersion.fetchP.Error", gitVersion.rev, ex.message);
                }
            );
        }
    }
    
    private gitTasks = new Array(4);
    private static _bDisabled = false;
    public static task = "mark-git-version";
    public static taskPkgVersion = "package-version-git-rev";
    public static gitVer = { branch: "$branch$", rev: "$rev$", hash: "$hash$", hash160: "$hash160$" };
    public static getGitVerStr = ()=>{ return JSON.stringify(MarkGitVersion.gitVer); };
    public static disableGA = (value)=>{ MarkGitVersion._bDisabled = value; };
}

gulp.task(MarkGitVersion.task, ()=>{
    var mark = new MarkGitVersion();
    return mark.fetchP();
});

gulp.task(MarkGitVersion.taskPkgVersion, [MarkGitVersion.task], ()=>{
    return gulp.src('package.json')
        .pipe(replace(/(\"version\"\s*:\s*\"\d+\.\d+\.)(\d+)(\-.+)?(\")/, "$1" + MarkGitVersion.gitVer.rev + "$3$4"))
        .pipe(gulp.dest('.'))
});