# base image
FROM node:16-alpine3.12

# create & set working directory
RUN mkdir -p /usr/src
WORKDIR /usr/src

# copy source files
COPY . /usr/src
COPY .env.example /usr/src/.env

# install dependencies
RUN export NODE_OPTIONS=--openssl-legacy-provider

RUN npm install 

# start app
RUN npm run build
EXPOSE 3000
CMD npm run start
