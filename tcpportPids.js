var spawn = require('child_process').spawn;


module.exports = function(pid,callback){
    var useNode;
    if(!useNode) useNode = "node";
        useNode = "/usr/local/bin/"+useNode;
        
    //netstat -tulpn
    var app = spawn("netstat", ["-tulpn"]);
        
    var psData = "";
    app.stdout.on('data',function(data){
        psData += data.toString();
    });
    
    app.on('close',function(){
        var psArray = psData.split("\n");
        var keys = [];
        var pids = {};
        for(var i=0; i<psArray.length;i++){
            if(i === 0) continue;
            if(i === 1){
                for(var $keys = psArray[i].split(" "); $keys.length;){
                    var kVal = $keys.shift();
                    if(kVal){
                        if( kVal == "Address" || kVal == "name" )
                            continue;
                        keys.push(kVal);
                    }
                }
            }else{
                var sectionID = 0;
                var pidObj = {};
                for(var $pids = psArray[i].split(" "); $pids.length;){
                    var pVal = $pids.shift();
                    if(pVal){
                        pidObj[keys[sectionID]] = pVal;
                        sectionID++;
                    }
                }
                if(pidObj.Proto == "tcp" && pidObj.State === "LISTEN" && pidObj['PID/Program'] !== '-'){
                    pidObj.PID = pidObj['PID/Program'].split("/")[0];
                    pidObj.Port = pidObj.Local.split(":")[1];
                    pidObj.kill = killFunction(pidObj.PID);
                    pids[pidObj.Port] = pidObj;
                }
            }
        }
        
        if(typeof pid == "function")
            pid(null,pids);
        else if(callback && pids[pid])
            callback(null,pids[pid]);
        else 
            callback("port not found");
    });
};
function killFunction(pid,arg2){
    return function(){
        process.kill(pid,arg2);
    };
}



module.exports(function(err,pidInfo){
    if(pidInfo)
        console.log(pidInfo);
});

