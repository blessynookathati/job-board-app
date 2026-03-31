export default function FilterPanel({ setType }) {
  return (
    <div className="flex gap-2">
      <button data-testid="filter-job-type-remote" onClick={() => setType("Remote")}>
        Remote
      </button>
      <button data-testid="filter-job-type-hybrid" onClick={() => setType("Hybrid")}>
        Hybrid
      </button>
    </div>
  );
}