import express from "express";

// local imports
import UserModel from "../models/UserModel.js";
import authMiddleware from "../middlewares/authMiddleware.js";

// init router
const router = express.Router();

// sigle post
router.get("/:postId", authMiddleware.requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: "View Post",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    postId: req.params.postId,
  };
  res.status(200).render("postPage", payload);
});

export default router;
