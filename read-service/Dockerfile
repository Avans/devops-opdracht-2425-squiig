FROM node:24.2.0-alpine3.22

WORKDIR /readservice
COPY package*.json .
RUN npm ci
COPY . .

EXPOSE 3000
CMD [ "npm", "run", "dev" ]
