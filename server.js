var projectDIR = "/home/ubuntu/projects";
var cloud9Path = "/home/ubuntu/c9-proxy/cloud9";


var httpProxy = require('http-proxy');
var runApp = require("./run-app.js");
var fs = require("fs");
var netUtil = require("netutil");
console.log("starting proxy");
var pidman = require("./pidman.js");

var basicAuth = require("connect").basicAuth("bmatusiak","cool");

var prefixLogic =  function(req, res,app,cloud9){
    var prefix = req.headers.host.split(".");
    //http://arg1.arg2.arg3.arg4.arg5/
    //http://app.dev.host.com/  = runapp
    //http://app.c9.dev.host.com/  = runapp
    prefix.pop();//remove arg5
    prefix.pop();//remove arg4
    prefix.pop();//remove arg3
    prefix = prefix.reverse();//reverse to ["cloud9","app"]
    if(prefix[0] && prefix[0] == "c9"){
        basicAuth(req,res,function(){
            prefix.shift();
            if(cloud9)
                cloud9(prefix.join("/"),app);
            else{
                app(prefix.join("/"));
            }
        });
    }else{
        app(prefix.join("/"));
    }
};

var sett = {
    get ings(){
        try{
            return JSON.parse(fs.readFileSync(__dirname+"/settings.json").toString());
        }catch(e){
            return {};
        }
    },
    set ings(value){
        fs.writeFileSync(__dirname+"/settings.json",JSON.stringify(value));
    }
};

var serverProxy = httpProxy.createServer(function(req, res, proxy) {
    prefixLogic(req,res,function(prefix){//app
        req.settings = sett.ings;
        if(req.settings[prefix]){
            proxy.proxyRequest(req, res, {
                host: 'localhost',
                port: req.settings[prefix].port
            });
        }else{
            if(fs.existsSync(projectDIR+"/"+prefix)){
                netUtil.findFreePort(30000,35000,"localhost",function(err,port){
                    var env = { 
                        cwd: projectDIR,
                        env: {
                            PORT:port,
                            HOME:projectDIR,
                            HOST:req.headers.host
                        }
                    };
                    runApp(projectDIR+"/"+prefix,env,function ready(err,app){
                        if(err){
                            res.writeHead(500, {
                                'Content-Type': 'text/plain'
                            });
                            res.end('Website '+prefix+' you are accessing is not available.('+err+')');
                            return;
                        }
                        
                        var isReady = false;
                        var tryCounts = 1000;
                        var count = 0;
                        async(function(next, done){
                            netUtil.isPortOpen("localhost", port, 1/*timeout*/, function(err, port){
                                if(isReady || count >= tryCounts)
                                    return done();
                                count++;
                                
                                if(err){
                                    next();
                                }else{
                                    isReady = true;
                                    next();
                                }
                                
                            });
                        },function(){
                            
                            if(isReady){
                                req.settings = sett.ings;
                                req.settings[prefix] = {
                                    prefix:prefix,
                                    port:port,
                                    pid:app.pid
                                };
                                sett.ings = req.settings;
                                console.log("started",prefix,req.settings[prefix]);
                            }
                            setTimeout(function() {
                                res.writeHead(302, {
                                    'Location': req.url
                                });
                                res.end();    
                            }, 1000);
                        });
                    });
                });
            } else {
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
            
                res.end('Website '+prefix+' you are accessing is not available.');
            }
        }
    },function(prefix){//cloud9
        req.settings = sett.ings;
        if(req.settings["cloud9/"+prefix]){
            proxy.proxyRequest(req, res, {
                host: 'localhost',
                port: req.settings["cloud9/"+prefix].port
            });
        }else{
            if(fs.existsSync(projectDIR+"/"+prefix)){
                netUtil.findFreePort(30000,35000,"localhost",function(err,port){
                    async(function(next, done){
                        req.settings = sett.ings;
                        if(!req.settings[prefix])
                            netUtil.findFreePort(35001,40000,"localhost",function(err,aPort){
                                req.settings = sett.ings;
                                var found = false;
                                for(var i in req.settings){
                                    if(req.settings[i].port == aPort)
                                        found = true;
                                }
                                if(found)
                                    next();
                                else{ 
                                    req.settings[prefix] = {
                                        prefix:prefix,
                                        port:aPort,
                                        CLOUD9:true
                                    };
                                    sett.ings = req.settings;
                                    
                                    done();
                                }
                            });
                        else {
                            pidman(req.settings[prefix].pid,function(err,pidInfo){
                                if(pidInfo){
                                    pidInfo.kill();
                                    console.log("killing",prefix,req.settings[prefix].pid);
                                    delete req.settings[prefix];
                                    sett.ings = req.settings;
                                    next();
                                }else
                                    done();
                            });
                        }
                    },function(){
                            
                        var env = { 
                            cwd: projectDIR+"/"+prefix,
                            env: {
                                PORT:port,
                                HOME:process.env.HOME,
                                LS_COLORS:process.env.LS_COLORS,
                                PATH:process.env.PATH,
                                HOST:req.headers.host,
                                URL:"http://"+prefix.replace("/",".")+".dev.bmatusiak.us/",
                                APPPORT:req.settings[prefix].port
                            }
                        };
                        runApp(cloud9Path,env,function ready(err,app){
                            if(err){
                                res.writeHead(500, {
                                    'Content-Type': 'text/plain'
                                });
                                res.end('Website '+"cloud9/"+prefix+' you are accessing is not available.('+err+')');
                                return;
                            }
                            
                            var isReady = false;
                            var tryCounts = 1000;
                            var count = 0;
                            async(function(next, done){
                                netUtil.isPortOpen("localhost", port, 1/*timeout*/, function(err, port){
                                    if(isReady || count >= tryCounts)
                                        return done();
                                    count++;
                                    
                                    if(err){
                                        next();
                                    }else{
                                        isReady = true;
                                        next();
                                    }
                                    
                                });
                            },function(){
                                
                                if(isReady){
                                    req.settings = sett.ings;
                                    req.settings["cloud9/"+prefix] = {
                                        prefix:"cloud9/"+prefix,
                                        port:port,
                                        pid:app.pid
                                    };
                                    
                                    sett.ings = req.settings;
                                    console.log("started","cloud9/"+prefix,req.settings["cloud9/"+prefix],req.settings[prefix]);
                                }
                                setTimeout(function() {
                                    res.writeHead(302, {
                                        'Location': req.url
                                    });
                                    res.end();    
                                }, 2000);
                            });
                        });
                        
                    });
                });
            } else {
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
            
                res.end('Website '+prefix+' you are accessing is not available.');
            }
        }
    });
}).listen(1337, function() {
    console.log(1337, "proxy started");
});

