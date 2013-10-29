var httpProxy = require('http-proxy');
var serverProxy = httpProxy.createServer(function(req, res, proxy) {
    var prefix = req.headers.host.split(".")[0];
        if(prefix === "dev")
            proxy.proxyRequest(req, res, {
                host: 'localhost',
                port: 3131
            });
    else
    proxy.proxyRequest(req, res, {
        host: 'localhost',
        port: 1337
    });
}).listen(80);


serverProxy.proxy.on('proxyError', function(err, req, res) {
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });

    res.end('Website you are accessing is not available.(Proxy Server Not Running)');
});
