FROM node:lts
WORKDIR /app

RUN npm i -g nodemon

COPY package.json ./
RUN npm install

COPY src ./src

ENTRYPOINT [ "npm", "run", "develop" ]