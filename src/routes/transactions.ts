import { FastifyInstance } from 'fastify'

import { knex } from '../infra/database'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { checkSessionIdExists } from '../middlewares/checkSessionIdExists'

export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', async ({ body, cookies }, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(body)

    let sessionId = cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get('/', { preHandler: [checkSessionIdExists] }, async ({ cookies }) => {
    const { sessionId } = cookies

    const transactions = await knex('transactions')
      .where('session_id', sessionId)
      .select()
    return { transactions }
  })

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async ({ cookies }) => {
      const { sessionId } = cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    },
  )

  app.get(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async ({ params, cookies }, reply) => {
      const { sessionId } = cookies

      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(params)

      const transaction = await knex('transactions')
        .where({
          id,
          session_id: sessionId,
        })
        .first()

      if (!transaction) {
        return reply.status(404).send({
          error: 'Not Found.',
        })
      }

      return { transaction }
    },
  )
}
