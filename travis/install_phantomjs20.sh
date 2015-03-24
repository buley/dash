cd travis
#wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.8-linux-i686.tar.bz2
#wget https://s3.amazonaws.com/travis-phantomjs/phantomjs-2.0.0-ubuntu-12.04.tar.bz2
wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.7-linux-i686.tar.bz2
#tar -xjf phantomjs-2.0.0-ubuntu-12.04.tar.bz2
tar -xjf phantomjs-1.9.7-linux-i686.tar.bz2
ls -la phantomjs-1.9.7-linux-i686/bin
sudo rm -rf /usr/local/phantomjs/bin/phantomjs
sudo mv phantomjs-1.9.7-linux-i686/bin/phantomjs /usr/local/phantomjs/bin/phantomjs
