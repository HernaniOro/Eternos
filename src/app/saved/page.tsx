"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import FeedList from "@/components/FeedList";
import { UserState } from "@/data/types";
import { getUserState, toggleLike, toggleSave, defaultState } from "@/lib/storage";
import { getSavedPosts } from "@/lib/algorithm";

export default function SavedPage() {
  const [userState, setUserState] = useState<UserState>(defaultState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUserState(getUserState());
    setMounted(true);
  }, []);

  const handleLike = useCallback((postId: string) => {
    setUserState(toggleLike(postId));
  }, []);

  const handleSave = useCallback((postId: string) => {
    setUserState(toggleSave(postId));
  }, []);

  const savedPosts = mounted ? getSavedPosts(userState) : [];

  return (
    <div className="flex justify-center min-h-screen">
      <Sidebar />

      <main className="w-full max-w-[600px] md:border-x border-zinc-800 min-h-screen pb-16 md:pb-0">
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-zinc-800">
          <h1 className="px-4 py-3 text-xl font-bold">Salvos</h1>
        </div>

        {mounted && savedPosts.length === 0 ? (
          <div className="px-4 py-12 text-center text-zinc-500">
            <p className="text-lg">Nenhum post salvo.</p>
            <p className="text-sm mt-1">
              Clique no ícone de bookmark para salvar posts.
            </p>
          </div>
        ) : (
          <FeedList
            posts={savedPosts}
            userState={userState}
            onLike={handleLike}
            onSave={handleSave}
          />
        )}
      </main>
    </div>
  );
}
