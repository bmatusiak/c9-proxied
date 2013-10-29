
var spawn = require('child_process').spawn;
var fs = require("fs");

module.exports = function(appDir,opt,ready,closed){
    
    (function(callback){
        var failed = false;
        try{
            var appPackage = require(appDir+"/package.json");
            var useNode;
            /*
            if(appPackage && appPackage.engines && appPackage.engines.node){
                if(appPackage.engines.node.indexOf("0.6") >= 0){
                    useNode = "node8";
                }else if(appPackage.engines.node.indexOf("0.8") >= 0){
                    useNode = "node8";
                }else if(appPackage.engines.node.indexOf("0.10") >= 0){
                    useNode = "node10";
                }
            }*/
            
            if(!useNode) useNode = "node";
            useNode = "/usr/local/bin/"+useNode;
            
            
        }catch(e){ 
            failed = true;
            callback(e); 
        }
        if(!failed) callback(null,useNode , appDir + "/server.js");
    })(function(err,node,file){
        var app,hasFile = fs.existsSync(file);
        if(!err && hasFile){
            app = spawn(node, [file],opt);
            
            //var readyed = false;
            function onData(data){
                //console.log(data.toString());
                
                /*
                if(data.toString().indexOf("initialized") >= 0){
                    if(!readyed){
                        readyed = true;
                        ready(app);
                        console.log("Started",file);
                    }
                }
                */
            }
            /*
            setTimeout(function() {
                if(!readyed){
                    readyed = true;
                    ready(app);
                    console.log("Started",file);
                }
            }, 10000);
            */
            app.stdout.on('data',onData);
            
            app.stderr.on('data', onData);
            
            if(closed)
            app.on('close',closed);
            
        }
        if(!hasFile)
            ready("no file");
            
        else
        ready(err,app);
    });
};

