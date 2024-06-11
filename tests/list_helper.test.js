const { test, describe } = require('node:test')
const assert = require('node:assert')

const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0,
    },
  ]

  const listWithThreeBlogs = [
    {
      _id: '6666c14a8bd4d39c9b158239',
      title: 'Blog Title',
      author: 'Blog Author',
      url: 'www.example.com',
      likes: 34,
      __v: 0,
    },
    {
      _id: '666763606eceb02234783f02',
      title: 'Blog Title 2',
      author: 'Blog Author',
      url: 'www.example.com',
      likes: 343,
      __v: 0,
    },
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0,
    },
  ]

  const listWithZeroBlogs = []

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('when list has three blogs, equals the sum of likes', () => {
    const result = listHelper.totalLikes(listWithThreeBlogs)
    assert.strictEqual(result, 382)
  })

  test('when list is empty, equals zero', () => {
    const result = listHelper.totalLikes(listWithZeroBlogs)
    assert.strictEqual(result, 0)
  })
})
