import { beforeAll, afterAll, describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { execSync } from 'node:child_process'

describe('Transactions routes', async () => {
  beforeAll(async () => {
    // used to await fastify register all plugins and be ready to be used
    await app.ready()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  afterAll(async () => {
    // remove fastify from memory after all tests
    await app.close()
  })

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({ title: 'new transaction', amount: 5000, type: 'credit' })
      .expect(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({ title: 'new transaction', amount: 5000, type: 'credit' })
      .expect(201)

    const cookies = createTransactionResponse.get('Set-Cookie')
    expect(cookies).toBeDefined()

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies!)
      .expect(200)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'new transaction',
        amount: 5000,
      }),
    ])
  })

  it('should be able to get an specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({ title: 'new transaction', amount: 5000, type: 'credit' })
      .expect(201)

    const cookies = createTransactionResponse.get('Set-Cookie')
    expect(cookies).toBeDefined()

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies!)
      .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies!)
      .expect(200)

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'new transaction',
        amount: 5000,
      }),
    )
  })

  it('should be able to get the summary', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({ title: 'Credit transaction', amount: 5000, type: 'credit' })
      .expect(201)

    const cookies = createTransactionResponse.get('Set-Cookie')
    expect(cookies).toBeDefined()

    await request(app.server)
      .post('/transactions')
      .send({ title: 'Debit transaction', amount: 2000, type: 'debit' })
      .set('Cookie', cookies!)
      .expect(201)

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies!)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({ amount: 3000 })
  })
})
