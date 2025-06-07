import fastify from 'fastify'
import { knex } from './database'

const app = fastify()

app.get('/hello', async (req, res) => {
  const data = await knex('sqlite_schema').select('*')
  console.log(data)

  res.send({ message: 'Hello, NodeJS!' })
})

app.listen({ port: 3333 }).then(() => console.log('HTTP Server Running'))
