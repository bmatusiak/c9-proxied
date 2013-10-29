/bin/su - root -c '/usr/local/bin/node8 /home/bmatusiak/proxy/root-server.js' | /bin/su - bmatusiak -c '/usr/bin/tee -a /home/bmatusiak/proxy/root-proxy.log' &
/bin/su - bmatusiak -c '/usr/local/bin/node8 /home/bmatusiak/proxy/server.js' | /bin/su - bmatusiak -c '/usr/bin/tee -a /home/bmatusiak/proxy/proxy.log' &
