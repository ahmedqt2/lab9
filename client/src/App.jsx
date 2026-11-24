import { useEffect, useState } from 'react';
import * as api from './api/books.js';
import Filters from './components/Filters.jsx';
import Stats from './components/Stats.jsx';
import BookForm from './components/BookForm.jsx';
import BookList from './components/BookList.jsx';

export default function App() {
  const [filters, setFilters] = useState({ q: '', genre: '', read: '', sort: '', order: 'asc' });
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [statsError, setStatsError] = useState('');
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setListError('');
    api.listBooks(filters, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setBooks(data); })
      .catch((error) => { if (!controller.signal.aborted) setListError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filters, revision]);

  useEffect(() => {
    const controller = new AbortController();
    setStatsLoading(true);
    setStatsError('');
    api.getStats(controller.signal)
      .then((data) => { if (!controller.signal.aborted) setStats(data); })
      .catch((error) => { if (!controller.signal.aborted) setStatsError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setStatsLoading(false); });
    return () => controller.abort();
  }, [revision]);

  const refresh = () => setRevision((value) => value + 1);
  async function mutate(action, message) {
    setBusy(true);
    setActionError('');
    setNotice('');
    try {
      await action();
      setNotice(message);
      refresh();
      return true;
    } catch (error) {
      setActionError(error.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function save(body) {
    const ok = await mutate(() => editing ? api.replaceBook(editing.id, body) : api.addBook(body),
      editing ? 'Book updated.' : 'Book added to your shelf.');
    if (ok) { setEditing(null); setFormKey((value) => value + 1); }
  }

  async function deleteBook(book) {
    const ok = await mutate(() => api.removeBook(book.id), `Deleted ${book.title}.`);
    if (ok && editing?.id === book.id) { setEditing(null); setFormKey((value) => value + 1); }
  }

  return (
    <main className="app-shell">
      <h1>Reading List</h1>
      <Stats stats={stats} loading={statsLoading} error={statsError} onRetry={refresh} />
      <div className="content-grid">
        <section className="shelf" aria-labelledby="shelf-heading">
          <h2 id="shelf-heading">Books</h2>
          <Filters filters={filters} onChange={setFilters} />
          {actionError && <p className="error action-message" role="alert">{actionError}</p>}
          {notice && <p className="success action-message" role="status">{notice}</p>}
          <BookList books={books} loading={loading} error={listError} busy={busy} onRetry={refresh}
            onEdit={(book) => { setEditing(book); setFormKey((value) => value + 1); setActionError(''); setNotice(''); }}
            onToggle={(book) => mutate(() => api.patchBook(book.id, { read: !book.read, ...(book.read ? { rating: null } : {}) }), 'Reading status updated.')}
            onRate={(book, rating) => mutate(() => api.patchBook(book.id, { rating }), 'Rating updated.')}
            onDelete={deleteBook} />
        </section>
        <BookForm key={formKey} book={editing} busy={busy} onSave={save} onCancel={() => { setEditing(null); setFormKey((value) => value + 1); }} />
      </div>
    </main>
  );
}
