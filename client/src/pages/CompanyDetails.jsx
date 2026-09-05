import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import JobCard from "../components/JobCard";
import ApplicationModal from "../components/ApplicationModal";
import {
  Building,
  Globe,
  MapPin,
  Users,
  Star,
  CheckCircle2,
  Briefcase,
  MessageSquare,
  ArrowLeft
} from "lucide-react";

export default function CompanyDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [company, setCompany] = useState(null);
  const [openJobs, setOpenJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Form Modal
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  useEffect(() => {
    loadCompanyDetails();
  }, [id]);

  const loadCompanyDetails = async () => {
    setLoading(true);
    try {
      const res = await api.getCompanyById(id);
      if (res.success) {
        setCompany(res.company);
        setOpenJobs(res.openJobs || []);
        setReviews(res.reviews || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    try {
      const res = await api.submitCompanyReview(id, {
        rating,
        reviewText
      });
      if (res.success) {
        showToast("Review submitted successfully!", "Success");
        setReviews([res.review, ...reviews]);
        setShowReviewForm(false);
        setReviewText("");
      }
    } catch (err) {
      showToast("Failed to submit review", "Error");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 animate-pulse space-y-4">
        <div className="h-40 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Company Not Found</h2>
        <Link to="/companies" className="text-xs text-blue-600 hover:underline mt-2 block">
          Back to Companies
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link
          to="/companies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Companies</span>
        </Link>

        {/* Company Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  <Building className="w-8 h-8 text-slate-400" />
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {company.name}
                </h1>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{company.tagline || company.industry}</p>

                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {company.headquarters}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {company.companySize} employees
                  </span>
                  <span>•</span>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Visit Website
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-right self-start sm:self-auto">
              <div className="flex items-center gap-1 text-amber-600 font-extrabold text-2xl">
                <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
                <span>{company.ratings?.overall || 4.8}</span>
              </div>
              <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
                Overall Employee Rating
              </span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm mb-2">About the Company</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{company.about}</p>
          </div>
        </div>

        {/* Two Columns: Open Positions & Reviews */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Open Positions */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <span>Open Positions ({openJobs.length})</span>
            </h2>

            {openJobs.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                No active openings currently posted by {company.name}.
              </div>
            ) : (
              <div className="space-y-3">
                {openJobs.map((job) => (
                  <JobCard
                    key={job.id || job._id}
                    job={job}
                    onApplyClick={(j) => setSelectedJobForApply(j)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Reviews & Culture */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <span>Reviews</span>
              </h2>
              {user && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Write Review
                </button>
              )}
            </div>

            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <h4 className="font-bold text-slate-800">Share Your Experience</h4>
                <div>
                  <label className="block text-slate-600 mb-1">Rating (1-5)</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full p-2 border rounded-xl"
                  >
                    <option value={5}>5 Stars - Outstanding</option>
                    <option value={4}>4 Stars - Great</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Needs Improvement</option>
                    <option value={1}>1 Star - Poor</option>
                  </select>
                </div>
                <div>
                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Describe workplace culture, growth, and team collaboration..."
                    className="w-full p-2 border rounded-xl text-xs"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                >
                  Submit Review
                </button>
              </form>
            )}

            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev._id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{rev.rating}.0</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{rev.reviewText}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedJobForApply && (
        <ApplicationModal
          job={selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
          onSuccess={() => loadCompanyDetails()}
        />
      )}
    </div>
  );
}
