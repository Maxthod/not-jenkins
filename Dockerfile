#FROM node:lts-alpine
FROM node:lts
WORKDIR /app

COPY package.json ./
RUN npm install

COPY src ./src
RUN ln -s src/deploy.sh /bin/deploy

ENTRYPOINT [ "npm", "start" ]