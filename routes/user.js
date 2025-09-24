import { Router } from "express";
import UserSchema from "../schema/user.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import * as argon2 from "argon2";
import {
  sendAccountActivationMail,
  sendPasswordResetEmail,
} from "../utils/sendEmail.js";
import axios from "axios";

const UserRouter = Router();

const hashPassword = async (password) => {
  const result = await argon2.hash(password);
  return result;
};

const comparePassword = async (savedPassword, enteredPassword) => {
  const isMatch = await argon2.verify(savedPassword, enteredPassword);
  return isMatch;
};

UserRouter.post("/account/register", async (req, res) => {
  console.log("register");
  try {
    const passwordHash = await hashPassword(req.body.password);
    const result = new UserSchema({
      ...req.body,
      passwordHash,
    });
    console.log(result);
    await result.save();
    const emailConfirmationToken = jwt.sign(
      {
        version: 0,
        role: "emailConfirmation",
        Id: result._id,
      },
      process.env.JWTSECRET,
      {
        expiresIn: "10m",
      }
    );

    sendAccountActivationMail(
      result.email,
      result.email,
      process.env.FRONTENDURL +
        "/verify-email?token=" +
        emailConfirmationToken +
        "&email=" +
        result.email
    );
    console.log(emailConfirmationToken);
    res.status(200).json(result);
  } catch (error) {
    console.log("ERROR");
    console.log(error);
    if (error.errorResponse?.code == 11000 && error.keyPattern.email) {
      return res.status(460).json({ ...error, status: 460 });
    }
    if (error.errorResponse?.code == 11000 && error.keyPattern.mat_number) {
      return res.status(461).json({ ...error, status: 461 });
    }
    console.log(error);
    res.status(500).json({ error });
  }
});

UserRouter.post("/account/verify-email", async (req, res) => {
  try {
    const token = req.body.token;
    const vefified = jwt.verify(token, process.env.JWTSECRET);
    const { Id } = vefified;
    const user = await UserSchema.findOne({ _id: Id });
    console.log(user);
    user.emailConfirmed = true;
    user.version = user.version + 1;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    if (error.name == "JsonWebTokenError") {
      return res.status(460).json({ error: "Invalid or expired token" });
    }
    console.log(error);
    res.status(500).json(error);
  }
});

// UserRouter.post("/account/request-verification-token", async (req, res) => {
//   try {
//     const email = req.body.email;

//     const result = await UserSchema.findOne({ email });
//     console.log(result);

//     if (!result) {
//       return res.status(404).json({ message: "No user with this email" });
//     }

//     // const emailConfirmationToken = jwt.sign(
//     //   {
//     //     version: 0,
//     //     role: "emailConfirmation",
//     //     Id: result._id,
//     //   },
//     //   process.env.JWTSECRET,
//     //   {
//     //     expiresIn: "10m",
//     //   }
//     // );
//     // sendAccountActivationMail(
//     //   result.email,
//     //   result.username,
//     //   process.env.FRONTENDURL +
//     //     "/verify-email?token=" +
//     //     emailConfirmationToken +
//     //     "&email=" +
//     //     result.email
//     // );

//     res.status(200).json({ message: "Done" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error });
//   }
// });

UserRouter.post("/account/login", async (req, res) => {
  try {
    const { mat_number, password } = req.body;
    console.log("LOGIN");
    console.log(req.body, 135);
    const user = await UserSchema.findOne({ mat_number });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid matric number or password" });
    }

    console.log(user, 143);

    const passwordMatch = await comparePassword(user.passwordHash, password);
    if (!passwordMatch) {
      return res
        .status(404)
        .json({ message: "Invalid matric number or password" });
    }
    // if (user.emailConfirmed === false) {
    //   const emailConfirmationToken = jwt.sign(
    //     {
    //       version: 0,
    //       role: "emailConfirmation",
    //       Id: result._id,
    //     },
    //     process.env.JWTSECRET,
    //     {
    //       expiresIn: "10m",
    //     }
    //   );
    //   sendAccountActivationMail(
    //     user.email,
    //     user.email,
    //     process.env.FRONTENDURL +
    //       "/verify-email?token=" +
    //       emailConfirmationToken +
    //       "&email=" +
    //       user.email
    //   );

    //   return res.status(400).json({ message: "Email not verified" });
    // }

    const token = jwt.sign({ Id: user._id }, process.env.JWTSECRET, {
      expiresIn: "30d",
    });

    const sendUser = {
      ...user._docs,
      Id: user._id.toString(),
      token,
      password: "",
      version: 0,
    };
    res.status(200).json(sendUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

UserRouter.get("/account/current-user", async (req, res) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || authorization.length < 10) {
      return res.status(400).json({ message: "Invalid token in header" });
    }

    const token = authorization.split("Bearer ")[1];
    const userId = jwt.verify(token, process.env.JWTSECRET);
    const user = await UserSchema.findOne({ _id: userId.Id });

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    res.status(200).json({
      ...user._doc,
      Token: userId.Id,
      Id: userId.Id,
      password: "",
      BusinessId: user?.businessId,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

UserRouter.post("/account/request-password-reset-mail", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserSchema.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No user with this email!" });
    }
    const token = jwt.sign(
      { Id: user._id, version: user.version ? user.version : 0 },
      process.env.JWTSECRET,
      { expiresIn: "10m" }
    );

    sendPasswordResetEmail(
      email,
      user.username,
      process.env.FRONTENDURL + "/create-new-password?token=" + token
    );
    console.log("SENT");
    res.status(200).json({ message: "Sent to " + email });
  } catch (error) {
    res.status(500).json(error);
  }
});

// UserRouter.post("/account/reset-password", async (req, res) => {
//   try {
//     const { password, token } = req.body;
//     const userId = jwt.verify(token, process.env.JWTSECRET);

//     const user = await UserSchema.findById(userId.Id);

//     if (!user) {
//       return res.status(404).json({ message: "No user found!" });
//     } else if (user.version !== userId.version) {
//       return res.status(460).json({ message: "Token already used!" });
//     }

//     const newPassword = await hashPassword(password);

//     user.password = newPassword;
//     user.version = user.version + 1;
//     await user.save();

//     // sendPasswordResetEmail(email ,"Ameh" , process.env.BASR_URL + token)
//     res.status(200).json({ message: "password reset sucessful" });
//   } catch (error) {
//     console.log(error);
//     if (error.name == "TokenExpiredError") {
//       console.log("WWWWWWWWWWWWWWWWWWW");
//       return res.status(460).json({ message: "Token already used!" });
//     }
//     res.status(500).json(error);
//   }
// });

UserRouter.post("/account/google-auth", async (req, res) => {
  try {
    const { idToken } = req.body;

    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    console.log(response.data);
    const userExists = await UserSchema.findOne({ email: response.data.email });
    if (userExists) {
      const token = jwt.sign({ id: userExists._id }, process.env.JWTSECRET, {
        expiresIn: "30d",
      });

      return res
        .status(200)
        .json({ user: userExists, token, message: "Logged in existing user" });
    }
    if (!userExists) {
      const newUser = new UserSchema({
        email: response.data.email,
        profile: {
          fullName: response.data.name,
          avatarUrl: response.data.picture,
        },
        googleId: response.data.sub,
        emaiVerified: true,
      });

      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWTSECRET, {
        expiresIn: "30d",
      });
      return res
        .status(200)
        .json({ user: newUser, token, message: "new user registered" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});
export default UserRouter;
