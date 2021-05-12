import express from "express";
import path from "path";

// local imports
import routes from "./routes/index.js";
import authMiddleware from "./middlewares/authMiddleware.js";

// init app
const app = express();
const port = 3000;

// middlewares
app.set("view engine", "pug");
app.set("views", "views");
app.use(express.static("public"));

app.use("/auth", routes.authRoutes);

app.get("/", authMiddleware.requireLogin, (req, res, next) => {
  const payload = { title: "Chat App" };
  res.status(200).render("home", payload);
});

const server = app.listen(port, () => {
  console.log(`App running at port -> ${port}`);
});
