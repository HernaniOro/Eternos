"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import RightPanel from "@/components/RightPanel";
import FeedList from "@/components/FeedList";
import { UserState, Post } from "@/data/types";
import {
  getUserState,
  defaultState,
  toggleFollow,
  toggleLike,
  toggleSave,
  recordShare,
  hidePost,
} from "@/lib/storage";
import { rankFeed } from "@/lib/algorithm";

export default function HomePage() {
  const [userState, setUserState] = useState<UserState>(defaultState);
  const [feed, setFeed] = useState<Post[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const state = getUserState();
    setUserState(state);
    setFeed(rankFeed(state));
    setMounted(true);
  }, []);

  // Called by Sidebar when user clicks "Início" — reshuffles the feed
  const handleRefreshFeed = useCallback(() => {
    const state = getUserState();
    setUserState(state);
    setFeed(rankFeed(state));
  }, []);

  const handleLike = useCallback((postId: string) => {
    setUserState(toggleLike(postId));
  }, []);

  const handleSave = useCallback((postId: string) => {
    setUserState(toggleSave(postId));
  }, []);

  const handleShare = useCallback((postId: string) => {
    setUserState(recordShare(postId));
  }, []);

  const handleHide = useCallback((postId: string) => {
    const newState = hidePost(postId);
    setUserState(newState);
    setFeed((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const handleToggleFollow = useCallback((profileId: string) => {
    const newState = toggleFollow(profileId);
    setUserState(newState);
    setFeed(rankFeed(newState));
  }, []);

  return (
    <div className="flex justify-center min-h-screen">
      <Sidebar onRefreshFeed={handleRefreshFeed} />

      <main className="w-full max-w-[600px] md:border-x border-zinc-800 min-h-screen pb-16 md:pb-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-zinc-800">
          <h1 className="px-4 py-3 text-xl font-bold">Início</h1>
        </div>

        {mounted && (
          <FeedList
            posts={feed}
            userState={userState}
            onLike={handleLike}
            onSave={handleSave}
            onShare={handleShare}
            onHide={handleHide}
          />
        )}
      </main>

      <RightPanel userState={userState} onToggleFollow={handleToggleFollow} />
    </div>
  );
}
