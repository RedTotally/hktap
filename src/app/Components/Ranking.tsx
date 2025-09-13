"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sokmrypoigsarqrdmgpq.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

interface RankingProps {
  onClose?: () => void;
}

interface RatingData {
  id: string;
  location_id: string;
  user_name?: string;
  rating: number;
  comment?: string;
  created_at: string;
  // Location data if joined
  title?: string;
  description?: string;
  photo?: string;
}

export default function Ranking({ onClose }: RankingProps) {
  if (supabaseKey == undefined) {
    return <p className="text-red-500">Supabase key is missing</p>;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const [rankings, setRankings] = useState<RatingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ratings")
        .select(`
          *,
          locations_db (
            title,
            description,
            photo
          )
        `)
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Rankings data:', data);
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
    <div className="flex flex-col bg-white rounded-xl w-full h-full lg:w-auto lg:h-auto relative max-w-2xl mx-auto">
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
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-center">🏆 Leaderboard</h2>
        <p className="text-center text-gray-600 mt-2">Top rated locations in Hong Kong</p>
      </div>

      {/* Rankings List */}
      <div className="flex-1 overflow-y-auto p-4 max-h-96">
        {rankings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No rankings available yet</p>
            <p className="text-sm text-gray-400 mt-2">Be the first to rate a location!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rankings.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Rank */}
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-600' : 
                    'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                </div>

                {/* Photo */}
                {item.locations_db?.photo && (
                  <img
                    src={item.locations_db.photo}
                    alt={item.locations_db.title || 'Location'}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">
                    {item.locations_db?.title || `Location ${item.location_id}`}
                  </h3>
                  {item.locations_db?.description && (
                    <p className="text-gray-600 text-sm truncate">
                      {item.locations_db.description}
                    </p>
                  )}
                  {item.user_name && (
                    <p className="text-xs text-gray-500 mt-1">
                      Rated by: {item.user_name}
                    </p>
                  )}
                  {item.comment && (
                    <p className="text-sm text-gray-700 mt-1 italic">
                      "{item.comment}"
                    </p>
                  )}
                </div>

                {/* Rating */}
                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl">⭐</span>
                    <span className="font-bold text-lg">{item.rating}</span>
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
