#FROM node:lts-alpine
FROM node:lts
WORKDIR /app

COPY package.json ./
RUN npm install

COPY src ./src

RUN ln -s /app/src/clone.sh /bin/clone
RUN chmod +x /app/src/clone.sh


RUN ln -s /app/src/build.sh /bin/build
RUN chmod +x /app/src/build.sh

RUN ln -s /app/src/push.sh /bin/push
RUN chmod +x /app/src/push.sh



ENTRYPOINT [ "npm", "start" ]