import Election from "../models/Election.js";
import Candidate from "../models/Candidate.js";
import mongoose from "mongoose";
import { Router } from "express";
import { promisify } from "util";
import upload from "../utils/multer.js";
import cloud from "../utils/cloudinary.js"; // Assuming you have a cloudinary setup
import UserSchema from "../schema/user.js";

const ElectionRouter = Router();

// Create a new election with candidates
ElectionRouter.post(
  "/create-election",
  upload.fields([{ name: "file" }]),
  async (req, res) => {
    try {
      const { name, type, startDate, endDate, candidates } = req.body;

      // Create election
      const election = new Election({
        name,
        type,
        startDate,
        endDate,
      });

      // Process each candidate

      const imageUrls = [];

      await Promise.all(
        req.files.file.map(async (image) => {
          const uploadPromise = promisify(cloud.uploader.upload);
          const result = await uploadPromise(image.path);
          const { public_id, secure_url } = result;
          imageUrls.push({ public_id, url: secure_url });
        })
      );

      const candidatePromises = candidates.map(async (candidateData) => {
        // Handle image upload first
        const imageUrl = imageUrls[candidates.indexOf(candidateData)].url;

        const candidate = new Candidate({
          name: candidateData.name,
          position: candidateData.position,
          department: candidateData.department,
          level: candidateData.level,
          image: imageUrl,
          manifesto: candidateData.manifesto,
        });

        await candidate.save();
        return candidate._id;
      });

      // Wait for all candidates to be created
      const candidateIds = await Promise.all(candidatePromises);
      election.candidates = candidateIds;

      await election.save();

      res.status(201).json({
        success: true,
        message: "Election created successfully",
        data: election,
      });
    } catch (error) {
      console.log(error, 69);
      res.status(500).json({
        success: false,
        message: "Error creating election",
        error: error.message,
      });
    }
  }
);
// Get all elections
ElectionRouter.get("/elections", async (req, res) => {
  try {
    const elections = await Election.find()
      .populate({
        path: "candidates",
        select: "name position department level image manifesto votes",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: elections,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching elections",
      error: error.message,
    });
  }
});

// Get single election
ElectionRouter.get("/elections/:id", async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).populate({
      path: "candidates",
      select: "name position department level image manifesto votes",
    });

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    res.status(200).json({
      success: true,
      data: election,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching election",
      error: error.message,
    });
  }
});

// Cast vote
ElectionRouter.post(
  "/elections/:electionId/candidates/:candidateId/vote",
  async (req, res) => {
    try {
      const { electionId, candidateId } = req.params;
      const userId = req.body.id;

      // Check if user has already voted in this election using their voting history
      const user = await UserSchema.findOne({
        _id: userId,
        "votingHistory.electionId": electionId,
      });

      if (user) {
        return res.status(400).json({
          success: false,
          message: "You have already voted in this election",
        });
      }
      const userExists = await UserSchema.findById(userId);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Update candidate votes
      const updatedCandidate = await Candidate.findOneAndUpdate(
        { _id: candidateId },
        { $inc: { votes: 1 } },
        { new: true }
      );

      if (!updatedCandidate) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      // Add voter to election
      await Election.findByIdAndUpdate(electionId, {
        $push: {
          voters: {
            userId,
            candidateId,
            votedAt: new Date(),
          },
        },
      });

      // Add vote to user's voting history
      await UserSchema.findByIdAndUpdate(userId, {
        $push: {
          votingHistory: {
            electionId,
            candidateId,
            votedAt: new Date(),
          },
        },
      });

      res.status(200).json({
        success: true,
        message: "Vote cast successfully",
        data: { candidate: updatedCandidate },
      });
    } catch (error) {
      console.error("Vote casting error:", error);
      res.status(500).json({
        success: false,
        message: "Error casting vote",
        error: error.message,
      });
    }
  }
);

// Get election results
ElectionRouter.get("/elections/:id/results", async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).populate({
      path: "candidates",
      select: "name position votes",
    });

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Only show results if election has ended
    if (election.status !== "Ended") {
      return res.status(403).json({
        success: false,
        message: "Results are only available after election ends",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        electionName: election.name,
        totalVotes: election.voters.length,
        candidates: election.candidates,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching results",
      error: error.message,
    });
  }
});

export default ElectionRouter;
