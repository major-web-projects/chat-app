import express from "express";

// local imports
import UserModel from "../models/UserModel.js";
import authMiddleware from "../middlewares/authMiddleware.js";

// init router
const router = express.Router();

// sigle profile
router.get("/", authMiddleware.requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: `${req.session.user.userName} Profile`,
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    profileUser: req.session.user,
  };
  res.status(200).render("profilePage", payload);
});

router.get(
  "/:username",
  authMiddleware.requireLogin,
  async (req, res, next) => {
    const { username } = req.params;

    try {
      const user = await UserModel.findOne({ userName: username });

      if (!user) {
        const payload = {
          pageTitle: `User not found`,
          userLoggedIn: req.session.user,
          userLoggedInJs: JSON.stringify(req.session.user),
          profileUser: {},
        };
        res.status(200).render("profilePage", payload);
      }
      const payload = {
        pageTitle: `${user.userName} Profile`,
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUser: user,
      };
      res.status(200).render("profilePage", payload);
    } catch (error) {
      console.log(error);
      res.status(500).json({ errorMessage: "Server Error" });
    }
  }
);

router.get(
  "/:username/replies",
  authMiddleware.requireLogin,
  async (req, res, next) => {
    const { username } = req.params;

    try {
      const user = await UserModel.findOne({ userName: username });

      if (!user) {
        const payload = {
          pageTitle: `User not found`,
          userLoggedIn: req.session.user,
          userLoggedInJs: JSON.stringify(req.session.user),
          profileUser: {},
        };
        res.status(200).render("profilePage", payload);
      }
      const payload = {
        pageTitle: `${user.userName} Profile`,
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUser: user,
        selectedTab: "replies",
      };
      res.status(200).render("profilePage", payload);
    } catch (error) {
      console.log(error);
      res.status(500).json({ errorMessage: "Server Error" });
    }
  }
);

export default router;
