export default function Pagination({ page, setPage }) {
  return (
    <button
      data-testid="pagination-next"
      onClick={() => setPage(page + 1)}
    >
      Next
    </button>
  );
}