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
    let topBlog = blogs[0]
    blogs.forEach(blog => {
      if (blog.likes > topBlog.likes) {
        topBlog = blog
      }
    })
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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
}
