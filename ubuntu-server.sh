#!/bin/bash
/usr/local/bin/node /home/ubuntu/c9-proxy/server.js &

PID=$!
echo $PID > /home/ubuntu/c9-proxy/server.pid


exit 1
#& /bin/su - ubuntu -c '/usr/local/bin/node /home/ubuntu/c9-proxy/server.js' &
