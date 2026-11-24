export const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];

export default function Filters({ filters, onChange }) {
  function change(event) {
    onChange({ ...filters, [event.target.name]: event.target.value });
  }
  return (
    <section className="filters" aria-label="Find books">
      <label className="search-field">Search
        <input type="search" name="q" placeholder="Title or author..." value={filters.q} onChange={change} />
      </label>
      <label>Genre
        <select name="genre" value={filters.genre} onChange={change}>
          <option value="">All genres</option>
          {GENRES.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
        </select>
      </label>
      <label>Reading status
        <select name="read" value={filters.read} onChange={change}>
          <option value="">All books</option><option value="false">To read</option><option value="true">Read</option>
        </select>
      </label>
      <label>Sort by
        <select name="sort" value={filters.sort} onChange={change}>
          <option value="">Added order</option><option value="title">Title</option><option value="author">Author</option>
          <option value="year">Year</option><option value="rating">Rating</option>
        </select>
      </label>
      <label>Direction
        <select name="order" value={filters.order} onChange={change}>
          <option value="asc">Ascending</option><option value="desc">Descending</option>
        </select>
      </label>
    </section>
  );
}
