"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sokmrypoigsarqrdmgpq.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

interface RankingProps {
  onClose?: () => void;
}

interface LocationData {
  id: string;
  title?: string;
  description?: string;
  photo?: string;
  votes: number;
  created_at: string;
  latitude: number;
  longitude: number;
}

export default function Ranking({ onClose }: RankingProps) {
  if (supabaseKey == undefined) {
    return <p className="text-red-500">Supabase key is missing</p>;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const selectedCategory = searchParams.get("category") || "default";

  const [rankings, setRankings] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("locations_db")
        .select(
          "id, title, description, photo, votes, created_at, latitude, longitude"
        )
        .order("votes", { ascending: false })
        .order("created_at", { ascending: false });

      if (selectedCategory !== "default") {
        query = query.eq("category", selectedCategory);
      }
      const { data, error } = await query;

      if (error) throw error;

      console.log("Rankings data:", data);
      setRankings(data || []);
    } catch (err) {
      setError("Failed to fetch rankings: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  function formatNumber(num: number): string {
    if (num < 1000) return num.toString();

    const units = [
      "K",
      "M",
      "B",
      "T",
      "Qa",
      "Qi",
      "Sx",
      "Sp",
      "Oc",
      "No",
      "Dc",
    ];

    let unitIndex = -1;

    while (num >= 1000 && unitIndex < units.length - 1) {
      num /= 1000;
      unitIndex++;
    }

    return num % 1 === 0
      ? num.toFixed(0) + units[unitIndex]
      : num.toFixed(1) + units[unitIndex];
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center pb-4 bg-white rounded-xl w-full h-full lg:w-auto lg:h-auto relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
            aria-label="Close rankings"
          >
            ×
          </button>
        )}
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading rankings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center pb-4 bg-white rounded-xl w-full h-full lg:w-auto lg:h-auto relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
            aria-label="Close rankings"
          >
            ×
          </button>
        )}
        <div className="text-red-500 p-4 text-center">
          <h3 className="font-bold text-lg mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col bg-white p-2 py-5
     rounded-xl w-[20em] h-full lg:w-auto relative max-w-2xl mx-auto"
    >
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
          aria-label="Close rankings"
        >
          ×
        </button>
      )}

      {/* Header */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center">Leaderboard</h2>
        <p className="text-center text-gray-600 text-sm">
          Most voted locations in Hong Kong
        </p>
      </div>

      {/* Rankings List */}
      <div className="flex-1 overflow-y-auto p-2 max-h-130 rounded-xl">
        {rankings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No rankings available yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Be the first to vote for a location!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rankings.map((item, index) => (
              <div
                key={item.id}
                onClick={() => {
                  window.location.replace(
                    `https://www.google.com/maps/place/${[
                      item.latitude,
                      item.longitude,
                    ][0].toFixed(4)}, ${[
                      item.latitude,
                      item.longitude,
                    ][1].toFixed(4)}`
                  );
                }}
                className="cursor-pointer lg:flex items-center gap-4 px-5 py-5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Rank */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                        ? "bg-gray-400"
                        : index === 2
                        ? "bg-orange-600"
                        : "bg-indigo-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Photo */}
                {item.photo && (
                  <img
                    src={item.photo}
                    alt={item.title || "Location"}
                    className="w-16 h-16 object-cover rounded-lg my-5 lg:my-0"
                  />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {item.title
                      ? item.title.charAt(0).toUpperCase() + item.title.slice(1)
                      : `Location ${item.id}`}
                  </h3>
                  {item.description && (
                    <p className="text-gray-600 text-xs truncate">
                      {item.description.charAt(0).toUpperCase() +
                        item.description.slice(1)}
                    </p>
                  )}
                </div>

                {/* Votes */}
                <div className="flex items-center justify-between lg:block lg:flex-shrink-0 text-right mt-5 lg:mt-0">
                  <div className="flex items-center gap-2">
                    <img
                      src="/flame.svg"
                      alt="Heat votes"
                      className="w-6 h-6 bg-orange-500 rounded-full p-1"
                    />
                    <span className="font-bold text-lg">{formatNumber(item.votes)}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
