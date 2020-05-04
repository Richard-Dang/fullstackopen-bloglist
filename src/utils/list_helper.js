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

module.exports = { dummy, totalLikes, favoriteBlog };
