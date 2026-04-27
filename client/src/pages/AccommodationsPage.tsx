import { useState } from "react";
import { Link } from "react-router-dom";
import AccommodationList from "../components/accommodation/AccommodationList";
import AIChatBot from "../components/accommodation/AIChatBot";

export default function AccommodationsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [aiFilters, setAiFilters] = useState<any>(null);

  const handleAIFilter = (filters: any) => {
    setAiFilters(filters);
  };

  return (
    <div
      className="min-h-screen font-sans text-white"
      style={{
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1025 40%, #0f1a2e 100%)",
      }}
    >
      {/* Subtle noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />

      {/* Glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: "600px", height: "600px",
            top: "-200px", left: "50%", transform: "translateX(-50%)",
            background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-10"
          style={{
            width: "400px", height: "400px",
            bottom: "20%", right: "-100px",
            background: "radial-gradient(circle, #ec4899 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Navbar */}
      <nav
        className="sticky top-0 z-40 px-6 py-4 flex justify-between items-center"
        style={{
          background: "rgba(15, 15, 26, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center space-x-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}
          >
            <span className="text-white font-extrabold text-lg leading-none">C</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">
            <span style={{ color: "#f59e0b" }}>Campus</span>
            <span className="text-white">Connect</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {aiFilters && (
            <button
              onClick={() => setAiFilters(null)}
              className="text-xs font-bold px-3 py-2 rounded-lg transition-colors"
              style={{ color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              Reset AI Filters ✕
            </button>
          )}
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            ‹ Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-bold tracking-widest uppercase"
          style={{
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.3)",
            color: "#f59e0b",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Student Housing
        </div>

        {/* Headline */}
        <h2 className="text-6xl md:text-7xl font-extrabold leading-none tracking-tight mb-6">
          <span className="text-white">Find your </span>
          <span
            style={{
              background: "linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            perfect
          </span>
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            accommodation
          </span>
        </h2>

        <p className="text-lg font-medium mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
          Verified rooms, hostels &amp; apartments near campus — powered by smart AI to match exactly what you need.
        </p>

        {/* AI Active badge */}
        <div
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-14"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          AI assistant active
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { value: "240+", label: "Verified Listings" },
            { value: "4.8★", label: "Avg Rating" },
            { value: "2 km", label: "Avg from Campus" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl py-6 px-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="text-3xl font-extrabold mb-1" style={{ color: "#f59e0b" }}>
                {stat.value}
              </p>
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {user?.role === "admin" && (
          <div className="mt-8">
            <Link
              to="/accommodations/new"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}
            >
              + Post Listing
            </Link>
          </div>
        )}
      </div>

      {/* Listings Section */}
      <div
        className="relative"
        style={{
          background: "rgba(255,255,255,0.02)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AccommodationList aiFilters={aiFilters} dark />
        </div>
      </div>

      <AIChatBot onFiltersApplied={handleAIFilter} />
    </div>
  );
}