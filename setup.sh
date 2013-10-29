git clone https://github.com/bmatusiak/c9-proxied.git ./c9-proxy

cd c9-proxy
npm install

git clone https://github.com/bmatusiak/cloud9.git
cd cloud9
git checkout c9-proxied
npm install

cd ..
content=$(cat /etc/rc.local) # no cat abuse this time

sudo su - root -C 'echo -en "$HOME/c9-proxy/run-proxy.sh &\n\n$content" > /etc/rc.local'