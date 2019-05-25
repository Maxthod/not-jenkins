#FROM node:lts-alpine
FROM node:lts
WORKDIR /app

COPY package.json ./
RUN npm install

COPY src ./src
RUN ln -s /app/src/deploy.sh /bin/deploy
RUN chmod +x /app/src/deploy.sh

ENTRYPOINT [ "npm", "start" ]