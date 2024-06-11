const blog = require('../models/blog')
const _ = require('lodash')

const dummy = blogs => {
  return 1
}

const totalLikes = blogs => {
  return blogs.length === 0
    ? 0
    : blogs.reduce((sum, blog) => {
        return sum + blog.likes
      }, 0)
}

const favoriteBlog = blogs => {
  if (blogs.length === 0) {
    return {}
  } else {
    const topBlog = _.maxBy(blogs, blog => blog.likes)
    return {
      title: topBlog.title,
      author: topBlog.author,
      likes: topBlog.likes,
    }
  }
}

const mostBlogs = blogs => {
  if (blogs.length === 0) {
    return ''
  } else {
    const authorCounts = _.countBy(blogs, 'author')
    const mostFrequentAuthor = _.maxBy(
      Object.keys(authorCounts),
      author => authorCounts[author]
    )
    return mostFrequentAuthor
  }
}

const mostLikes = blogs => {
  if (blogs.length === 0) {
    return ''
  } else {
    const blogsByAuthor = _.groupBy(blogs, 'author')
    const likesByAuthor = _.map(blogsByAuthor, (blogs, author) => ({
      author,
      sumLikes: _.sumBy(blogs, 'likes'),
    }))
    const authorWithMostLikes = _.maxBy(likesByAuthor, 'sumLikes').author
    return authorWithMostLikes
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
