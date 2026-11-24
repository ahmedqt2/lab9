import { validateBook } from './validate.js';

let books = [
  { id: 1, title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', year: 1969, genre: 'fiction', read: true, rating: 5 },
  { id: 2, title: 'The Hobbit', author: 'J. R. R. Tolkien', year: 1937, genre: 'fantasy', read: false, rating: null },
  { id: 3, title: 'A Brief History of Time', author: 'Stephen Hawking', year: 1988, genre: 'science', read: true, rating: 4 },
  { id: 4, title: 'Sapiens', author: 'Yuval Noah Harari', year: 2011, genre: 'history', read: true, rating: 4 },
  { id: 5, title: 'Braiding Sweetgrass', author: 'Robin Wall Kimmerer', year: 2013, genre: 'non-fiction', read: false, rating: null },
  { id: 6, title: 'The Dispossessed', author: 'Ursula K. Le Guin', year: 1974, genre: 'fiction', read: true, rating: 5 },
];
let nextId = 7;
const pause = () => new Promise((resolve) => setTimeout(resolve, 20));
const duplicate = (book, exceptId) => books.some((other) => other.id !== exceptId
  && other.title.toLowerCase() === book.title.toLowerCase()
  && other.author.toLowerCase() === book.author.toLowerCase());

export async function getBooks() {
  await pause();
  return books.map((book) => ({ ...book }));
}

export async function getBook(id) {
  await pause();
  const book = books.find((item) => item.id === id);
  return book ? { ...book } : null;
}

export async function createBook(body) {
  await pause();
  const result = validateBook(body);
  if (result.error) return { status: 400, error: result.error };
  if (duplicate(result.value)) return { status: 409, error: 'A book with this title and author already exists' };
  // No await between the duplicate check and update, even for concurrent requests.
  const book = { id: nextId, ...result.value };
  books = [...books, book];
  nextId += 1;
  return { value: { ...book } };
}

export async function updateBook(id, body, partial = false) {
  await pause();
  const existing = books.find((book) => book.id === id);
  if (!existing) return { status: 404, error: 'Book not found' };
  const result = validateBook(body, partial ? existing : undefined);
  if (result.error) return { status: 400, error: result.error };
  if (duplicate(result.value, id)) return { status: 409, error: 'A book with this title and author already exists' };
  const replacement = { id, ...result.value };
  books = books.map((book) => book.id === id ? replacement : book);
  return { value: { ...replacement } };
}

export async function deleteBook(id) {
  await pause();
  if (!books.some((book) => book.id === id)) return false;
  books = books.filter((book) => book.id !== id);
  return true;
}

export async function getStats() {
  const current = await getBooks();
  const rated = current.filter((book) => book.rating !== null);
  const read = current.filter((book) => book.read).length;
  const byGenre = current.reduce((counts, book) => ({ ...counts,
    [book.genre]: (counts[book.genre] || 0) + 1 }), {});
  return { total: current.length, read, unread: current.length - read,
    averageRating: rated.length ? Number((rated.reduce((sum, book) => sum + book.rating, 0) / rated.length).toFixed(2)) : null,
    byGenre };
}
