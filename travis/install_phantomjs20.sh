wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.0.0-source.zip
unzip phantomjs-2.0.0-source.zip
sudo apt-get install build-essential g++ flex bison gperf ruby perl \
  libsqlite3-dev libfontconfig1-dev libicu-dev libfreetype6 libssl-dev \
  libpng-dev libjpeg-dev
cd travis
git clone git://github.com/ariya/phantomjs.git
cd phantomjs
git checkout 2.0
./build.sh
