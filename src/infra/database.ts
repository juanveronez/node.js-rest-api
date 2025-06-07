import { Knex, knex as setupKnex } from 'knex'
import 'dotenv/config'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL env not found.')
}

console.log(process.env.DATABASE_URL)

export const config: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: process.env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './src/infra/migrations',
  },
}

export const knex = setupKnex(config)
