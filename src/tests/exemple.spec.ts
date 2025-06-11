import { test, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../app'

beforeAll(async () => {
  // used to await fastify register all plugins and be ready to be used
  await app.ready()
})

afterAll(async () => {
  // remove fastify from memory after all tests
  await app.close()
})

test('user can create a new transaction', async () => {
  await request(app.server)
    .post('/transactions')
    .send({ title: 'new transaction', amount: 5000, type: 'credit' })
    .expect(201)
})
