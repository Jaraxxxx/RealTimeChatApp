/* server.js */
const winston = require("winston");
const LogstashTransport = require("winston-logstash/lib/winston-logstash-latest");

const cors = require('cors');
const next = require('next');
const Pusher = require('pusher');
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const Sentiment = require('sentiment');

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

const app = next({ dev });
const sentiment = new Sentiment();

// Ensure that your pusher credentials are properly set in the .env file
// Using the specified variables
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  encrypted: true
});

// Create a Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/server.log' }),
    new LogstashTransport({
      host: 'localhost',
      port: 5000 // Change to your Logstash port
    })
  ]
});

app.prepare().then(() => {
  const server = express();

  server.use(cors());
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));
  
  server.get('*', (req, res) => {
    return app.getRequestHandler()(req, res);
  });

  let connections = 0;
  server.use((req, res, next) => {
    connections++;
    // logger.info(`New connection. Total connections: ${connections}`);
    logger.info('Message sent');
    // res.on('finish', () => {
    //   connections--;
    //   logger.info(`Connection closed, Total connections: ${connections}`);
    // });
    next();
  });

  server.get('*', (req, res) => {
    return app.getRequestHandler()(req, res);
  });

  const chatHistory = { messages: [] };

  server.post('/message', (req, res) => {
    const { user = null, message = '', timestamp = +new Date } = req.body;
    const sentimentScore = sentiment.analyze(message).score;
    console.log(sentimentScore)
    const chat = { user, message, timestamp, sentiment: sentimentScore };

    chatHistory.messages.push(chat);
    pusher.trigger('chat-room', 'new-message', { chat });
    res.json({ success: true });
  });

  server.post('/messages', (req, res) => {
    res.json({ ...chatHistory, status: 'success' });
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch(ex => {
  console.error(ex.stack);
  process.exit(1);
});