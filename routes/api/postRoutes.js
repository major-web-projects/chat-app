import express from "express";

// local imports
import UserModel from "../../models/UserModel.js";
import PostModel from "../../models/PostModel.js";

// init router
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const posts = await PostModel.find({})
      .populate("postedBy")
      .sort({ createdAt: "-1" });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ errorMessage: "Server Error" });
  }
});

router.post("/", (req, res, next) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Please fill in content" });
  }

  PostModel.create({
    content,
    postedBy: req.session.user,
  })
    .then(async (post) => {
      post = await UserModel.populate(post, { path: "postedBy" });
      return res.status(201).json(post);
    })
    .catch((error) => {
      console.log(error.message);
      return res.status(500).json({ errorMessage: "Server Error" });
    });
});

router.put("/:postId/like", async (req, res, next) => {
  const { postId } = req.params;
  const user = req.session.user;
  const userId = user._id;

  if (!postId) {
    return res.status(400).json({ error: "Please fill in content" });
  }

  try {
    const isLiked = user.likes && user.likes.includes(postId);

    const option = isLiked ? "$pull" : "$addToSet";

    // user like post
    req.session.user = await UserModel.findByIdAndUpdate(
      userId,
      {
        [option]: { likes: postId },
      },
      { new: true }
    );

    // post liked by user
    const post = await PostModel.findByIdAndUpdate(
      postId,
      {
        [option]: { likes: userId },
      },
      { new: true }
    ).populate("postedBy");

    return res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ errorMessage: "Server Error" });
  }
});

export default router;
