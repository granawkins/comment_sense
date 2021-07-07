# set base image (host OS)
FROM python:3.8

# set the working directory in the container
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# From https://github.com/nazliander/scrape-nr-of-deaths-istanbul
# |
# install google chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
RUN apt-get -y update
RUN apt-get install -y google-chrome-stable
RUN apt-get install sudo
RUN sudo apt-get install libnss3 libnspr4
# |
# install chromedriver
RUN apt-get install -yqq unzip
RUN wget -O /tmp/chromedriver.zip http://chromedriver.storage.googleapis.com/`curl -sS chromedriver.storage.googleapis.com/LATEST_RELEASE`/chromedriver_linux64.zip
RUN unzip /tmp/chromedriver.zip chromedriver -d /usr/local/bin/
# |
# set display port to avoid crash
ENV DISPLAY=:99

WORKDIR /usr/src/app

# copy the dependencies file to the working directory
COPY requirements.txt /usr/src/app

# install dependencies
RUN pip install -r requirements.txt

# copy the content of the local src directory to the working directory

COPY api /usr/src/app

ENTRYPOINT ["python3", "app.py"]