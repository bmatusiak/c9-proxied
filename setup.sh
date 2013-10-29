#node.js install
wget http://nodejs.org/dist/v0.8.26/node-v0.8.26-linux-x86.tar.gz
tar -xvf node-v0.8.26-linux-x86.tar.gz
mv node-v0.8.26-linux-x86 node-package
sudo mv node-package/bin/node /usr/local/bin/node
sudo mv node-package/lib/node_modules  /usr/local/lib/node_modules
sudo ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm
rm -rf  node-v* node-package

#proxy install
git clone https://github.com/bmatusiak/c9-proxied.git $HOME/c9-proxy
cd $HOME/c9-proxy
npm install

# echo "adding start up script to /etc/rc.local "
# rclocalcontent=$(cat /etc/rc.local)
# echoLine=$(echo $HOME'/c9-proxy/run-proxy.sh &\n\n')
# echo $echoLine > ./rc.local
# cat /etc/rc.local >> ./rc.local
# sudo mv ./rc.local /etc/rc.local

#cloud9 install
git clone https://github.com/bmatusiak/cloud9.git $HOME/c9-proxy/cloud9
cd $HOME/c9-proxy/cloud9
git checkout c9-proxied
npm install
npm install mongoose pty.js

cd $HOME
