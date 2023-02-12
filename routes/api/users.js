const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load User model
const User = require("../../models/User");
const {sendEmail, makeid} = require("../../config/mail");
const VerificationCode = require("../../models/verificationCode");

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
  // Form validation

  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });

      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
  // Form validation

  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }

    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name
        };

        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926 // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

router.post("/verify_email", async (req, res) => {
  try {
    const email = req.body.email;
    console.log(email)
    if (!(email)) {
      res.status(400).send("An email is required ");
    }else{
      let code = makeid(8)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await sendEmail(email, code)

      VerificationCode.findOneAndUpdate({email: req.body.email},{ $set: { code: code, expiresAt: expiresAt }, $inc: { __v: 1 }}, { upsert: true, setDefaultsOnInsert:true, useFindAndModify: false })
          .then(_ => res.status(200).json("success"))
          .catch(err => {
            res.status(500).json(err);
          });

    }
  } catch (err) {
    console.log(err);
  }
})

router.post("/verify_code", async (req, res) => {
  try {
    const email = req.body.email;
    const code = req.body.code;

    console.log(email+ ": "+ code)
    if (!(email)||!(code)) {
      res.status(400).send("An email is required ");
    }else{

      VerificationCode.findOne({email: req.body.email, code: req.body.code})
          .then(doc => {
            res.status(200).json(doc)
          })
          .catch(err => {
            res.status(500).json(err);
          });

    }
  } catch (err) {
    console.log(err);
  }
})


module.exports = router;
