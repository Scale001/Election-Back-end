import mongoose, { Schema, mongo } from "mongoose";

const schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
    },
    mat_number: {
      type: String,
      require: true,
    },
    name: {
      type: String,
      require: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },
    votingHistory: [
      {
        electionId: {
          type: Schema.Types.ObjectId,
          ref: "Election",
        },
        candidateId: {
          type: Schema.Types.ObjectId,
          ref: "Candidate",
        },
        votedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

schema.index({ "votingHistory.electionId": 1 });

const UserSchema = mongoose.model("scales-users", schema);

export default UserSchema;
