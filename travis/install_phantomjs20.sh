#wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.0.0-source.zip
#unzip phantomjs-2.0.0-source.zip
#sudo apt-get install build-essential g++ flex bison gperf ruby perl \
#  libsqlite3-dev libfontconfig1-dev libicu-dev libfreetype6 libssl-dev \
#  libpng-dev libjpeg-dev
cd travis
wget https://s3.amazonaws.com/travis-phantomjs/phantomjs-2.0.0-ubuntu-12.04.tar.bz2
tar -xvvf phantomjs-2.0.0-ubuntu-12.04.tar.bz2
cd phantomjs-2.0.0-ubuntu-12.04
ls -la .
#git clone git://github.com/ariya/phantomjs.git
#cd phantomjs
#git checkout 2.0
#./build.sh
