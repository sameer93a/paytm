const express = require("express");
const router = express.Router();
const { z } = require("zod");
const { User, Account } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");
const bcrypt = require("bcrypt");

const signupSchema = z.object({
  username: z.string().email(),
  firstName: z.string(),
  lastname: z.string(),
  password: z.string(),
});

router.post("/signup", async (req, res) => {
  const data = signupSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(411).json({
      msg: "Email already taken/ Incorrect inputs",
    });
  }
  const existingUser = await User.findOne({
    username: req.body.username,
  });
  if (existingUser) {
    return res.status(411).json({
      msg: "Email already taken / Icorrect inputs",
    });
  }
  // Create the user with fake balacne
  const { password } = req.body;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await User.create({
    username: req.body.username,
    password: hashedPassword,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });
  const userId = user._id;

  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  });
  // -------------------------------
  const token = jwt.sign(
    {
      userId,
    },
    JWT_SECRET
  );
  res.json({
    msg: "User created successfully",
    token: token,
  });
});

const signinSchema = z.object({
  username: z.string().email(),
  password: z.string(),
});

router.post("/signin", async (req, res) => {
  const data = signinSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(411).json({
      msg: "Eamil already taken / Incorrect inputs",
    });
  }
  const { password } = await req.body;
  const user = await User.findOne({
    username: req.body.username,
  });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send("Invalid username or password.");
    }
    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET
    );
    res.json({
      token: token,
    });
    return;
  }
  res.status(411).json({
    msg: "Error while loggin in",
  });
});
