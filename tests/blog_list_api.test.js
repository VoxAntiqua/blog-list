const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

describe('when database initially has blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    for (let blog of helper.listWithSixBlogs) {
      let blogObject = new Blog(blog)
      await blogObject.save()
    }
  })

  describe('retrieving entries', () => {
    test('GET returns blog posts as json', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('GET returns correct number of blog posts', async () => {
      const response = await helper.blogsInDb()
      assert.strictEqual(response.length, helper.listWithSixBlogs.length)
    })

    test('Unique identifier is named "id"', async () => {
      const response = await helper.blogsInDb()
      assert(Object.hasOwn(response[0], 'id'))
    })
  })

  describe('adding entries', () => {
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

      const response = await helper.blogsInDb()

      const titles = response.map(r => r.title)

      assert.strictEqual(response.length, helper.listWithSixBlogs.length + 1)
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

      const response = await helper.blogsInDb()

      assert(Object.hasOwn(response[response.length - 1], 'likes'))
      assert.strictEqual(response[response.length - 1].likes, 0)
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
  })

  describe('deleting entries', () => {
    test('Can delete blog entry', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)
      const blogsAtEnd = await helper.blogsInDb()
      const ids = blogsAtEnd.map(b => b.id)

      assert(!ids.includes(blogToDelete.id))
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
    })
  })

  describe('updating entries', () => {
    test('Can update blog entry', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const newBlog = {
        title: 'Test Addition',
        author: 'Homer Simpson',
        url: 'http://example.com/',
        likes: 0,
        id: blogToUpdate.id,
      }

      await api.put(`/api/blogs/${blogToUpdate.id}`).send(newBlog).expect(200)

      const blogsAtEnd = await helper.blogsInDb()
      assert.deepStrictEqual(blogsAtEnd[0], newBlog)
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })
  })
})

describe('user administration tests', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    for (let user of helper.initialUsers) {
      let userObject = new User(user)
      await userObject.save()
    }
  })

  test('valid user can be added', async () => {
    const newUser = {
      username: 'newuser',
      name: 'New User',
      password: 'newuserpassword',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await helper.usersInDb()

    const usernames = response.map(r => r.username)

    assert.strictEqual(response.length, helper.initialUsers.length + 1)
    assert(usernames.includes('newuser'))
  })
})

after(async () => {
  await mongoose.connection.close()
})
