# Dockerfile

FROM node:18.16.0-alpine3.17
WORKDIR /app
COPY package.json package-lock.json server.js Dockerfile deployment.yaml service.yaml ./
RUN npm install react react-dom next pusher pusher-js sentiment
RUN npm install express body-parser cors dotenv axios
RUN npm install
COPY ./components/ ./components/
COPY ./pages/ ./pages/
EXPOSE 3000
CMD [ "npm", "start"]