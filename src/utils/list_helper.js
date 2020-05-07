const _ = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.length === 0
    ? 0
    : blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  const mostLiked = blogs.reduce(
    (max, blog) => (max.likes > blog.likes ? max : blog),
    []
  );
  const { title, author, likes } = mostLiked;

  return { title, author, likes };
};

const mostBlogs = (blogs) => {
  const numBlogsByAuthor = _.countBy(blogs, (blog) => blog.author);

  const authorWithMostBlogs = _.max(
    Object.keys(numBlogsByAuthor),
    (key) => numBlogsByAuthor[key]
  );

  return {
    author: authorWithMostBlogs,
    blogs: numBlogsByAuthor[authorWithMostBlogs],
  };
};

const mostLikes = (blogs) => {
  const blogsGroupedByAuthor = _.groupBy(blogs, (blog) => blog.author);
  const totalLikesByAuthor = [];

  Object.keys(blogsGroupedByAuthor).forEach((key) => {
    totalLikesByAuthor.push({
      author: key,
      likes: blogsGroupedByAuthor[key].reduce(
        (totalLikes, blog) => (totalLikes += blog.likes),
        0
      ),
    });
  });

  const mostLikedAuthor = totalLikesByAuthor.reduce(
    (max, item) => (max.likes > item.likes ? max : item),
    []
  );

  const { author, likes } = mostLikedAuthor;

  return {
    author,
    likes,
  };
};

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes };
