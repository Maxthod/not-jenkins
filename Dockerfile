#FROM node:lts-alpine
FROM node:lts
WORKDIR /app

COPY package.json ./
RUN npm install

COPY src ./src

ENTRYPOINT [ "npm", "start" ]