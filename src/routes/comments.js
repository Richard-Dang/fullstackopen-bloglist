const commentsRouter = require("express").Router({ mergeParams: true });
const authenicateUser = require("../middlewares/authenticateUser");
const Comment = require("../models/comment");
const ObjectId = require("mongoose").Types.ObjectId;
const Blog = require("../models/blog");

commentsRouter.use(authenicateUser);

commentsRouter.get("/", async (req, res) => {
  const blogId = req.params.blogId;

  const comments = await Comment.find({ blog: new ObjectId(blogId) }).populate(
    "blog",
    {
      title: 1,
      author: 1,
      url: 1,
    }
  );
  res.json(comments);
});

commentsRouter.post("/", async (req, res) => {
  const blog = await Blog.findById(req.params.blogId);
  const newComment = req.body;
  if (!newComment.content) {
    return res.status(400).send({ error: "comment content is missing" });
  }

  newComment.blog = blog._id;
  const comment = new Comment(newComment);
  const returnedComment = await comment.save();
  blog.comments = blog.comments.concat(returnedComment._id);
  await blog.save();

  res.status(201).json(returnedComment);
});

module.exports = commentsRouter;
