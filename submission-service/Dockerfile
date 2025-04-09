FROM node:20.12.2-slim

WORKDIR /submissionservice
COPY . .
RUN npm ci

EXPOSE 3000
CMD [ "npm", "start" ]
