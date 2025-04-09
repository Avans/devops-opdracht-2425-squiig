FROM node:20.12.2-slim

WORKDIR /readservice
COPY . .
RUN npm ci

EXPOSE 3000
CMD [ "npm", "start" ]
