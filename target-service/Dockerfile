FROM node:20.12.2-slim

WORKDIR /targetservice
COPY . .
RUN npm ci

EXPOSE 3000
CMD [ "npm", "start" ]
