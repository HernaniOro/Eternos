"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Avatar from "@/components/Avatar";
import { profiles } from "@/data/profiles";
import { UserState } from "@/data/types";
import { getUserState, toggleFollow, defaultState } from "@/lib/storage";
import Link from "next/link";

const categories = [
  { key: "all", label: "Todos" },
  { key: "filosofo", label: "Filósofos" },
  { key: "teologo", label: "Teólogos" },
  { key: "biblico", label: "Bíblicos" },
  { key: "escritor", label: "Escritores" },
  { key: "cientista", label: "Cientistas" },
  { key: "contemporaneo", label: "Contemporâneos" },
];

export default function ExplorePage() {
  const [userState, setUserState] = useState<UserState>(defaultState);
  const [filter, setFilter] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUserState(getUserState());
    setMounted(true);
  }, []);

  const handleToggleFollow = useCallback((profileId: string) => {
    setUserState(toggleFollow(profileId));
  }, []);

  const filtered =
    filter === "all"
      ? profiles
      : profiles.filter((p) => p.category === filter);

  return (
    <div className="flex justify-center min-h-screen">
      <Sidebar />

      <main className="w-full max-w-[600px] md:border-x border-zinc-800 min-h-screen pb-16 md:pb-0">
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-zinc-800">
          <h1 className="px-4 py-3 text-xl font-bold">Explorar</h1>

          {/* Category tabs */}
          <div className="flex overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  filter === cat.key
                    ? "border-blue-500 text-zinc-100"
                    : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Profile grid */}
        <div>
          {filtered.map((profile) => {
            const isFollowing = mounted && userState.following.includes(profile.id);
            return (
              <div
                key={profile.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors"
              >
                <Link href={`/profile/${profile.id}`}>
                  <Avatar profile={profile} />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${profile.id}`}
                    className="block font-bold text-zinc-100 hover:underline truncate text-[15px]"
                  >
                    {profile.name}
                  </Link>
                  <p className="text-sm text-zinc-500 truncate">
                    {profile.handle}
                  </p>
                  <p className="text-sm text-zinc-400 line-clamp-1 mt-0.5">
                    {profile.bio}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleFollow(profile.id)}
                  className={`px-4 py-1.5 text-sm font-bold rounded-full transition-colors shrink-0 ${
                    isFollowing
                      ? "border border-zinc-600 text-zinc-100 hover:border-red-500 hover:text-red-500"
                      : "bg-zinc-100 text-black hover:bg-zinc-300"
                  }`}
                >
                  {isFollowing ? "Seguindo" : "Seguir"}
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
