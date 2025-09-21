"use client";

/* eslint-disable react-hooks/rules-of-hooks */

import dynamicImport from "next/dynamic";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import CameraCapture from "./Components/Camera";
import Chat from "./Components/Chat";
import Ranking from "./Components/Ranking";
import Translate from "./Components/Translate";

import Dock from "./Components/Dock";
import { tr } from "motion/react-client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SplitText from "./Components/SplitText";
import SpotlightCard from "./Components/SpotlightCard";

const Map = dynamicImport(() => import("./Components/Map"), {
  ssr: false,
  loading: () => <div>Loading map...</div>,
});

export const dynamic = "force-dynamic";

export default function Home() {
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
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

  const [search, setSearch] = useState("");

  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };

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

  function getMatchScore(category: string, search: string) {
    const cat = category.toLowerCase();
    const s = search.toLowerCase();

    let score = 0;
    for (let i = 0; i < s.length; i++) {
      if (cat[i] === s[i]) {
        score++;
      } else {
        break;
      }
    }
    return score;
  }

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
      <Translate />
        <div
          className={
            selectedCategory == "default" ? "hidden" : "flex justify-center"
          }
        >
          <div
            onClick={() => {
              window.location.replace(`/`);
            }}
            className="fixed top-5 p-1 px-3 z-[100] bg-indigo-500 cursor-pointer rounded-full"
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
          <Suspense>
            <Map />
          </Suspense>
        </div>

        <div>
          <div className="sticky bg-white top-0 z-[99] py-15 animate-fade-up animate-ease-in-out px-10">
            <p className="text-center font-bold text-3xl lg:text-5xl">
              Find and Share Your Destinations
            </p>
            <p className="text-center mt-3 text-gray-600">
              A few taps, know where to go on the map; find extraordinary places
              in Hong Kong.
            </p>
          </div>

          <div className=" mt-10 flex justify-center items-center">
            <div>
              <div className="flex justify-center">
                {" "}
                <img className="w-5" src={"/fire-gray.svg"}></img>
              </div>
              <div className="mx-[.1em]"></div>
              <p className="text-center font-semibold text-gray-600 text-sm mt-2">
                TRENDING OPTIONS
              </p>
            </div>
          </div>

          <div className="mt-5 w-full h-[65em] md:h-[25em] lg:h-[35em]">
            <div className="grid md:grid-cols-3 h-full">
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
                      backgroundImage: item.photo
                        ? `url(${item.photo})`
                        : "none",
                      backgroundColor: item.photo ? "transparent" : "#e0e0e0",
                    }}
                  >
                    <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                    <p className="text-white xl:text-2xl font-bold z-10">
                      {item.category.charAt(0).toUpperCase() +
                        item.category.slice(1)}
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
            View All Options
          </p>
        </div>

        <div
          className={
            moreOption == true
              ? "bg-white h-[35em] w-full absolute z-[50] duration-300 mt-[30em]"
              : "bg-white h-[35em] w-full absolute z-[50] duration-300"
          }
        ></div>

        <div className="relative z-[5] bg-gray-100 h-[35em] overflow-auto border-t-[.1em] border-gray-300">
          <input
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-5 outline-none px-5"
            placeholder="Search..."
          ></input>
          <div className="grid w-full overflow-auto pb-[50em] border-t-[.1em] border-gray-300">
            {categories

              .map((item) => {
                const cat = item.category.toLowerCase();
                const s = search.toLowerCase().trim();

                let matchScore = 0;

                if (s.length > 0) {
                  const index = cat.indexOf(s);
                  if (index !== -1) {
                    matchScore = s.length + (cat.length - index) * 0.01;
                  }
                }

                return { ...item, matchScore };
              })
              .filter((item) => search === "" || item.matchScore > 0)
              .sort((a, b) => b.matchScore - a.matchScore)
              .map((item) => {
                return (
                  <div
                    key={item.category}
                    onClick={() => {
                      setCurrentCategory(item.category);
                      window.location.replace(`/?category=${item.category}`);
                    }}
                    className="bg-white p-3 py-5 cursor-pointer hover:brightness-[90%] duration-300 border-b-[.1em] border-gray-300"
                  >
                    <p className="ml-2">
                      {item.category.length > 50
                        ? item.category.charAt(0).toUpperCase() +
                          item.category.slice(1, 50) +
                          "..."
                        : item.category.charAt(0).toUpperCase() +
                          item.category.slice(1)}
                    </p>
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

        <div className="mb-[5em] relative z-[80] mt-10 px-10">
          <div className="flex justify-center items-center mb-5">
            {" "}
            <img className="w-5" src={"/features.svg"}></img>
            <p className="ml-1 text-center text-gray-600 font-semibold">
              OUR FEATURES
            </p>
          </div>
          <p className="text-center text-4xl font-semibold">
            A better way to share, and a better place to find.
          </p>
          <p className="mt-10 text-gray-600 text-center">
            No more boredom in Hong Kong after using this platform
          </p>
        </div>

        <div className="2xl:grid grid-cols-8 gap-5 px-10 lg:px-20 relative z-[80]">
          <div className="p-4 col-span-3">
            <div className="border-2 rounded-xl p-10 border-gray-200 outline-gray-100 outline-6">
              <div
                className="w-full h-[20em] rounded-xl"
                style={{
                  backgroundImage: 'url("/location.png")',
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>

              <p className="text-2xl my-7 font-semibold">
                Instant Location Sharing
              </p>
              <p className="text-gray-600 mt-1 leading-loose lg:h-[10em]">
                Our advanced camera feature automatically records your location
                when you submit, so you don't have to manually input where you
                are. 3, 2, 1... Captured! Share your location without
                interruption!
              </p>
            </div>
          </div>

          <div className="p-4 col-span-3">
            <div className="border-2 rounded-xl p-10 border-gray-200 outline-gray-100 outline-6">
              <div
                className="w-full h-[20em] rounded-xl"
                style={{
                  backgroundImage: 'url("/heats.png")',
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>

              <p className="text-2xl my-7 font-semibold">Bring Up the Heat</p>
              <p className="text-gray-600 mt-1 leading-loose lg:h-[10em]">
                We want everyone to participate in this craze. Show your love to
                the locations you are deeply interested in. Show the world what
                you love in Hong Kong by heating them up!
              </p>
            </div>
          </div>

          <div className="p-4 col-span-2">
            <div className="border-2 rounded-xl p-10 border-gray-200 outline-gray-100 outline-6">
              <div
                className="w-full h-[20em] rounded-xl"
                style={{
                  backgroundImage: 'url("/leaderboard.png")',
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>

              <p className="text-2xl my-7 font-semibold">Leaderboard</p>
              <p className="text-gray-600 mt-1 leading-loose lg:h-[10em]">
                Learn what is popular in Hong Kong, it's time to grab your
                belongings and go have a look.
              </p>
            </div>
          </div>
        </div>

        <div className="2xl:grid grid-cols-6 gap-5 px-10 lg:px-20">
          <div className="p-4 col-span-2">
            <div className="border-2 rounded-xl p-10 border-gray-200 outline-gray-100 outline-6">
              <div
                className="w-full h-[20em] rounded-xl"
                style={{
                  backgroundImage: 'url("/unique.png")',
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>

              <p className="text-2xl my-7 font-semibold">Be the Unique One</p>
              <p className="text-gray-600 mt-1 leading-loose lg:h-[10em]">
                Your recommendation could be so valuable that it becomes red
                with over 500 heats! Oh, it's hot here.
              </p>
            </div>
          </div>
          <div className="p-4 col-span-4">
            <div className="border-2 rounded-xl p-10 border-gray-200 outline-gray-100 outline-6">
              <div
                className="w-full h-[20em] rounded-xl"
                style={{
                  backgroundImage: 'url("/ai.png")',
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>

              <p className="text-2xl my-7 font-semibold">
                Powerful AI & Great Database
              </p>
              <p className="text-gray-600 mt-1 leading-loose lg:h-[10em]">
                Enjoy the AI chatbot backed by a massive database integrated
                into our website. You can receive the best and latest
                information by simply stating what you want to it. With the
                advanced model and fresh data, you are promised to get the best
                guidance possible.
              </p>
            </div>
          </div>
        </div>

        <div className="2xl:grid grid-cols-2 gap-5 px-10 lg:px-20">


          <div className="p-4 col-span-1">
            <div className="border-2 rounded-xl p-10 border-gray-200 outline-gray-100 outline-6">
              <div
                className="w-full h-[20em] rounded-xl"
                style={{
                  backgroundImage: 'url("/category.png")',
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>

              <p className="text-2xl my-7 font-semibold">Diverse Categories</p>
              <p className="text-gray-600 mt-1 leading-loose lg:h-[10em]">
               We sort locations by their purposes. So, you can find the most desirable place by looking at what you can do in particular destinations: more warm, welcoming, and straightforward; we have the right place for you.
              </p>
            </div>
          </div>
  <div className="p-4 col-span-1">
            <div className="border-2 rounded-xl p-10 border-gray-200 outline-gray-100 outline-6">
              <div
                className="w-full h-[20em] rounded-xl"
                style={{
                  backgroundImage: 'url("/hk.png")',
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>

              <p className="text-2xl my-7 font-semibold">We Love Hong Kong</p>
              <p className="text-gray-600 mt-1 leading-loose lg:h-[10em]">
Hong Kong, a fantastic place, is alluring, innovative, and exceptional. It is a place that stands up to any adversity; When we face troubles, we find solutions. Enthusiasm, solidarity, and thoughtfulness made us unique and magical. We love it here! 
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-[50] px-10 2xl:px-20 mt-[20em]">
          <div className="lg:flex justify-between items-center">
            <div>
                        <div className="flex items-center mb-5">
            {" "}
            <img className="w-5" src={"/purpose.svg"}></img>
            <p className="ml-1 text-center text-gray-600 font-semibold">
              PURPOSE
            </p>
          </div>
              <p className="text-5xl lg:text-7xl font-semibold">Why HKTAP?</p>
              <p className="text-xl lg:w-[35em] 2xl:w-[45em] mt-5 text-gray-600">
                It's fun, engaging, and filled with love! The best thing?
                Everyone can use it. Every pin in the map is a real human, a
                footprint on Hong Kong; it's real. Find somewhere exciting to
                go, and share somewhere worth your time.
              </p>

              <div className="mt-10">
                <a
                  onClick={() => setCamera(true)}
                  className=" text-xl cursor-pointer bg-black text-white px-5 py-2 rounded-xl hover:px-10 duration-300"
                >
                  「Try to Take a Snapshot」
                </a>
              </div>
            </div>
            <div className="flex justify-center">
              <img className="mt-20 lg:mt-0" src="/location-photo.svg"></img>
            </div>
          </div>
        </div>

        <div className="mt-[20em] px-10">
   

          <div className="flex justify-center mt-10">
            <p className="text-center text-3xl lg:text-5xl w-[20em] leading-tight font-semibold">
              Developed by Four Aspiring Talented Youth in Hong Kong
            </p>
          </div>
          <div className="flex justify-center">
            <p className="text-center mt-5 text-gray-600">
              The platform is built by a group of Gen Zs
            </p>
          </div>

          <div className="flex justify-center mt-20">
            <div>
              <div className="grid xl:grid-cols-4 gap-10 justify-center items-center">
                <div className="w-45 cursor-pointer group mb-5 lg:mt-0">
                  <p className="text-center xl:mb-5 text-xs h-[10em]">
                    "Be extraordinary!"<br></br>—Ricky Chan
                  </p>
                  <div className="bg-orange-500 rounded-full p-5 h-[25em] xl:h-[50em]">
                    <div className="flex justify-center">
                      <div
                        className="h-35 w-35 rounded-full outline-2 outline-offset-6 outline-white bg-cover bg-center"
                        style={{ backgroundImage: "url('/ricky.png')" }}
                      ></div>
                    </div>
                    <p className="text-center mt-5 text-2xl text-white">
                      Ricky Chan
                    </p>
                    <p className="text-center text-sm text-white">
                      Developer & Graphic Designer
                    </p>
                  </div>
                </div>

                <div className="w-45 cursor-pointer group mb-5 lg:mt-0">
                  <p className="text-center xl:mb-5 text-xs h-[10em]">
                    "Creating digital experiences with passion and precision."{" "}
                    <br></br>—Thomas Suen
                  </p>
                  <div className="bg-blue-500 rounded-full p-5 h-[25em] xl:h-[50em]">
                    <div className="flex justify-center">
                      <div className="h-35 w-35 bg-black rounded-full outline-2 outline-offset-6 outline-white"></div>
                    </div>
                    <p className="text-center mt-5 text-2xl text-white">
                      Thomas Suen
                    </p>
                    <p className="text-center text-sm text-white">
                      Developer & Photographer
                    </p>
                    <div className="flex justify-center mt-2">
                      <a
                        href="https://owenisas.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-white underline hover:text-blue-200 transition-colors"
                      >
                        owenisas.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="w-45 cursor-pointer group mb-5 lg:mt-0">
                  <p className="text-center xl:mb-5 text-xs h-[10em]">
                    "Lorem ipsum dolor sit amet."<br></br>—Jeff Leung
                  </p>
                  <div className="bg-yellow-500 rounded-full p-5 h-[25em] xl:h-[50em]">
                    <div className="flex justify-center">
                      <div className="h-35 w-35 bg-black rounded-full outline-2 outline-offset-6 outline-white"></div>
                    </div>
                    <p className="text-center mt-5 text-2xl text-white">
                      Jeff Leung
                    </p>
                    <p className="text-center text-sm text-white">
                      Creative Strategist
                    </p>
                  </div>
                </div>

                <div className="w-45 cursor-pointer group mb-5 lg:mt-0">
                  <p className="text-center xl:mb-5 text-xs h-[10em]">
                    "Lorem ipsum, dolor sit amet consectetur adipisicing elit."
                    <br></br>—CHM
                  </p>
                  <div className="bg-indigo-500 rounded-full p-5 h-[25em] xl:h-[50em]">
                    <div className="flex justify-center">
                      <div className="h-35 w-35 bg-black rounded-full outline-2 outline-offset-6 outline-white"></div>
                    </div>
                    <p className="text-center mt-5 text-2xl text-white">CHM</p>
                    <p className="text-center text-sm text-white">
                      Designer & Analyst
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[20em] flex justify-center bg-black text-white py-40 px-10">
          <div>
            <p className="text-center text-3xl lg:text-5xl">
              Learn About Our Ideas and Initiatives
            </p>
            <div className="flex justify-center mt-10">
              <Link
                className="bg-white p-5 px-20 text-black"
                target="_blank"
                href="https://devpost.com/software/hktap"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-[50em]"></div>

        <footer className="mb-[25em] px-10">
          <p className="text-center">
            © 2025 HKTAP | Developed with ❤️🇭🇰 | Made By Ambitious Youths
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
