import express from "express";

// local imports
import UserModel from "../models/UserModel.js";

// init router
const router = express.Router();

router.get("/login", (req, res, next) => {
  res.status(200).render("auth/login");
});

router.post("/login", async (req, res, next) => {
  console.log(req.body);
  const { emailOrUserName, password } = req.body;

  const payload = {
    emailOrUserName,
    password,
  };

  if (emailOrUserName && password) {
    // check if user already exist

    try {
      let user = await UserModel.findOne({
        $or: [{ userName: emailOrUserName }, { email: emailOrUserName }],
      }).select("+hashed_password +salt");

      // check if user exist and throw a error
      if (!user) {
        payload.errorMessage = "Invalid credentials";
        return res.status(200).render("auth/login", payload);
      }

      if (!user.authenticate(password)) {
        payload.errorMessage = "Invalid credentials";
        return res.status(200).render("auth/login", payload);
      }
      req.session.user = user;
      return res.redirect("/");
    } catch (error) {
      payload.errorMessage = "Invalid credentials";
      return res.status(200).render("auth/login");
    }
  }
  payload.errorMessage = "Invalid credentials";
  return res.status(200).render("auth/login", payload);
});

// register
router.get("/register", (req, res, next) => {
  res.status(200).render("auth/register");
});

router.post("/register", async (req, res, next) => {
  console.log(req.body);
  const {
    firstName,
    lastName,
    userName,
    email,
    password,
    passwordConfirmation,
  } = req.body;

  const payload = {
    firstName,
    lastName,
    userName,
    email,
    password,
  };

  if (firstName && lastName && userName && email && password) {
    // check if user already exist
    console.log("hi");
    try {
      let user = await UserModel.findOne({
        $or: [{ userName }, { email }],
      });

      // check if user exist and throw a error
      if (user) {
        console.log(user);
        if (user.email === email) {
          payload.errorMessage = "User email already exists";
        }
        if (user.userName === userName) {
          payload.errorMessage = "Username already exists";
        }
        return res.status(200).render("auth/register", payload);
      }
      let newUser = new UserModel(payload);
      newUser = await newUser.save();
      req.session.user = newUser;
      return res.redirect("/");
    } catch (error) {
      payload.errorMessage = "Failed created user";
      return res.status(200).render("auth/register");
    }
  }
  payload.errorMessage = "Please fill in all form fields";
  return res.status(200).render("auth/register", payload);
});

export default router;
