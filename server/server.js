import express from 'express';
import cors from 'cors';
import * as store from './booksStore.js';
import { validateId, validateQuery, selectBooks } from './validate.js';

export const app = express();
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/books', async (req, res) => {
  const query = validateQuery(req.originalUrl);
  if (query.error) return res.status(400).json({ error: query.error });
  const books = await store.getBooks();
  return res.json(selectBooks(books, query.value));
});

app.get('/api/books/:id', async (req, res) => {
  const id = validateId(req.params.id);
  if (id.error) return res.status(400).json({ error: id.error });
  const book = await store.getBook(id.value);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  return res.json(book);
});

app.get('/api/stats', async (req, res) => {
  return res.json(await store.getStats());
});

app.post('/api/books', async (req, res) => {
  const result = await store.createBook(req.body);
  if (result.error) return res.status(result.status).json({ error: result.error });
  return res.status(201).location(`/api/books/${result.value.id}`).json(result.value);
});

app.put('/api/books/:id', async (req, res) => {
  const id = validateId(req.params.id);
  if (id.error) return res.status(400).json({ error: id.error });
  const result = await store.updateBook(id.value, req.body);
  if (result.error) return res.status(result.status).json({ error: result.error });
  return res.json(result.value);
});

app.patch('/api/books/:id', async (req, res) => {
  const id = validateId(req.params.id);
  if (id.error) return res.status(400).json({ error: id.error });
  const result = await store.updateBook(id.value, req.body, true);
  if (result.error) return res.status(result.status).json({ error: result.error });
  return res.json(result.value);
});

app.delete('/api/books/:id', async (req, res) => {
  const id = validateId(req.params.id);
  if (id.error) return res.status(400).json({ error: id.error });
  const removed = await store.deleteBook(id.value);
  if (!removed) return res.status(404).json({ error: 'Book not found' });
  return res.status(204).end();
});

// Required async-error demonstration, documented in the README.
app.get('/api/crash', async () => {
  throw new Error('Deliberate async failure for Assignment 9');
});

app.use('/api', async (req, res) => {
  return res.status(404).json({ error: 'Not found' });
});
app.use(async (req, res) => {
  return res.status(404).json({ error: 'Not found' });
});

// Four arguments let Express distinguish this from normal middleware.
app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON body' });
  }
  return res.status(500).json({ error: 'Something went wrong' });
});

const port = process.env.PORT || 3000;
export const server = app.listen(port, () => {
  console.log(`Reading List API listening on http://localhost:${server.address().port}`);
});
