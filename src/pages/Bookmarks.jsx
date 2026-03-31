import data from "../data/mock-data.json";
import JobCard from "../components/JobCard";

export default function Tracker() {
  const saved =
    JSON.parse(localStorage.getItem("bookmarkedJobs")) || [];

  const jobs = data.jobs.filter((j) => saved.includes(j.id));

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Saved Jobs</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}