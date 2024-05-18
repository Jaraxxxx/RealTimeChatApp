# Dockerfile

FROM node:18.16.0-alpine3.17
WORKDIR /app
COPY package.json package-lock.json server.js Dockerfile ./
RUN npm install react react-dom next pusher pusher-js sentiment
RUN npm install express body-parser cors dotenv axios
RUN npm install
COPY ./components/ ./components/
COPY ./pages/ ./pages/
COPY ./kubernetes/ ./kubernetes/
COPY .env ./
RUN chmod 744 .env
EXPOSE 3000
CMD [ "npm", "start"]