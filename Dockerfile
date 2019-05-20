FROM node:lts-alpine
WORKDIR /app

COPY package.json ./
RUN npm install

COPY ./src ./

ENTRYPOINT [ "npm", "start" ]