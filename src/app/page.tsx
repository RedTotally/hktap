"use client";

/* eslint-disable react-hooks/rules-of-hooks */

import dynamic from "next/dynamic";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import CameraCapture from "./Components/Camera";
import Chat from "./Components/Chat";
import Ranking from "./Components/Ranking";

import Dock from "./Components/Dock";
import { tr } from "motion/react-client";
import { useSearchParams } from "next/navigation";

const Map = dynamic(() => import("./Components/Map"), {
  ssr: false,
});

export default function Home() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "default";

  const supabaseUrl = "https://sokmrypoigsarqrdmgpq.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  const [currentCategory, setCurrentCategory] = useState("");
  const [locationsData, setLocationsData] = useState<any[]>([]);

  const [moreOption, setMoreOption] = useState(false);
  const [leaderboard, setLeaderboard] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const [camera, setCamera] = useState(false);
  const [ranking, setRanking] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);

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
      }
    }
  }

  async function fetchCategories() {
    if (supabaseKey !== undefined) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      let { data: categories, error } = await supabase
        .from("locations_db")
        .select("category")
        .neq("category", "");

      if (error) {
        console.log(error);
        setCategories([]);
        setTopCategories([]);
      } else {
        const categoryCounts: { [key: string]: number } = (
          categories || []
        ).reduce(
          (
            acc: { [key: string]: number },
            { category }: { category: string }
          ) => {
            if (category) {
              acc[category] = (acc[category] || 0) + 1;
            }
            return acc;
          },
          {}
        );

        const sortedCategories = Object.entries(categoryCounts)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count);

        const allCategories = sortedCategories.map(({ category }) => ({
          category,
        }));

        const topThreeCategories = await Promise.all(
          sortedCategories.slice(0, 3).map(async ({ category }) => {
            const { data: location, error: locationError } = await supabase
              .from("locations_db")
              .select("photo")
              .eq("category", category)
              .neq("photo", "")
              .limit(1)
              .order("id", { ascending: Math.random() > 0.5 });

            if (locationError) {
              console.log(
                `Error fetching photo for ${category}:`,
                locationError
              );
              return { category, photo: "" };
            }

            return {
              category,
              photo: location.length > 0 ? location[0].photo : "",
            };
          })
        );

        setCategories(allCategories);
        setTopCategories(topThreeCategories);
      }
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <><Suspense fallback={<div>Loading...</div>}>
      <div
        className={
          selectedCategory == "default" ? "hidden" : "flex justify-center"
        }
      >
        <div
          onClick={() => {
            window.location.replace(`/`);
          }}
          className="fixed top-5 p-1 z-[100] bg-indigo-500 cursor-pointer w-[25em] rounded-full"
        >
          <p className="text-white text-sm text-center">
            Category Search: {selectedCategory}, click to dismiss.
          </p>
        </div>
      </div>

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

        <div className="mt-5 w-full h-[15em] md:h-[25em] lg:h-[35em]">
          <div className="grid grid-cols-3 h-full">
            {topCategories.map((item) => {
              return (
                <div
               
                  onClick={() => {
                    setCurrentCategory(item.category);
                    window.location.replace(`/?category=${item.category}`);
                  }}
                  key={item.category}
                  className="cursor-pointer bg-cover bg-center flex justify-center items-center relative group"
                  style={{
                    backgroundImage: item.photo ? `url(${item.photo})` : "none",
                    backgroundColor: item.photo ? "transparent" : "#e0e0e0",
                  }}
                >
                  <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                  <p className="text-white lg:text-2xl font-bold z-10">
                    {item.category}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-[5em] mb-15 flex justify-center">
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

      <div className="relative z-[5] bg-gray-100 h-[35em] overflow-auto">
        <div className="grid sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-10 gap-5 w-full p-5 overflow-auto">
          {categories.map((item) => {
            return (
              <div
              key={item.category}
                onClick={() => {
                  setCurrentCategory(item.category);
                  window.location.replace(`/?category=${item.category}`);
                }}
                className="text-xs bg-white flex items-center justify-center rounded-full p-3 cursor-pointer"
              >
                <p className="ml-2">{item.category}</p>
              </div>
            );
          })}
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

      <div
        className={
          ranking == true
            ? "fixed w-full h-full top-0 z-[102]"
            : "fixed w-full h-full top-0 z-[102] hidden"
        }
      >
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
      </Suspense>
    </>
  );
}
