const { test, describe } = require('node:test')
const assert = require('node:assert')

const listHelper = require('../utils/list_helper')
const testHelper = require('./test_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(testHelper.listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('when list has six blogs, equals the sum of likes', () => {
    const result = listHelper.totalLikes(testHelper.listWithSixBlogs)
    assert.strictEqual(result, 36)
  })

  test('when list is empty, equals zero', () => {
    const result = listHelper.totalLikes(testHelper.listWithZeroBlogs)
    assert.strictEqual(result, 0)
  })
})

describe('favorite blog', () => {
  test('when list has only one blog, return that blog', () => {
    const result = listHelper.favoriteBlog(testHelper.listWithOneBlog)
    assert.deepStrictEqual(result, {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      likes: 5,
    })
  })

  test('when list has six blogs, return blog with highest likes', () => {
    const result = listHelper.favoriteBlog(testHelper.listWithSixBlogs)
    assert.deepStrictEqual(result, {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12,
    })
  })

  test('when list is empty, return empty object', () => {
    const result = listHelper.favoriteBlog(testHelper.listWithZeroBlogs)
    assert.deepStrictEqual(result, {})
  })
})

describe('most blogs', () => {
  test('when list has six blogs, return author with most blogs', () => {
    const result = listHelper.mostBlogs(testHelper.listWithSixBlogs)
    assert.strictEqual(result, 'Robert C. Martin')
  })

  test('when list has one blog, return author of that blog', () => {
    const result = listHelper.mostBlogs(testHelper.listWithOneBlog)
    assert.strictEqual(result, 'Edsger W. Dijkstra')
  })

  test('when list is empty, return empty string', () => {
    const result = listHelper.mostBlogs(testHelper.listWithZeroBlogs)
    assert.strictEqual(result, '')
  })
})

describe('most likes', () => {
  test('when list has six blogs, return author with most likes', () => {
    const result = listHelper.mostLikes(testHelper.listWithSixBlogs)
    assert.strictEqual(result, 'Edsger W. Dijkstra')
  })

  test('when list has one blog, return author of that blog', () => {
    const result = listHelper.mostLikes(testHelper.listWithOneBlog)
    assert.strictEqual(result, 'Edsger W. Dijkstra')
  })

  test('when list is empty, return empty string', () => {
    const result = listHelper.mostLikes(testHelper.listWithZeroBlogs)
    assert.strictEqual(result, '')
  })
})