serverProxy.proxy.on('proxyError', function(err, req, res) {
    prefixLogic(req,res,function(prefix){
        req.settings = sett.ings;
        if(err && err.toString().indexOf("ECONNREFUSED") >= 0 && req.settings[prefix]){
            if(req.settings[prefix].CLOUD9){
                if(req.settings["cloud9/"+prefix])
                    pidman(req.settings["cloud9/"+prefix].pid,function(err,pidInfo){
                        if(err){
                            delete req.settings[prefix];
                            delete req.settings["cloud9/"+prefix];
                            
                            sett.ings = req.settings;
                            res.writeHead(302, {
                                'Location': req.url
                            });
                            res.end();  
                            
                        }else{
                            res.writeHead(500, {
                                'Content-Type': 'text/plain'
                            });
                        
                            res.end('Website '+prefix+' is not running from cloud9');
                        }
                    });
                else checkApp();
                
            }else checkApp();
            
            function checkApp(){
                pidman(req.settings[prefix].pid,function(err,pidInfo){
                    if(err){
                        delete req.settings[prefix];
                        sett.ings = req.settings;
                        res.writeHead(302, {
                            'Location': req.url
                        });
                        res.end();  
                        
                    }else{
                        console.log("ECONNREFUSED but pid is alive",prefix);
                        res.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                    
                        res.end('Website '+prefix+' you are accessing is Failed Somewhere.(ECONNREFUSED but pid is alive)');
                    }
                });
            }
            
        }else{
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
        
            res.end('Website '+prefix+' you are accessing is Failed Somewhere.');
        }
    },function(prefix,app){
        app("cloud9/"+prefix);
    });

});

function async(callback, onDone) {
    callback(function() {
        async(callback, onDone);
    }, onDone);
}
