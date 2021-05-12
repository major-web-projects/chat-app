import express from "express";

// local imports
import authMiddleware from "./middlewares/authMiddleware.js";

// init app
const app = express();
const port = 3000;

// middlewares
app.set("view engine", "pug");
app.set("views", "views");

app.get("/", authMiddleware.requireLogin, (req, res, next) => {
  const payload = { title: "Chat App" };
  res.status(200).render("home", payload);
});

const server = app.listen(port, () => {
  console.log(`App running at posr -> ${port}`);
});
