import { v2 as cloudinary } from "cloudinary";

import dotenv from "dotenv";

dotenv.config();
cloudinary.config({
  cloud_name: "dzjqah2ax",
  api_key: "761853253531633",
  api_secret: "U9wmhPWYA7LT7AJ3PQxIXUvFz6k",
});

const cloud = cloudinary;

export default cloud;
