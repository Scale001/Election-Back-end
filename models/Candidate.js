import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
      enum: ["100", "200", "300", "400", "500"], // Restricts to these values only
    },
    image: {
      type: String, // URL to stored image
      required: true,
    },
    manifesto: [
      {
        type: String,
        required: true,
      },
    ],
    votes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Candidate", candidateSchema);
