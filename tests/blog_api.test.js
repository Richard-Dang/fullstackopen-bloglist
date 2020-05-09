const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../src/app");
const api = supertest(app);
const helper = require("./test_helper");
const Blog = require("../src/models/blog");
const User = require("../src/models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

createUserToken = async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("secret", 10);
  const user = new User({ username: "root", passwordHash });
  await user.save();

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  return jwt.sign(userForToken, process.env.SECRET);
};

beforeEach(async () => {
  await Blog.deleteMany({});

  // for..of block allows for sequential async calls
  // use Promise.all() for parallel execution
  // forEach() cannot be used with async calls
  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog);
    await blogObject.save();
  }
});

describe("when there is initially some blogs saved", () => {
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");

    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test("a specific blog is within the returned blogs", async () => {
    const response = await api.get("/api/blogs");

    const urls = response.body.map((blog) => blog.url);
    expect(urls).toContain(
      "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html"
    );
  });

  test("blogs contains a unique id property", async () => {
    const response = await api.get("/api/blogs");

    response.body.forEach((blog) => {
      expect(blog.id).toBeDefined();
    });
  });
});

describe("addition of a new blog", () => {
  let token;
  beforeEach(async () => {
    token = `Bearer ${await createUserToken()}`;
  });

  test("fails with status code 401 if token is not provided", async () => {
    const newBlog = {
      title: "My Website",
      author: "Richard Dang",
      url: "http://richarddang.com/",
      likes: 99,
    };

    await api.post("/api/blogs").send(newBlog).expect(401);
  });

  test("succeeds with valid data", async () => {
    const newBlog = {
      title: "My Website",
      author: "Richard Dang",
      url: "http://richarddang.com/",
      likes: 99,
    };

    await api
      .post("/api/blogs")
      .set({ Authorization: token })
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAfterAddition = await helper.blogsInDb();
    expect(blogsAfterAddition).toHaveLength(helper.initialBlogs.length + 1);

    const urls = blogsAfterAddition.map((blog) => blog.url);
    expect(urls).toContain("http://richarddang.com/");
  });

  test("with missing likes property succeeds with 0 likes", async () => {
    const blogWithNoLikes = {
      title: "My Website",
      author: "Richard Dang",
      url: "http://richarddang.com/",
    };

    const response = await api
      .post("/api/blogs")
      .set({ Authorization: token })
      .send(blogWithNoLikes)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    expect(response.body.likes).toEqual(0);
  });

  test("with missing title and url fails with status code 400", async () => {
    const blogWithNoTitleAndUrl = {
      author: "Richard Dang",
      likes: 99,
    };

    await api
      .post("/api/blogs")
      .set({ Authorization: token })
      .send(blogWithNoTitleAndUrl)
      .expect(400);
  });
});

describe("deletion of a blog", () => {
  let token;
  beforeEach(async () => {
    token = `Bearer ${await createUserToken()}`;
  });

  test("succeeds with status code 204 if id is valid", async () => {
    const blogsBeforeDeletion = await helper.blogsInDb();
    const blogToDelete = blogsBeforeDeletion[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set({ Authorization: token })
      .expect(204);

    const blogsAfterDeletion = await helper.blogsInDb();
    expect(blogsAfterDeletion).toHaveLength(helper.initialBlogs.length - 1);
  });
});

describe("modification of a blog", () => {
  test("updates likes with valid data", async () => {
    const blogsBeforeUpdate = await helper.blogsInDb();
    const blogToUpdate = blogsBeforeUpdate[0];
    blogToUpdate.likes = 123;

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate);

    expect(response.body).toEqual(blogToUpdate);
  });
});

afterAll(() => mongoose.connection.close());
