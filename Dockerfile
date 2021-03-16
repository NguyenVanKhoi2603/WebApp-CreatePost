FROM node:12

WORKDIR ./postApp

COPY package*.json ./

RUN yarn

COPY . .

EXPOSE 3000

CMD [ "node", "server.js" ]