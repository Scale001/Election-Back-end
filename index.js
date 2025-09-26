import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";
import cron from "node-cron";

import UserRouter from "./routes/user.js";
import socketHandler from "./utils/socketHandlers.js";
import ElectionRouter from "./controllers/electionController.js";
// import deleteOldMedia from "/./utils/deleteMedia.js";

// import

dotenv.config();
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://voxa.onrender.com",
    "https://voxa.buzz",
    "https://www.voxa.buzz",
    "http://192.168.214.243:5173",
    "https://election-front-end.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTENDURL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

app.set("io", io);

app.use("/", UserRouter);
app.use("/", ElectionRouter);
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "Done", cookie: req.cookies["ibm-device-id"] });
});

io.on("connection", (socket) => {
  socketHandler(io, socket); // <- THIS is calling your socket module
});

async function connectMongo() {
  console.log("Starting");
  try {
    await mongoose.connect(process.env.MONGOCONNECTIONSTRING);
    console.log("CONNECTED");
    server.listen(3000, () => {
      console.log("Server running on port 3000");
    });
    // makeAnalytics();
  } catch (error) {
    console.log(error);
  }
}

connectMongo();
// app.listen(3000, () => {
//   console.log("Server running on port 3000");
// });

cron.schedule("0 0 * * *", async () => {
  await deleteOldMedia();
  console.log("This runs every day at midnight");
});
