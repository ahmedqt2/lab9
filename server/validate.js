export const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];
const FIELDS = ['title', 'author', 'year', 'genre', 'read', 'rating'];

// Only recognized fields are copied. In particular, the client never assigns an id.
export function validateBook(body, existing) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Body must be a JSON object' };
  }
  const changes = Object.fromEntries(FIELDS.filter((key) => Object.hasOwn(body, key))
    .map((key) => [key, body[key]]));
  const book = existing
    ? { ...existing, ...changes }
    : { read: false, rating: null, ...changes };

  for (const field of ['title', 'author']) {
    if (typeof book[field] !== 'string' || book[field].trim().length < 1
      || book[field].trim().length > 100) {
      return { error: `${field} must be a string of 1 to 100 characters after trimming` };
    }
  }
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(book.year) || book.year < 1000 || book.year > currentYear) {
    return { error: `year must be an integer between 1000 and ${currentYear}` };
  }
  if (!GENRES.includes(book.genre)) {
    return { error: `genre must be one of: ${GENRES.join(', ')}` };
  }
  if (typeof book.read !== 'boolean') return { error: 'read must be a boolean' };
  if (book.rating !== null && (!Number.isInteger(book.rating) || book.rating < 1 || book.rating > 5)) {
    return { error: 'rating must be an integer from 1 to 5 or null' };
  }
  if (!book.read && book.rating !== null) {
    return { error: 'A rating is allowed only when read is true; clear rating when marking unread' };
  }
  return { value: { title: book.title.trim(), author: book.author.trim(), year: book.year,
    genre: book.genre, read: book.read, rating: book.rating } };
}

export function validateId(raw) {
  const value = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value) || value < 1) {
    return { error: 'id must be a positive integer' };
  }
  return { value };
}

export function validateQuery(originalUrl) {
  const params = new URLSearchParams(originalUrl.split('?')[1] || '');
  const allowed = ['genre', 'read', 'q', 'sort', 'order', 'limit', 'page'];
  for (const key of params.keys()) {
    if (!allowed.includes(key)) return { error: `Unknown query parameter: ${key}` };
    if (params.getAll(key).length !== 1) return { error: `Query parameter ${key} must not be repeated` };
  }
  const query = Object.fromEntries(params);
  if (query.genre !== undefined && !GENRES.includes(query.genre)) return { error: 'Invalid genre query parameter' };
  if (query.read !== undefined && !['true', 'false'].includes(query.read)) return { error: 'read query parameter must be true or false' };
  if (query.sort !== undefined && !['title', 'author', 'year', 'rating'].includes(query.sort)) return { error: 'sort must be title, author, year or rating' };
  if (query.order !== undefined && !['asc', 'desc'].includes(query.order)) return { error: 'order must be asc or desc' };
  for (const key of ['limit', 'page']) {
    if (query[key] !== undefined && (!/^\d+$/.test(query[key])
      || !Number.isSafeInteger(Number(query[key])) || Number(query[key]) < 1)) {
      return { error: `${key} must be a positive integer` };
    }
  }
  if (Number(query.limit) > 50) return { error: 'limit must be between 1 and 50' };
  return { value: { ...query, sort: query.sort || 'id', order: query.order || 'asc',
    limit: Number(query.limit ?? 50), page: Number(query.page ?? 1) } };
}

export function selectBooks(books, query) {
  const search = (query.q || '').toLowerCase();
  const filtered = books.filter((book) => (!query.genre || book.genre === query.genre)
    && (query.read === undefined || book.read === (query.read === 'true'))
    && (book.title.toLowerCase().includes(search) || book.author.toLowerCase().includes(search)));
  const direction = query.order === 'desc' ? -1 : 1;
  const sorted = [...filtered].sort((a, b) => {
    // Nulls stay last in BOTH directions; do this before applying direction.
    if (query.sort === 'rating') {
      if (a.rating === null && b.rating !== null) return 1;
      if (b.rating === null && a.rating !== null) return -1;
    }
    const first = a[query.sort];
    const second = b[query.sort];
    const comparison = typeof first === 'string'
      ? first.localeCompare(second, 'en', { sensitivity: 'base' }) : first - second;
    return comparison * direction || a.id - b.id;
  });
  const start = (query.page - 1) * query.limit;
  return sorted.slice(start, start + query.limit);
}
