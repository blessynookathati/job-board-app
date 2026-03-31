import { useEffect, useState } from "react";
import data from "../data/mock-data.json";
import JobCard from "../components/JobCard";

export default function Home() {
  const [jobs] = useState(data.jobs);
  const [filtered, setFiltered] = useState(data.jobs);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [salary, setSalary] = useState(100000);
  const [sort, setSort] = useState(false);
  const [skills, setSkills] = useState([]);

  const [page, setPage] = useState(1);
  const perPage = 6;

  // ALL UNIQUE SKILLS
  const allSkills = [...new Set(jobs.flatMap(j => j.skills))];

  useEffect(() => {
    let result = [...jobs];

    // 🔍 SEARCH
    if (search) {
      result = result.filter(
        j =>
          j.title.toLowerCase().includes(search.toLowerCase()) ||
          j.company.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 🧭 TYPE
    if (type) {
      result = result.filter(j => j.type === type);
    }

    // 💰 SALARY
    result = result.filter(j => j.salary <= salary);

    // 🧠 SKILLS (multi select)
    if (skills.length > 0) {
      result = result.filter(job =>
        skills.every(skill => job.skills.includes(skill))
      );
    }

    // 🔽 SORT
    if (sort) {
      result.sort((a, b) => b.salary - a.salary);
    }

    setFiltered(result);
    setPage(1);
  }, [search, type, salary, sort, skills, jobs]);

  const paginated = filtered.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const toggleSkill = (skill) => {
    setSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">

      {/* 🔍 SEARCH */}
      <input
        data-testid="search-input"
        placeholder="Search jobs..."
        className="w-full border p-3 rounded-lg mb-4"
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 🎛 FILTERS */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">

        <button
          data-testid="filter-job-type-remote"
          onClick={() => setType("Remote")}
          className="px-3 py-1 bg-blue-100 rounded-full"
        >
          Remote
        </button>

        <button
          data-testid="filter-job-type-hybrid"
          onClick={() => setType("Hybrid")}
          className="px-3 py-1 bg-green-100 rounded-full"
        >
          Hybrid
        </button>

        {/* 🧠 SKILLS */}
        <div className="flex gap-2 flex-wrap">
          {allSkills.map(skill => (
            <button
              key={skill}
              data-testid="filter-skill"
              onClick={() => toggleSkill(skill)}
              className={`px-2 py-1 rounded-full text-sm ${
                skills.includes(skill)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>

        {/* 💰 SALARY */}
        <input
          type="range"
          data-testid="filter-salary-slider"
          min="30000"
          max="100000"
          className="cursor-pointer"
          onChange={(e) => setSalary(Number(e.target.value))}
        />

        {/* 🔽 SORT */}
        <button
          data-testid="sort-salary-desc"
          onClick={() => setSort(true)}
          className="text-blue-600"
        >
          Sort Salary ↓
        </button>

        {/* ❌ CLEAR */}
        <button
          data-testid="clear-filters-btn"
          onClick={() => {
            setSearch("");
            setType("");
            setSalary(100000);
            setSort(false);
            setSkills([]);
          }}
          className="text-red-500"
        >
          Clear
        </button>
      </div>

      {/* 🧾 JOB LIST */}
      <div
        data-testid="job-list-container"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {paginated.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {/* 📄 PAGINATION */}
      <div
        data-testid="pagination-controls"
        className="mt-6"
      >
        <button
          data-testid="pagination-next"
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}