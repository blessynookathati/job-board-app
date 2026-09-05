import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { Building, MapPin, Users, Star, ArrowRight } from "lucide-react";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.getCompanies();
      if (res.success) setCompanies(res.companies);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Featured Employer Companies
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore industry-leading tech teams, workplace cultures, verified employee reviews, and active requisitions.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-6 rounded-3xl border border-slate-200 h-56 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((comp) => (
              <div
                key={comp._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden">
                      {comp.logo ? (
                        <img src={comp.logo} alt={comp.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building className="w-7 h-7 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{comp.name}</h3>
                      <span className="text-xs text-blue-600 font-medium block">{comp.industry}</span>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{comp.ratings?.overall || "4.8"}</span>
                        <span className="text-slate-400 font-normal">({comp.ratings?.count || 12} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-4 line-clamp-3 leading-relaxed">
                    {comp.about}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {comp.headquarters}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {comp.companySize}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    to={`/companies/${comp._id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <span>View Company & Jobs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
