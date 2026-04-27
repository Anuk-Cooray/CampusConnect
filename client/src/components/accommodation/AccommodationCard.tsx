import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Accommodation {
  _id: string;
  title: string;
  description: string;
  price: number;
  distance: number;
  distanceUnit: string;
  address: string;
  photos: string[];
  facilities: string[];
  owner: { name: string; phone: string; email: string };
  gender: string;
  availableRooms: number;
  isAvailable: boolean;
}

interface Props {
  accommodation: Accommodation;
  dark?: boolean;
}

const facilityIcons: Record<string, string> = {
  WiFi: "📶", Parking: "🅿️", Kitchen: "🍳",
  "Air Conditioning": "❄️", "Hot Water": "🚿", Security: "🔒",
  "Study Room": "📚", CCTV: "📹",
  Furnished: "🛋️", "Water Included": "💧", "Electricity Included": "⚡",
};

const toUrl = (base: string, path: string) =>
  `${base}/${path.replace(/\\/g, '/').replace(/^\//, '')}`;

export default function AccommodationCard({ accommodation, dark }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const navigate = useNavigate();
  const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const isFull = accommodation.availableRooms === 0;
  const d = dark;

  return (
    <div
      onClick={() => navigate(`/accommodations/${accommodation._id}`)}
      className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
      style={d ? {
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      } : {
        background: "white",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      }}
    >
      {/* Photo */}
      <div className="relative h-52 overflow-hidden" style={{ background: d ? "#1a1a2e" : "#f1f5f9" }}>
        {accommodation.photos?.[imgIdx] ? (
          <img
            src={toUrl(BASE, accommodation.photos[imgIdx])}
            alt={accommodation.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ background: d ? "#0f0f1a" : "#e2e8f0", color: d ? "#f59e0b" : "#94a3b8" }}
          >
            🏠
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

        {/* Full overlay */}
        {isFull && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-black text-xl tracking-widest uppercase">Full</span>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow ${
            accommodation.gender === "Male" || accommodation.gender === "Boys"
              ? "bg-blue-500 text-white"
              : accommodation.gender === "Female" || accommodation.gender === "Girls"
              ? "bg-pink-500 text-white"
              : "bg-emerald-500 text-white"
          }`}>
            {accommodation.gender === "Male" || accommodation.gender === "Boys" ? "👨 Male" :
             accommodation.gender === "Female" || accommodation.gender === "Girls" ? "👩 Female" : "👥 Any"}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="text-[11px] font-bold bg-white/90 text-slate-700 px-2.5 py-1 rounded-full shadow">
            {isFull ? "🔴 Full" : `🟢 ${accommodation.availableRooms} room${accommodation.availableRooms > 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Photo dots */}
        {accommodation.photos?.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 items-center">
            {accommodation.photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                className={`rounded-full transition-all ${
                  i === imgIdx ? "bg-white w-4 h-1.5" : "bg-white/50 w-1.5 h-1.5"
                }`}
              />
            ))}
          </div>
        )}

        {/* Price on image */}
        <div className="absolute bottom-4 left-4">
          <p className="text-white font-black text-xl leading-none drop-shadow-lg">
            Rs. {accommodation.price.toLocaleString()}
          </p>
          <p className="text-white/80 text-xs font-medium">/ month</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className="font-black text-base leading-snug line-clamp-1 mb-1"
          style={{ color: d ? "rgba(255,255,255,0.9)" : "#0f172a" }}
        >
          {accommodation.title}
        </h3>
        <p
          className="text-xs mb-3 flex items-center gap-1 line-clamp-1"
          style={{ color: d ? "rgba(255,255,255,0.35)" : "#94a3b8" }}
        >
          <span>📍</span> {accommodation.address}
        </p>

        {/* Distance */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs flex items-center gap-1" style={{ color: d ? "rgba(255,255,255,0.4)" : "#64748b" }}>
            🎓 {accommodation.distance} {accommodation.distanceUnit} from uni
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={accommodation.isAvailable
              ? { background: d ? "rgba(16,185,129,0.15)" : "#d1fae5", color: d ? "#34d399" : "#059669" }
              : { background: d ? "rgba(239,68,68,0.15)" : "#fee2e2", color: d ? "#f87171" : "#dc2626" }
            }
          >
            {accommodation.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>

        {/* Facilities */}
        {accommodation.facilities?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {accommodation.facilities.slice(0, 4).map((f) => (
              <span
                key={f}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={d
                  ? { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }
                  : { background: "#f1f5f9", color: "#64748b" }
                }
              >
                {facilityIcons[f]} {f}
              </span>
            ))}
            {accommodation.facilities.length > 4 && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={d
                  ? { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)" }
                  : { background: "#f1f5f9", color: "#94a3b8" }
                }
              >
                +{accommodation.facilities.length - 4}
              </span>
            )}
          </div>
        )}

        {/* CTA Button */}
        <button
          className="w-full text-sm font-bold text-white rounded-xl px-4 py-2.5 transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 mt-1"
          style={d
            ? { background: "linear-gradient(135deg, #f59e0b, #ef4444)" }
            : { background: "#2563eb" }
          }
        >
          View Details & Photos
        </button>
      </div>
    </div>
  );
}