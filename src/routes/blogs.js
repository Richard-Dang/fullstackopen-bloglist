const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", async (req, res) => {
  const blogs = await Blog.find({});
  res.json(blogs);
});

blogsRouter.post("/", async (req, res) => {
  if (!req.body.url && !req.body.title) {
    return res.status(400).send({ error: "url and title are missing" });
  } else if (!req.body.likes) {
    req.body.likes = 0;
  }

  const blog = new Blog(req.body);
  const returnedBlog = await blog.save();
  res.status(201).json(returnedBlog);
});

blogsRouter.delete("/:id", async (req, res) => {
  const id = req.params.id;
  await Blog.findByIdAndRemove(id);
  res.status(204).end();
});

blogsRouter.put("/:id", async (req, res) => {
  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updatedBlog);
});

module.exports = blogsRouter;
