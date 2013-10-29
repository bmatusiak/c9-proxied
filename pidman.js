
var spawn = require('child_process').spawn;


module.exports = function(pid,callback){
    var useNode;
    if(!useNode) useNode = "node";
        useNode = "/usr/local/bin/"+useNode;
        
    var app = spawn("ps", ["aux"]);
        
    var psData = "";
    app.stdout.on('data',function(data){
        psData += data.toString();
    });
    
    app.on('close',function(){
        var psArray = psData.split("\n");
        var keys = [];
        var pids = {};
        for(var i=0; i<psArray.length;i++){
            if(i === 0){
                for(var $keys = psArray[i].split(" "); $keys.length;){
                    var kVal = $keys.shift();
                    if(kVal)
                        keys.push(kVal);
                }
            }else{
                var sectionID = 0;
                var pidObj = {};
                for(var $pids = psArray[i].split(" "); $pids.length;){
                    var pVal = $pids.shift();
                    if(pVal){
                        //if(keys[sectionID] == "PID") console.log(pVal);
                        if(keys[sectionID] == "COMMAND"){
                            pidObj[keys[sectionID]] = pVal+" "+$pids.join(" ");
                            break;
                        }else{
                            pidObj[keys[sectionID]] = pVal;
                            sectionID++;
                        }
                    }
                }
                if(pidObj.PID){
                    
                    pidObj.kill = killFunction(pidObj.PID);
                    pids[pidObj.PID] = pidObj;
                }else{
                    //console.log("error",pidObj);
                }
                
            }
        }
        
        if(typeof pid == "function")
            pid(null,pids);
        else if(callback && pids[pid])
            callback(null,pids[pid]);
        else 
            callback("pid not found");
    });
};
function killFunction(pid,arg2){
    return function(){
        process.kill(pid,arg2);
    };
}

/*

module.exports(process.pid,function(err,pidInfo){
    if(pidInfo)
        console.log(pidInfo);
});

*/