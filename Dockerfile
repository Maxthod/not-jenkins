#FROM node:lts-alpine
FROM node:lts
WORKDIR /app

COPY package.json ./
RUN npm install

COPY src ./src

RUN for FILE in /app/src/main/scripts/* ; do chmod +x $FILE; FILENAME=$(basename $FILE); ln -s $FILE /bin/not-jenkins-${FILENAME%.sh}; done  

ENTRYPOINT [ "npm", "start" ]