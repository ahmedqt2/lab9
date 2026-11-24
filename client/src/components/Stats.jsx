export default function Stats({ stats, loading, error, onRetry }) {
  return (
    <section className="stats-section" aria-label="Reading statistics" aria-busy={loading}>
      {error && <p className="error" role="alert">Statistics: {error} <button onClick={onRetry}>Retry</button></p>}
      {!stats && loading && <p role="status">Loading statistics...</p>}
      {stats && <>
        <div className="stats-grid">
          <div><span>Total books</span><strong>{stats.total}</strong></div>
          <div><span>Books read</span><strong>{stats.read}</strong></div>
          <div><span>Unread books</span><strong>{stats.unread}</strong></div>
          <div><span>Average rating</span><strong>{stats.averageRating === null ? 'Unrated' : `${stats.averageRating} / 5`}</strong></div>
        </div>
        <p className="genre-summary">{Object.entries(stats.byGenre).map(([genre, count]) => `${genre}: ${count}`).join(' · ') || 'No books.'}</p>
      </>}
    </section>
  );
}
