import { useState } from 'react';
import { GENRES } from './Filters.jsx';

export default function BookForm({ book, busy, onSave, onCancel }) {
  const [form, setForm] = useState({ title: book?.title || '', author: book?.author || '',
    year: book?.year ?? new Date().getFullYear(), genre: book?.genre || 'fiction',
    read: book?.read ?? false, rating: book?.rating ?? '' });

  function change(event) {
    const { name, value, checked, type } = event.target;
    setForm((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value,
      ...(name === 'read' && !checked ? { rating: '' } : {}) }));
  }
  async function submit(event) {
    event.preventDefault();
    await onSave({ ...form, year: Number(form.year), rating: form.rating === '' ? null : Number(form.rating) });
  }

  return (
    <section className="form-panel" aria-labelledby="form-heading">
      <h2 id="form-heading">{book ? 'Edit book' : 'Add book'}</h2>
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" required maxLength={100} value={form.title} onChange={change} />
          <label htmlFor="author">Author</label>
          <input id="author" name="author" required maxLength={100} value={form.author} onChange={change} />
          <div className="form-pair">
            <div><label htmlFor="year">Year</label><input id="year" name="year" type="number" required min="1000" max={new Date().getFullYear()} step="1" value={form.year} onChange={change} /></div>
            <div><label htmlFor="genre">Genre</label><select id="genre" name="genre" value={form.genre} onChange={change}>
              {GENRES.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
            </select></div>
          </div>
          <label className="checkbox-label"><input type="checkbox" name="read" checked={form.read} onChange={change} /> I have read this book</label>
          <label htmlFor="form-rating">Rating</label>
          <select id="form-rating" name="rating" disabled={!form.read} value={form.rating} onChange={change}>
            <option value="">Not rated</option>
            {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
          </select>
          <div className="form-actions">
            <button className="primary" type="submit">{busy ? 'Saving...' : book ? 'Save changes' : 'Add book'}</button>
            {book && <button type="button" className="quiet" onClick={onCancel}>Cancel edit</button>}
          </div>
        </fieldset>
      </form>
    </section>
  );
}
