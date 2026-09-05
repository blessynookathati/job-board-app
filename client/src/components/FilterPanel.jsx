import { Search, SlidersHorizontal, RotateCcw, ArrowUpDown } from "lucide-react";

export default function FilterPanel({
  search,
  setSearch,
  type,
  setType,
  salary,
  setSalary,
  sort,
  setSort,
  skills,
  toggleSkill,
  allSkills = [],
  onClear
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-8">
      {/* 🔍 SEARCH BAR */}
      <div className="relative mb-4">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          data-testid="search-input"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs by title, company, or keywords..."
          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
        />
      </div>

      {/* 🎛 FILTERS & CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Work Mode / Type Buttons */}
          <button
            data-testid="filter-job-type-remote"
            onClick={() => setType(type === "Remote" ? "" : "Remote")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
              type === "Remote"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            Remote
          </button>

          <button
            data-testid="filter-job-type-hybrid"
            onClick={() => setType(type === "Hybrid" ? "" : "Hybrid")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
              type === "Hybrid"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Hybrid
          </button>

          {/* 🔽 SORT BUTTON */}
          <button
            data-testid="sort-salary-desc"
            onClick={() => setSort(!sort)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition flex items-center gap-1.5 ${
              sort
                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>Sort Salary ↓</span>
          </button>

          {/* ❌ CLEAR BUTTON */}
          <button
            data-testid="clear-filters-btn"
            onClick={onClear}
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-red-600 hover:bg-red-50 transition flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        {/* 💰 SALARY SLIDER */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Max Salary: <strong className="text-slate-800 font-bold">${Number(salary).toLocaleString()}</strong>
          </span>
          <input
            type="range"
            data-testid="filter-salary-slider"
            min="30000"
            max="120000"
            step="5000"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            className="w-28 sm:w-36 accent-blue-600 cursor-pointer"
          />
        </div>
      </div>

      {/* 🧠 MULTI-SKILLS FILTER */}
      <div className="mt-4 pt-3.5 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Filter by Skills:
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allSkills.map((skill) => {
            const isSelected = skills.includes(skill);
            return (
              <button
                key={skill}
                data-testid="filter-skill"
                onClick={() => toggleSkill(skill)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs ring-1 ring-blue-500"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
