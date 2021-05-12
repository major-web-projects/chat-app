import express from "express";
const router = express.Router();

router.get("/login", (req, res, next) => {
  res.status(200).render("auth/login");
});

router.get("/register", (req, res, next) => {
  res.status(200).render("auth/register");
});

export default router;
