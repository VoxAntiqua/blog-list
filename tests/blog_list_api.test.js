const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')

const api = supertest(app)

describe('when database initially has blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    for (let blog of helper.listWithSixBlogs) {
      let blogObject = new Blog(blog)
      await blogObject.save()
    }
  })

  test('GET returns blog posts as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('GET returns correct number of blog posts', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.listWithSixBlogs.length)
  })

  test('Unique identifier is named "id"', async () => {
    const response = await api.get('/api/blogs')
    assert(Object.hasOwn(response.body[0], 'id'))
  })

  test('New blog is correctly added', async () => {
    const newBlog = {
      title: 'Test Addition',
      author: 'Homer Simpson',
      url: 'http://example.com/',
      likes: 0,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    assert.strictEqual(response.body.length, helper.listWithSixBlogs.length + 1)
    assert(titles.includes('Test Addition'))
  })

  test('Added blog with no likes property defaults to 0', async () => {
    const newBlog = {
      title: 'Test Addition',
      author: 'Homer Simpson',
      url: 'http://example.com/',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    assert(Object.hasOwn(response.body[response.body.length - 1], 'likes'))
    assert.strictEqual(response.body[response.body.length - 1].likes, 0)
  })

  test('Missing title or url properties gets response of 400 Bad Request', async () => {
    const noUrlBlog = {
      title: 'Test Addition',
      author: 'Homer Simpson',
    }

    const noTitleBlog = {
      author: 'Homer Simpson',
      url: 'http://example.com',
    }

    await api.post('/api/blogs').send(noUrlBlog).expect(400)
    await api.post('/api/blogs').send(noTitleBlog).expect(400)
  })

  /*   test('Can delete blog entry', async () => {
    const response = await api.get('/api/blogs')
    const idToDelete = response.body.id
    await api.delete(`/api/blogs/${idToDelete}`)
  }) */
})

after(async () => {
  await mongoose.connection.close()
})
