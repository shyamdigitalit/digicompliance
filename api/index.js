import express from 'express';
import os from 'os';
import cluster from 'cluster';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoConn from './db/dbcon.js';
import authRoutes from './routes/authRoute.js';
import routes from './routes/route.js';
// Load environment variables from .env file
dotenv.config({ quiet: true });

// Determine the number of worker processes to spawn
const numCPUs = Math.ceil(os.cpus().length / Math.ceil(os.cpus().length / 2)); // Use half of the available CPUs

const app = express();
const apienv = process.env.NODE_ENV || 'dev';
const appenv = process.env.APP_ENV || 'quality';

const portDetails = {
  quality: process.env.PORT_QAS || 5039,
  production: process.env.PORT_PRD || 5038,
}
const port = portDetails[appenv] || 5039;

const allowedOrigins = {
  dev: {
    quality: [process.env.APP_URL_DEVQ],
    production: [process.env.APP_URL_DEVP]
  },
  live: {
    quality: [process.env.APP_URL_LIVQ],
    production: [process.env.APP_URL_LIVP]
  }
}
const origins = allowedOrigins[apienv][appenv] || ['http://localhost:3039'];


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} running...`);
  (async () => {
    // CONNECT DATABASE FIRST
    await mongoConn();

    // START WORKERS
    for (let i = 0; i < numCPUs; i++) cluster.fork();
  })();
}
else {
  // Trust Apache proxy
  app.set("trust proxy", "loopback"); // or simply: app.set("trust proxy", 1);

  // Debug route to verify IP + UA
  app.get("/api/debug/ip", (req, res) => {
    res.json({
      ip: req.ip,
      ips: req.ips,
      xff: req.headers["x-forwarded-for"],
      ua: req.get("user-agent"),
      proto: req.protocol
    });
  });

  app.use(express.json({ limit: '10000mb' }));
  app.use(express.urlencoded({ limit: '10000mb', extended: true }));
  app.use(cookieParser());
  app.use(cors({
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'X-Requested-With', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  }));
  app.use(bodyParser.json({ limit: '10000mb' }));
  app.use(bodyParser.urlencoded({ limit: '10000mb', extended: true }));
  app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

  app.use('/api/auth', authRoutes);
  app.use('/api', routes);

  if (apienv === 'live') {
    // static frontend
    const distPath = path.join(__dirname, '..', 'frontend', 'dist');
    // console.log("Serving frontend from:", distPath);
    app.use(express.static(distPath));

    // frontend routes
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  (async () => {
    await mongoConn();
    
    app.listen(port, () => {
      console.log(`Worker ${process.pid}: ${apienv.toUpperCase()}[${appenv.toUpperCase()}] Server running on port ${port}`);
      if (appenv !== 'production') {
        console.log(`Worker ${process.pid}: ${apienv.toUpperCase()}[${appenv.toUpperCase()}] Accepting requests from: ${origins[0]}`);
      }
    });
  })();
}