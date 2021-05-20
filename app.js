import express, { json } from "express";
import session from "express-session";

// local imports
import routes from "./routes/index.js";
import authMiddleware from "./middlewares/authMiddleware.js";
import appConfig from "./config/appConfig.js";

// init app
const app = express();
const port = appConfig.port;

// connect to mongodb
appConfig.mongoConnect(appConfig.mongoURI);

// middlewares
app.set("view engine", "pug");
app.set("views", "views");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "chat", resave: true, saveUninitialized: false }));

// views
app.use("/auth", routes.authRoutes);

// /api/
app.use("/api/posts", routes.postRoutes);

app.get("/", authMiddleware.requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  res.status(200).render("home", payload);
});

const server = app.listen(port, () => {
  console.log(`App running at port -> ${port}`);
});
