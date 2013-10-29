git clone https://github.com/bmatusiak/c9-proxied.git $HOME/c9-proxy

cd c9-proxy
npm install

echo "adding start up script to /etc/rc.local "
rclocalcontent=$(cat /etc/rc.local)
sudo su - root -c 'echo -en "$HOME/c9-proxy/run-proxy.sh &\n\n$rclocalcontent" > /etc/rc.local'

git clone https://github.com/bmatusiak/cloud9.git
cd cloud9
git checkout c9-proxied
npm install
npm install mongoose pty.js


cd ..