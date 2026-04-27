import { useEffect, useState, useCallback } from "react";
import AccommodationCard from "./AccommodationCard";
import FilterBar from "./FilterBar";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface AccommodationListProps {
  aiFilters?: any;
  dark?: boolean;
}

export default function AccommodationList({ aiFilters, dark }: AccommodationListProps) {
  const [allAccommodations, setAllAccommodations] = useState<any[]>([]);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeFilters, setActiveFilters] = useState<any>({});

  // Fetch ALL accommodations once
  const fetchAllAccommodations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${API}/api/accommodations`);
      const list = Array.isArray(data) ? data : data.data ?? data.accommodations ?? [];
      setAllAccommodations(list);
      setAccommodations(list); // show all by default
    } catch {
      setError("Failed to load accommodations. Please try again.");
      setAllAccommodations([]);
      setAccommodations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Frontend filter engine
  const applyFilters = useCallback((filters: any, list: any[]) => {
    return list.filter((place) => {
      const rent = Number(place.rent ?? place.price ?? 0);
      const distance = Number(place.distanceFromUni ?? place.distance ?? 0);

      if (filters.minPrice && rent < Number(filters.minPrice)) return false;
      if (filters.maxPrice && rent > Number(filters.maxPrice)) return false;
      if (filters.maxDistance && distance > Number(filters.maxDistance)) return false;

      if (filters.gender && filters.gender !== "") {
        const placeGender = (place.targetGender ?? place.gender ?? "Any").toLowerCase();
        const filterGender = filters.gender.toLowerCase();

        // Normalize: male=boys, female=girls
        const normalize = (g: string) => {
          if (g === "male" || g === "boys") return "male";
          if (g === "female" || g === "girls") return "female";
          return "any";
        };

        const normalizedPlace = normalize(placeGender);
        const normalizedFilter = normalize(filterGender);

        if (normalizedPlace !== "any" && normalizedPlace !== normalizedFilter) return false;
      }

      if (filters.facilities && filters.facilities.length > 0) {
        const facList = Array.isArray(filters.facilities)
          ? filters.facilities
          : filters.facilities.split(",");

        const placeFacilities: string[] = (
          place.facilities ?? place.amenities ?? []
        ).map((f: string) => f.toLowerCase());

        const allMatch = facList.every((f: string) =>
          placeFacilities.includes(f.toLowerCase())
        );
        if (!allMatch) return false;
      }

      return true;
    });
  }, []);

  // Initial load
  useEffect(() => {
    fetchAllAccommodations();
  }, [fetchAllAccommodations]);

  // When allAccommodations loads, apply any existing active filters
  useEffect(() => {
    if (allAccommodations.length > 0) {
      const filtered = applyFilters(activeFilters, allAccommodations);
      setAccommodations(filtered);
    }
  }, [allAccommodations]);

  // When AI filters come in
  useEffect(() => {
    if (aiFilters) {
      setActiveFilters(aiFilters);
      const filtered = applyFilters(aiFilters, allAccommodations);
      setAccommodations(filtered);
    }
  }, [aiFilters, allAccommodations, applyFilters]);

  // When manual FilterBar is used
  const handleFilter = (filters: any) => {
    setActiveFilters(filters);
    const filtered = applyFilters(filters, allAccommodations);
    setAccommodations(filtered);
  };

  const skeletonBg = dark ? "rgba(255,255,255,0.06)" : undefined;
  const skeletonShimmer = dark ? "rgba(255,255,255,0.1)" : undefined;

  return (
    <div>
      <FilterBar onFilter={handleFilter} loading={loading} dark={dark} />

      {error && (
        <div
          className="text-sm px-4 py-3 rounded-xl mb-4"
          style={dark
            ? { background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }
            : undefined}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden animate-pulse"
              style={dark
                ? { background: skeletonBg, border: "1px solid rgba(255,255,255,0.06)" }
                : { background: "white", border: "1px solid #f1f5f9" }}
            >
              <div className="h-52" style={{ background: dark ? skeletonShimmer : "#e2e8f0" }} />
              <div className="p-4 space-y-3">
                <div className="h-4 rounded w-3/4" style={{ background: dark ? skeletonShimmer : "#e2e8f0" }} />
                <div className="h-3 rounded w-1/2" style={{ background: dark ? skeletonShimmer : "#e2e8f0" }} />
                <div className="h-6 rounded w-1/3" style={{ background: dark ? skeletonShimmer : "#e2e8f0" }} />
              </div>
            </div>
          ))}
        </div>
      ) : accommodations.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🏠</p>
          <p className="text-lg font-medium" style={{ color: dark ? "rgba(255,255,255,0.4)" : "#64748b" }}>
            No accommodations found
          </p>
          <p className="text-sm mt-1" style={{ color: dark ? "rgba(255,255,255,0.25)" : "#94a3b8" }}>
            Try adjusting your filters or ask the AI Bot!
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm" style={{ color: dark ? "rgba(255,255,255,0.4)" : "#64748b" }}>
              {accommodations.length} accommodation{accommodations.length !== 1 ? "s" : ""} found
            </p>
            {aiFilters && (
              <span
                className="text-xs font-bold px-2 py-1 rounded-full animate-bounce"
                style={dark
                  ? { background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }
                  : { background: "#dbeafe", color: "#1d4ed8" }}
              >
                AI Filter Applied ✨
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {accommodations.map((a: any) => (
              <AccommodationCard key={a._id} accommodation={a} dark={dark} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}