"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { UUID } from "crypto";

interface Location {
  id: UUID;
  latitude: number;
longitude: number;
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
              <p>Place</p>
              <p>
                {position[0].toFixed(4)}, {position[1].toFixed(4)}
              </p>
              <a className="cursor-pointer">Vote</a>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default Map;
