const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const authenticateUser = require("../middlewares/authenticateUser");

blogsRouter.use(authenticateUser);

blogsRouter.get("/", async (req, res) => {
  const blogs = await Blog.find({})
    .populate("user", {
      username: 1,
      name: 1,
    })
    .populate("comments", {
      content: 1,
    });
  res.json(blogs);
});

blogsRouter.post("/", async (req, res) => {
  const newBlog = req.body;
  const user = req.user;

  if (!newBlog.url && !newBlog.title) {
    return res.status(400).send({ error: "url and title are missing" });
  }
  if (!newBlog.likes) {
    newBlog.likes = 0;
  }

  newBlog.user = user._id;

  const blog = new Blog(newBlog);
  const returnedBlog = await blog.save();
  user.blogs = user.blogs.concat(returnedBlog._id);
  await user.save();

  res.status(201).json(returnedBlog);
});

blogsRouter.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const user = req.user;
  const blog = await Blog.findById(id);

  if (!blog || blog.user.toString() !== user._id.toString()) {
    return res.status(401).end();
  }

  await Blog.findByIdAndRemove(id);
  res.status(204).end();
});

blogsRouter.put("/:id", async (req, res) => {
  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  })
    .populate("user", {
      username: 1,
      name: 1,
    })
    .populate("comments", {
      content: 1,
    });
  res.json(updatedBlog);
});

module.exports = blogsRouter;
