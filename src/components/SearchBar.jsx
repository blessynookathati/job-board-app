export default function SearchBar({ setSearch }) {
  return (
    <input
      data-testid="search-input"
      placeholder="Search..."
      onChange={(e) => setSearch(e.target.value)}
      className="border p-2 w-full"
    />
  );
}