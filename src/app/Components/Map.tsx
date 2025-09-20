"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { UUID } from "crypto";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet.markercluster";

interface Location {
  id: UUID;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  category: string;
  photo: string;
  votes: number;
}

function Map() {
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const selectedCategory = searchParams.get("category") || "default";

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

  const [selectedLocation, setSelectedLocation] = useState<UUID>();
  const [selectedLocation_Title, setselectedLocation_Title] = useState("");
  const [selectedLocation_Description, setSelectedLocation_Description] =
    useState("");
  const [selectedLocation_Photo, setSelectedLocation_Photo] = useState("");
  const [selectedLocation_Category, setSelectedLocation_Category] = useState("")
  const [selectedLocation_Votes, setSelectedLocation_Votes] = useState(0)

  const getIconSize = (votes: number): [number, number] => {
    const baseSize = 25;
    const maxSize = 50;
    const scaleFactor = 0.5;
    const size = Math.min(baseSize + votes * scaleFactor, maxSize);
    return [size, size * 1.64];
  };

const createCustomIcon = (votes: number, title: string) => {
  const [width, height] = getIconSize(votes);

  return new L.DivIcon({
    html: `
      <div style="position: relative; text-align: center;">
        <div style="
          position: absolute;
          top: -15px; 
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.7); 
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 12px;
          white-space: nowrap;
          z-index: 1000;
        ">
          ${title.charAt(0).toUpperCase() + title.slice(1)}
        </div>
        <img src="/location.svg" style="width: ${width}px; height: ${height}px;" />
      </div>
    `,
    className: "custom-marker", 
    iconSize: [width, height],
    iconAnchor: [width / 2, height], 
    popupAnchor: [0, -height + 7], 
  });
};
  async function fetchData() {
    try {
      setLoading(true);
      let query = supabase.from("locations_db").select("*");

      if (selectedCategory !== "default") {
        query = query.eq("category", selectedCategory);
      }

      const { data: locations_db, error } = await query;

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
  }, [selectedCategory]);

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
      setLocations((prevLocations) =>
        prevLocations.map((location) =>
          location.id === place_id
            ? { ...location, votes: currentVotes + 1 }
            : location
        )
      );
      setSelectedLocation_Votes(currentVotes + 1)
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
    <Suspense fallback={<div>Loading...</div>}>
      <div className={selectedLocation !== undefined ? "absolute bottom-0 bg-white z-[125] p-2 py-5 w-full duration-300 flex justify-center" : "hidden"}>
        <div onClick={() => selectedLocation !== undefined ? vote(selectedLocation) : ""} className="fixed w-full h-full top-0 cursor-pointer z-[-1]"></div>
        <div className="w-[25em]">
          <p onClick={() => setSelectedLocation(undefined)} className="text-xs mb-2 underline cursor-pointer">Go Back</p>
          <div>
            <div
              style={{
                backgroundImage: selectedLocation_Photo
                  ? `url(${selectedLocation_Photo})`
                  : "none",
                backgroundColor: selectedLocation_Photo
                  ? "transparent"
                  : "#e0e0e0",
              }}
              className={
                selectedLocation_Photo == ""
                  ? "hidden"
                  : "w-full h-[15em] rounded-xl bg-black"
              }
            ></div>
          </div>
          <p className="mt-2 text-xs text-gray-600">{selectedLocation_Category.charAt(0).toUpperCase() +
              selectedLocation_Category.slice(1)}</p>
          <p className=" text-xl mt-2">
            {selectedLocation_Title.charAt(0).toUpperCase() +
              selectedLocation_Title.slice(1)}
          </p>
          <p className=" text-sm mt-2 text-gray-600">
            {selectedLocation_Description.charAt(0).toUpperCase() +
              selectedLocation_Description.slice(1)}
          </p>
          <p className="text-xs mt-5 text-center">Tap Anywhere to Vote</p>
          <p className="mt-2 text-center">{selectedLocation_Votes}</p>
        </div>
      </div>
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

        <MarkerClusterGroup>
          {locations.map((item) => {
            const position: [number, number] = [item.latitude, item.longitude];

            return (
              <Marker
                key={item.id}
                position={position}
                icon={createCustomIcon(item.votes, item.title)}
                eventHandlers={{
                  click: () => {
                    setSelectedLocation(item.id);
                    setselectedLocation_Title(item.title);
                    setSelectedLocation_Description(item.description);
                    setSelectedLocation_Photo(item.photo);
                    setSelectedLocation_Category(item.category)
                    setSelectedLocation_Votes(item.votes)
                    
                  },
                }}
              >
                <Popup autoClose={false}>
                  <h3 className="font-bold text-lg mb-2">
                    {" "}
                    {item.title.charAt(0).toUpperCase() + item.title.slice(1)}
                  </h3>
                  {item.photo && (
                    <img
                      src={item.photo}
                      alt={item.title}
                      className="w-full h-[15em] object-cover rounded mb-2"
                    />
                  )}

                  <p className="mb-2">
                    {" "}
                    {item.description.charAt(0).toUpperCase() +
                      item.description.slice(1)}
                  </p>
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
        </MarkerClusterGroup>
      </MapContainer>
    </Suspense>
  );
}

export default Map;
