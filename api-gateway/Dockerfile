FROM node:24.2.0-alpine3.22

WORKDIR /gateway
COPY . .
RUN npm ci

EXPOSE 3000
CMD [ "npm", "run", "dev" ]
