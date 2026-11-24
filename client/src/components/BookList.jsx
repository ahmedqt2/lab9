export default function BookList({ books, loading, error, busy, onRetry, onEdit, onToggle, onRate, onDelete }) {
  if (loading) return <div className="list-message" role="status">Loading your shelf...</div>;
  if (error) return <div className="list-message error" role="alert">{error} <button onClick={onRetry}>Try again</button></div>;
  if (books.length === 0) return <div className="list-message"><h3>No books here yet</h3><p>Add a book or try different search filters.</p></div>;
  return (
    <div className="book-list">
      {books.map((book) => (
        <article key={book.id} className={`book-card ${book.read ? 'is-read' : ''}`}>
          <div className="book-topline"><span className="genre-tag">{book.genre}</span><span className="book-year">{book.year}</span></div>
          <h3>{book.title}</h3>
          <p className="book-author">{book.author}</p>
          <div className="book-controls">
            <button className={`status-button ${book.read ? 'read' : ''}`} disabled={busy} onClick={() => onToggle(book)}
              aria-label={`${book.read ? 'Mark unread' : 'Mark read'}: ${book.title}`}>{book.read ? 'Read' : 'To read'}</button>
            <label className="rating-label">Rating
              <select aria-label={`Rating for ${book.title}`} disabled={busy || !book.read} value={book.rating ?? ''}
                onChange={(event) => onRate(book, event.target.value === '' ? null : Number(event.target.value))}>
                <option value="">Unrated</option>
                {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
              </select>
            </label>
          </div>
          <div className="book-actions">
            <button className="quiet" disabled={busy} onClick={() => onEdit(book)} aria-label={`Edit ${book.title}`}>Edit book</button>
            <button className="quiet danger" disabled={busy} onClick={() => onDelete(book)} aria-label={`Delete ${book.title}`}>Delete</button>
          </div>
        </article>
      ))}
    </div>
  );
}
