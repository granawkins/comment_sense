# set base image (host OS)
FROM python:3.8

# set the working directory in the container
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# copy the dependencies file to the working directory
COPY requirements.txt /usr/src/app

# install dependencies
RUN pip install -r requirements.txt

# copy the content of the local src directory to the working directory
COPY api /usr/src/app

ENTRYPOINT ["python3", "app.py"]
