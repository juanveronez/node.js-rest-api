import { FastifyInstance } from 'fastify'
import { knex } from '../infra/database'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/hello', async () => {
    const transaction = await knex('transactions')
      .insert({ title: 'Teste', amount: 1000 })
      .returning('*')

    return transaction
  })

  app.get('/world', async () => {
    const transactions = await knex('transactions').select('*')
    return transactions
  })
}
