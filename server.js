import express from 'express';
import path from 'path';
import http from 'http';
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import mongoose from 'mongoose';

const auth = require('./src/auth/auth')

const apiServer = async () => {
  const app = express();
  const server = http.createServer(app);
  const envSetting = dotenv.config();
  const port = process.env.PORT || 5000;
  mongoose.connect(process.env.DATABASE_MONGODB_URL);

  server.listen(port, () => {
    console.log('listening on *:' + port);
  });
  
  // Routing
  app.use(bodyParser.json({limit: '10mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  app.use('/', require('./src/routes/basic'));
  auth(app)
  
  // set static path
  app.use(express.static(path.join(__dirname, '')));
} 

apiServer();
