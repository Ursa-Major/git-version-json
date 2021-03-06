/// <reference path="GitVersionJson.ts" />

class GA{
    public constructor(accId:string){
        this._gitMark = gitVersion.branch + "." + gitVersion.rev + "@" + gitVersion.hash;
        this._visitor = UA("UA-75293894-5", this.u2id(accId));
    }
    
    public send(action:string, value:number, url:string){
        if(this._bGoogleAnalytics){
            var args = { dl: url };
            // catagory, action, label, value, params
            this._visitor.event("git-version-json", action, this._gitMark, value, args).send();
        }
    }
    
    public disableGA(bDisable?:boolean){
        this._bGoogleAnalytics = (!bDisable);
    }
    
    private u2id(uid:string){
        var cryptoMD5 = CryptoA.createHash("md5");
        var md5HEX = cryptoMD5.update(uid).digest("hex");
        
        var uxid = new Array(36);
        for(var i=0,j=0;i<md5HEX.length;i++,j++){
            if(i === 8 || i === 12 || i === 16 || i === 20){
                uxid[j] = "-";
                j++;
            } 
            uxid[j] = md5HEX.charAt(i);
        }
        
        return uxid.join("");
    }
        
    private _visitor: any;
    private _gitMark: string;
    private _bGoogleAnalytics = true;
}