import fastify from "fastify";

const app = fastify()

app.get('/hello', (req, res) => {
  res.send({ message: 'Hello, NodeJS!' });
});

app.listen({ port: 3333 }).then(() => console.log('HTTP Server Running'))
