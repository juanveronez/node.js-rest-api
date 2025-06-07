import fastify from 'fastify'
import { knex } from './infra/database'

const app = fastify()

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

app.listen({ port: 3333 }).then(() => console.log('HTTP Server Running'))
