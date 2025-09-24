import mongoose from "mongoose";

const electionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["General", "Departmental", "Sports"],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Upcoming", "Active", "Ended"],
      default: "Upcoming",
    },
    candidates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
      },
    ],
    voters: {
      type: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          votedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [], // Initialize as empty array
    },
  },
  { timestamps: true }
);

// Middleware to automatically set status based on dates
electionSchema.pre("save", function (next) {
  const now = new Date();
  if (now < this.startDate) {
    this.status = "Upcoming";
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = "Active";
  } else {
    this.status = "Ended";
  }
  next();
});

export default mongoose.model("Election", electionSchema);
