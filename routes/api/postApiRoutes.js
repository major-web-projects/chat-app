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
      .populate("repostData")
      .populate("replyTo")
      .sort({ createdAt: "-1" })
      .then(async (postsData) => {
        postsData = await UserModel.populate(postsData, {
          path: "replyTo.postedBy",
        });
        return await UserModel.populate(postsData, {
          path: "repostData.postedBy",
        });
      });
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Server Error" });
  }
});

// get single post
router.get("/:postId", async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await PostModel.findById(postId)
      .populate("postedBy")
      .populate("repostData")
      .populate("replyTo")
      .then(async (postsData) => {
        postsData = await UserModel.populate(postsData, {
          path: "replyTo.postedBy",
        });
        return await UserModel.populate(postsData, {
          path: "repostData.postedBy",
        });
      });
    let results = {
      postData: post,
    };

    if (post.replyTo) {
      results.replyTo = post.replyTo;
    }

    results.replies = await PostModel.find({ replyTo: postId })
      .populate("postedBy")
      .populate("repostData")
      .populate("replyTo")
      .then(async (postsData) => {
        postsData = await UserModel.populate(postsData, {
          path: "replyTo.postedBy",
        });
        return await UserModel.populate(postsData, {
          path: "repostData.postedBy",
        });
      });
    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Server Error" });
  }
});

router.post("/", (req, res, next) => {
  const { content, replyTo } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Please fill in content" });
  }

  let postData = {
    content,
    postedBy: req.session.user,
  };

  if (replyTo) {
    postData.replyTo = replyTo;
  }

  PostModel.create(postData)
    .then(async (post) => {
      post = await UserModel.populate(post, { path: "postedBy" });
      return res.status(201).json(post);
    })
    .catch((error) => {
      console.log(error.message);
      return res.status(500).json({ errorMessage: "Server Error" });
    });
});

// LIKE POST
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

// REPOST POST
router.post("/:postId/repost", async (req, res, next) => {
  const { postId } = req.params;
  const user = req.session.user;
  const userId = user._id;

  if (!postId) {
    return res.status(400).json({ error: "Please fill in content" });
  }

  try {
    const deletePost = await PostModel.findOneAndDelete({
      postedBy: userId,
      repostData: postId,
    });

    const option = deletePost !== null ? "$pull" : "$addToSet";
    let repost = deletePost;

    if (!repost) {
      repost = await PostModel.create({
        postedBy: userId,
        repostData: postId,
      });
    }

    // user like post
    req.session.user = await UserModel.findByIdAndUpdate(
      userId,
      {
        [option]: { reposts: repost._id },
      },
      { new: true }
    );

    // post liked by user
    const post = await PostModel.findByIdAndUpdate(
      postId,
      {
        [option]: { repostUsers: userId },
      },
      { new: true }
    )
      .populate("postedBy")
      .populate("repostData");

    return res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ errorMessage: "Server Error" });
  }
});

// delete single post
router.delete("/:postId", async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await PostModel.findByIdAndRemove(postId);
    res.status(200).json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Server Error" });
  }
});

export default router;
