import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { Building, Save, Globe, MapPin, Users, Calendar } from "lucide-react";

export default function RecruiterCompany() {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);

  const [company, setCompany] = useState({
    name: "TechCorp Global",
    tagline: "Empowering next-gen cloud & enterprise platforms",
    industry: "Information Technology",
    companySize: "1000-5000",
    headquarters: "San Francisco, CA",
    website: "https://techcorp-example.com",
    founded: 2012,
    about: "TechCorp Global is a leading technology solutions provider designing robust cloud, AI, and developer platform infrastructure across 14 international hubs.",
    benefits: "Comprehensive Health Insurance\nRemote Work Flexibility\n$3,000 Annual Learning Stipend\n401(k) 6% Match\nUnlimited PTO"
  });

  useEffect(() => {
    loadCompany();
  }, [user]);

  const loadCompany = async () => {
    try {
      const res = await api.getCompanies();
      if (res.success && res.companies?.length > 0) {
        const found = res.companies.find((c) => c._id === user?.companyId) || res.companies[0];
        setCompany({
          ...found,
          benefits: Array.isArray(found.benefits) ? found.benefits.join("\n") : found.benefits || ""
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...company,
        benefits: company.benefits.split("\n").filter(Boolean)
      };

      if (company._id) {
        await api.updateCompany(company._id, payload);
      }
      showToast("Company profile updated successfully.", "Saved");
    } catch (err) {
      showToast(err.message || "Failed to save company profile.", "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Company Profile & Employer Branding
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showcase your organization culture, employee benefits, and active openings to attract top talent.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2 self-start"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Saving..." : "Save Profile"}</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4 text-xs">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry</label>
              <input
                type="text"
                value={company.industry}
                onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={company.tagline || ""}
                onChange={(e) => setCompany({ ...company, tagline: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
              <input
                type="text"
                value={company.website}
                onChange={(e) => setCompany({ ...company, website: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Headquarters</label>
              <input
                type="text"
                value={company.headquarters}
                onChange={(e) => setCompany({ ...company, headquarters: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Size (Employees)</label>
              <input
                type="text"
                value={company.companySize}
                onChange={(e) => setCompany({ ...company, companySize: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">About Company</label>
            <textarea
              rows={4}
              value={company.about}
              onChange={(e) => setCompany({ ...company, about: e.target.value })}
              className="w-full p-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Benefits & Perks (one per line)</label>
            <textarea
              rows={4}
              value={company.benefits}
              onChange={(e) => setCompany({ ...company, benefits: e.target.value })}
              className="w-full p-2.5 border rounded-xl font-mono text-[11px]"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
