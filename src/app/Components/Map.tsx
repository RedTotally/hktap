"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { UUID } from "crypto";
import Link from "next/link";

interface Location {
  id: UUID;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  photo: string;
  votes: number;
}

function Map() {
  const supabaseUrl = "https://sokmrypoigsarqrdmgpq.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (supabaseKey == undefined) {
    return (
      <p className="text-red-500 p-4">
        Supabase configuration missing. Check environment variables.
      </p>
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const customIcon = new L.Icon({
    iconUrl: "/location.svg",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  async function fetchData() {
    try {
      setLoading(true);
      const { data: locations_db, error } = await supabase
        .from("locations_db")
        .select("*");

      if (error) throw error;

      console.log(locations_db);
      setLocations(locations_db || []);
    } catch (err) {
      setError("Failed to fetch locations: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

async function vote(place_id: UUID) {
  const { data: currentData, error: fetchError } = await supabase
    .from("locations_db")
    .select("votes")
    .eq("id", place_id)
    .single();

  if (fetchError) {
    console.error("Error fetching current votes:", fetchError);
    return { data: null, error: fetchError };
  }

  const currentVotes = currentData?.votes ?? 0;

  const { data, error } = await supabase
    .from("locations_db")
    .update({ votes: currentVotes + 1 })
    .eq("id", place_id)
    .select();

  if (!error) {
    setLocations(prevLocations =>
      prevLocations.map(location =>
        location.id === place_id
          ? { ...location, votes: currentVotes + 1 }
          : location
      )
    );
  }

  return { data, error };
}
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading map...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <MapContainer
      className="w-full h-full relative z-[1]"
      center={[22.3193, 114.1694]}
      zoom={13}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {locations.map((item) => {
        const position: [number, number] = [item.latitude, item.longitude];

        return (
          <Marker key={item.id} position={position} icon={customIcon}>
            <Popup>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              {item.photo && (
                <img
                  src={item.photo}
                  alt={item.title}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <p className="mb-2">{item.description}</p>
              <div className="my-3">
                <div className="flex justify-center items-center">
                  <div className="group p-2">
                    <div className="flex justify-center relative z-[110]">
                      <p
                        className={`duration-200 opacity-0 group-hover:opacity-100 absolute -top-10 group-hover:-top-11 w-fit whitespace-pre rounded-md border border-neutral-700 bg-[#060010] px-2 py-0.5 text-xs text-white`}
                      >
                        Drop Your Heat
                      </p>
                    </div>
                    <img
                      onClick={() => vote(item.id)}
                      className="bg-orange-500 rounded-full p-5 cursor-pointer w-[7em]"
                      src={"/flame.svg"}
                    />
                  </div>
                </div>
                <p className="text-center text-xl">{item.votes}</p>
                <Link
                  className="text-sm my-2 block text-center underline"
                  href={`https://www.google.com/maps/place/${position[0].toFixed(
                    4
                  )}, ${position[1].toFixed(4)}`}
                >
                  Take me there
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default Map;
