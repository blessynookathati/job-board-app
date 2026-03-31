import { useEffect, useState } from "react";

export default function JobCard({ job }) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("bookmarkedJobs")) || [];
    setBookmarked(saved.includes(job.id));
  }, [job.id]);

  const toggleBookmark = () => {
    let saved = JSON.parse(localStorage.getItem("bookmarkedJobs")) || [];

    if (saved.includes(job.id)) {
      saved = saved.filter((id) => id !== job.id);
      setBookmarked(false);
    } else {
      saved.push(job.id);
      setBookmarked(true);
    }

    localStorage.setItem("bookmarkedJobs", JSON.stringify(saved));
  };

  return (
    <div
      data-testid={`job-card-${job.id}`}
      className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition"
    >
      <div className="flex justify-between">
        <div>
          <h2 className="font-semibold text-lg">{job.title}</h2>
          <p className="text-gray-500 text-sm">{job.company}</p>
        </div>

        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
          {job.type}
        </span>
      </div>

      <p className="text-gray-400 text-sm">{job.location}</p>

      <p
        className="mt-2 text-green-600 font-bold"
        data-testid="job-salary"
      >
        ${job.salary}
      </p>

      <div className="flex gap-2 mt-3 flex-wrap">
        {job.skills.map((s, i) => (
          <span key={i} className="bg-gray-100 text-xs px-2 py-1 rounded-full">
            {s}
          </span>
        ))}
      </div>

      <button
        data-testid={`bookmark-btn-${job.id}`}
        data-bookmarked={bookmarked}
        onClick={toggleBookmark}
        className={`mt-4 w-full py-2 rounded-lg text-white ${
          bookmarked ? "bg-green-600" : "bg-blue-600"
        }`}
      >
        {bookmarked ? "Saved ✓" : "Save Job"}
      </button>
    </div>
  );
}