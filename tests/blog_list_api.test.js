const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

let token

beforeEach(async () => {
  await helper.initializeUsers()

  const loginResponse = await api.post('/api/login').send({
    username: helper.initialUsers[0].username,
    password: helper.initialUsers[0].password,
  })

  token = loginResponse.body.token

  await Blog.deleteMany({})
  for (let blog of helper.listWithSixBlogs) {
    let blogObject = new Blog({ ...blog, user: loginResponse.body.id })
    await blogObject.save()
  }
})

describe('user administration tests', () => {
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

test('user with invalid username is not added', async () => {
  const newUser = {
    username: 'a',
    name: 'New User',
    password: 'newuserpassword',
  }

  const usersAtStart = await helper.usersInDb()

  await api.post('/api/users').send(newUser).expect(400)

  const usersAtEnd = await helper.usersInDb()

  assert.strictEqual(usersAtStart.length, usersAtEnd.length)
})

test('user with invalid password is not added', async () => {
  const newUser = {
    username: 'newuser',
    name: 'New User',
    password: 'n',
  }

  const usersAtStart = await helper.usersInDb()

  await api.post('/api/users').send(newUser).expect(400)

  const usersAtEnd = await helper.usersInDb()

  assert.strictEqual(usersAtStart.length, usersAtEnd.length)
})

test('user with non-unique username is not added', async () => {
  const usersAtStart = await helper.usersInDb()

  const newUser = {
    username: usersAtStart[0].username,
    name: 'New User',
    password: 'newuserpassword',
  }

  await api.post('/api/users').send(newUser).expect(400)

  const usersAtEnd = await helper.usersInDb()

  assert.strictEqual(usersAtStart.length, usersAtEnd.length)
})

describe('blog routes tests', () => {
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
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const response = await helper.blogsInDb()

      const titles = response.map(r => r.title)

      assert.strictEqual(response.length, helper.listWithSixBlogs.length + 1)
      assert(titles.includes('Test Addition'))
    })

    test('Adding a blog fails if token is not provided', async () => {
      const newBlog = {
        title: 'Test Addition',
        author: 'Homer Simpson',
        url: 'http://example.com/',
        likes: 0,
      }

      const blogsAtStart = await helper.blogsInDb()

      await api.post('/api/blogs').send(newBlog).expect(401)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtStart.length, blogsAtEnd.length)
    })

    test('Added blog with no likes property defaults to 0', async () => {
      const newBlog = {
        title: 'Test Addition',
        author: 'Homer Simpson',
        url: 'http://example.com/',
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
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

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(noUrlBlog)
        .expect(400)
      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(noTitleBlog)
        .expect(400)
    })
  })

  describe('deleting entries', () => {
    test('Can delete blog entry', async () => {
      const newUser = {
        username: 'testuser',
        name: 'Test User',
        password: 'testpassword',
      }

      // Create and login user
      await api.post('/api/users').send(newUser)
      const loginResponse = await api.post('/api/login').send(newUser)
      const token = loginResponse.body.token

      const newBlog = {
        title: 'Test Blog',
        author: 'Test Author',
        url: 'http://example.com',
        likes: 0,
      }

      // Add blog with user token
      const blogResponse = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)

      const blogToDelete = blogResponse.body

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      const ids = blogsAtEnd.map(b => b.id)

      assert(!ids.includes(blogToDelete.id))
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

after(async () => {
  await mongoose.connection.close()
})
