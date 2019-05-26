#FROM node:lts-alpine
FROM node:lts
WORKDIR /app

COPY package.json ./
RUN npm install

COPY src ./src

RUN for FILE in /app/src/scripts/* ; do FILENAME=$(basename $FILE); ln -s $FILE /bin/not-jenkins-${FILENAME%.sh}; done  
RUN chmod +x /app/src/scripts/*


ENTRYPOINT [ "npm", "start" ]