import { Hono } from 'hono';

const app = new Hono();

app.get('/', c => {
  return c.text('Hello im deep from saturn!');
});

export default app;
