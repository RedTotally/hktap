"use client";

/* eslint-disable react-hooks/rules-of-hooks */

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import CameraCapture from "./Components/Camera";
import Chat from "./Components/Chat";
import Ranking from "./Components/Ranking";

import Dock from "./Components/Dock";
import { tr } from "motion/react-client";

const Map = dynamic(() => import("./Components/Map"), {
  ssr: false,
});

export default function Home() {
  const supabaseUrl = "https://sokmrypoigsarqrdmgpq.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  const [currentCategory, setCurrentCategory] = useState("");
  const [locationsData, setLocationsData] = useState<any[]>([]);

  const [moreOption, setMoreOption] = useState(false);
  const [leaderboard, setLeaderboard] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const [camera, setCamera] = useState(false);
  const [ranking, setRanking] = useState(false);

  const items = [
    {
      icon: "/leaderboard.svg",
      label: "Leaderboard",
      onClick: () => setRanking(true),
    },
    {
      icon: "/add.svg",
      label: "Add Location",
      onClick: () => setCamera(true),
    },
    {
      icon: "/AI.svg",
      label: "AI Assistant",
      onClick: () => setChatOpen(!chatOpen),
    },
  ];

  useEffect(() => {
    async function fetchLocationsData() {
      if (supabaseKey !== undefined) {
        const supabase = createClient(supabaseUrl, supabaseKey);

        try {
          const { data, error } = await supabase
            .from("locations_db")
            .select("*");

          if (error) {
            console.error("Error fetching locations:", error);
          } else {
            setLocationsData(data || []);
          }
        } catch (err) {
          console.error("Failed to fetch locations:", err);
        }
      }
    }

    fetchLocationsData();
  }, [supabaseKey]);

  async function addData() {
    if (supabaseKey !== undefined) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase
        .from("locations_db")
        .insert([{ title: "someValue", description: "otherValue" }])
        .select();

      if (error) {
        console.log(error);
      } else {
        console.log(data);
      }
    }
  }

  return (
    <>
      <div className="fixed bg-black z-[100] flex justify-center bottom-0 left-[50%] right-[50%] mb-5">
        <Dock
          items={items}
          panelHeight={68}
          baseItemSize={50}
          magnification={70}
        />
      </div>

      <div className="flex justify-center items-center h-[35em] bg-gray-100 relative">
        <Map />
      </div>

      <div>
        <div className="sticky bg-white top-0 z-[99] py-10">
          <p className="text-center text-5xl font-bold mt-2">HKTAP</p>
          <p className="text-center mt-2">
            A few taps, know where to go on the map;<br></br> find extraordinary
            places in Hong Kong.
          </p>
        </div>

        <p className="text-center text-sm mt-10">
          🔥<br></br>Trending Options
        </p>

        <div className="mt-5 w-full h-[45em]">
          <div className="grid grid-cols-3 h-full">
            <div
              className="cursor-pointer h-screen bg-cover bg-center flex justify-center items-center relative group"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/gps-cs-s/AC9h4nrcjflF-BVq-_Ll76heCBOuco8jm6R4RhX8FQ1CDrWsrqt8XzZG6clguEk0TO4uM8WTsnnFhYDCcWdG4a-XQuNjdRBo1EQgZywi2JQmx2NpGx4Uhdd8GoU7oJB6V_Lj0-z1dyn_=s680-w680-h510-rw')`,
              }}
            >
              <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
              <p className="text-white text-2xl font-bold z-10">Gathering</p>
            </div>
            <div
              className="cursor-pointer h-screen bg-cover bg-center flex justify-center items-center relative group"
              style={{
                backgroundImage: `url('https://assets.iwgplc.com/image/upload/c_fill,f_auto,q_auto,ar_4:3,w_648,h_486/v1699967837/WebsiteImagery/Brands/Regus/Geo-Solutions-Imagery/Coworking/Coworking_Geo_Hero.jpg')`,
              }}
            >
              <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
              <p className="text-white text-2xl font-bold z-10">
                Business Meeting
              </p>
            </div>
            <div
              className="cursor-pointer h-screen bg-cover bg-center flex justify-center items-center relative group"
              style={{
                backgroundImage: `url('https://webbox.imgix.net/images/qtoxntqvpggxjbws/103bc27e-82f6-4460-be5e-9cdee983e9b1.jpg?auto=format,compress&fit=crop&crop=entropy&w=986&q=55')`,
              }}
            >
              <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
              <p className="text-white text-2xl font-bold z-10">Dating</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-[17em] mb-15 flex justify-center">
        <p
          onClick={() =>
            moreOption == true ? setMoreOption(false) : setMoreOption(true)
          }
          className="text-sm underline cursor-pointer"
        >
          View Other Options
        </p>
      </div>

      <div
        className={
          moreOption == true
            ? "bg-white h-[35em] w-full absolute z-[50] duration-300 mt-[30em]"
            : "bg-white h-[35em] w-full absolute z-[50] duration-300"
        }
      ></div>

      <div className="relative z-[5] bg-gray-100 h-[35em]">
        <div className="grid grid-cols-10 gap-5 w-full p-5 overflow-auto">
          <div className="text-xs bg-white flex items-center justify-center rounded-full p-3 cursor-pointer">
            <img src={"/star.svg"}></img>
            <p className="ml-2">Placeholder</p>
          </div>
          <div className="text-xs bg-white flex items-center justify-center rounded-full p-3 cursor-pointer">
            <img src={"/star.svg"}></img>
            <p className="ml-2">Placeholder</p>
          </div>
          <div className="text-xs bg-white flex items-center justify-center rounded-full p-3 cursor-pointer">
            <img src={"/star.svg"}></img>
            <p className="ml-2">Placeholder</p>
          </div>
          <div className="text-xs bg-white flex items-center justify-center rounded-full p-3 cursor-pointer">
            <img src={"/star.svg"}></img>
            <p className="ml-2">Placeholder</p>
          </div>
          <div className="text-xs bg-white flex items-center justify-center rounded-full p-3 cursor-pointer">
            <img src={"/star.svg"}></img>
            <p className="ml-2">Placeholder</p>
          </div>
          <div className="text-xs bg-white flex items-center justify-center rounded-full p-3 cursor-pointer">
            <img src={"/star.svg"}></img>
            <p className="ml-2">Placeholder</p>
          </div>
        </div>
      </div>

      <div
        className={
          camera == true
            ? "fixed w-full h-full top-0 z-[102]"
            : "fixed w-full h-full top-0 z-[102] hidden"
        }
      >
        <div className="bg-black w-full h-screen top-0 z-[-1] opacity-30 absolute"></div>
        <div className="flex items-center justify-center w-full h-full">
          <CameraCapture onClose={() => setCamera(false)} />
        </div>
      </div>

      <div className={ranking == true ? "fixed w-full h-full top-0 z-[102]" : "fixed w-full h-full top-0 z-[102] hidden"}>
        <div className="bg-black w-full h-screen top-0 z-[-1] opacity-30 absolute"></div>
        <div className="flex items-center justify-center w-full h-full p-4">
          <Ranking onClose={() => setRanking(false)} />
        </div>
      </div>

      <div className="mb-[50em]"></div>

      <footer className="mb-[25em]">
        <p className="text-center">
          © 2025 HKTAP | An Exceptional Product for a Hackathon
        </p>
      </footer>

      <div className="relative z-[103]">
        <Chat
          locationsData={locationsData}
          supabaseUrl={supabaseUrl}
          supabaseKey={supabaseKey}
          isOpen={chatOpen}
          onToggle={() => setChatOpen(!chatOpen)}
        />
      </div>
    </>
  );
}
