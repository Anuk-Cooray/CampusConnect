import { useEffect, useState, useCallback } from "react";
import AccommodationCard from "./AccommodationCard";
import FilterBar from "./FilterBar";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Interface එකක් add කළා aiFilters receive කරන්න
interface AccommodationListProps {
  aiFilters?: any;
}

export default function AccommodationList({ aiFilters }: AccommodationListProps) {
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAccommodations = useCallback(async (filters: any = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      
      // AI එකෙන් එවන filter fields මෙතනදී add වෙනවා
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.maxDistance) params.append("maxDistance", filters.maxDistance);
      if (filters.gender) params.append("gender", filters.gender);
      
      // AI එකෙන් string එකක් ආවොත් ඒක array එකක් කරලා යවනවා
      if (filters.facilities) {
        const facs = Array.isArray(filters.facilities) 
          ? filters.facilities 
          : filters.facilities.split(",");
        params.append("facilities", facs.join(","));
      }

      const { data } = await axios.get(`${API}/api/accommodations?${params}`);
      setAccommodations(Array.isArray(data) ? data : data.data ?? data.accommodations ?? []);
    } catch {
      setError("Failed to load accommodations. Please try again.");
      setAccommodations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 1. සාමාන්‍ය විදිහට මුලින්ම load වෙනකොට
  useEffect(() => { 
    if (!aiFilters) {
      fetchAccommodations(); 
    }
  }, [fetchAccommodations]);

  // 2. AI Bot එකෙන් අලුත් filters ලැබෙන හැම වෙලාවකම automatic fetch වෙනවා
  useEffect(() => {
    if (aiFilters) {
      fetchAccommodations(aiFilters);
    }
  }, [aiFilters, fetchAccommodations]);

  return (
    <div className="h-[85vh] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-6 h-full overflow-y-auto">

        {/* Filter Bar එකට aiFilters එකත් pass කරන්න පුළුවන් UI එක update වෙන්න අවශ්‍ය නම් */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-6">
          <FilterBar onFilter={fetchAccommodations} loading={loading} />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                <div className="h-52 bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-6 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : accommodations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🏠</p>
            <p className="text-slate-500 text-lg font-medium">No accommodations found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or ask the AI Bot!</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
               <p className="text-sm text-slate-500">
                {accommodations.length} accommodation{accommodations.length !== 1 ? "s" : ""} found
              </p>
              {aiFilters && (
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                  AI Filter Applied ✨
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {accommodations.map((a: any) => (
                <AccommodationCard key={a._id} accommodation={a} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}