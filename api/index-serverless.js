import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoConn from "./db/dbcon.js";
import authRoutes from "./routes/authRoute.js";
import routes from "./routes/route.js";
dotenv.config({ quiet: true });


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


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


// ✅ connect DB ONCE (safe for serverless)
await mongoConn();

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
app.use(express.static('uploads'));

// routes
app.use("/api/auth", authRoutes);
app.use("/api", routes);

// test route
// app.get("/", (req, res) => {
//   res.json({ message: "API working on Vercel" });
// });

export default app;
