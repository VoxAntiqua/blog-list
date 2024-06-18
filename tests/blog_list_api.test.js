const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')

const api = supertest(app)

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

after(async () => {
  await mongoose.connection.close()
})
