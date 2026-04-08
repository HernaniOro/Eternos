"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import FeedList from "@/components/FeedList";
import ProfileHeader from "@/components/ProfileHeader";
import { profiles } from "@/data/profiles";
import { UserState } from "@/data/types";
import {
  getUserState,
  toggleFollow,
  toggleLike,
  toggleSave,
  recordShare,
  recordProfileClick,
} from "@/lib/storage";
import { getProfilePosts } from "@/lib/algorithm";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const profile = profiles.find((p) => p.id === id);

  const [userState, setUserState] = useState<UserState>({
    following: [],
    liked: [],
    saved: [],
    shared: [],
    authorEngagement: {},
    tagAffinity: {},
    hidden: [],
    engagementLog: [],
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUserState(getUserState());
    setMounted(true);
    // Record profile click (Twitter: 12.0 weight — "Good Profile Click")
    if (id) {
      setUserState(recordProfileClick(id));
    }
  }, [id]);

  const handleLike = useCallback((postId: string) => {
    setUserState(toggleLike(postId));
  }, []);

  const handleSave = useCallback((postId: string) => {
    setUserState(toggleSave(postId));
  }, []);

  const handleShare = useCallback((postId: string) => {
    setUserState(recordShare(postId));
  }, []);

  const handleToggleFollow = useCallback(() => {
    if (profile) {
      setUserState(toggleFollow(profile.id));
    }
  }, [profile]);

  if (!profile) {
    return (
      <div className="flex justify-center min-h-screen">
        <Sidebar />
        <main className="w-full max-w-[600px] md:border-x border-zinc-800 min-h-screen pb-16 md:pb-0">
          <div className="px-4 py-12 text-center text-zinc-500">
            Perfil não encontrado.
          </div>
        </main>
      </div>
    );
  }

  const profilePosts = mounted ? getProfilePosts(profile.id) : [];
  const isFollowing = userState.following.includes(profile.id);

  return (
    <div className="flex justify-center min-h-screen">
      <Sidebar />

      <main className="w-full max-w-[600px] border-x border-zinc-800 min-h-screen">
        {/* Header bar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-zinc-800">
          <div className="flex items-center gap-6 px-4 py-2">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-zinc-900 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-none stroke-current stroke-2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold leading-tight">
                {profile.name}
              </h1>
              <p className="text-xs text-zinc-500">
                {profilePosts.length} posts
              </p>
            </div>
          </div>
        </div>

        <ProfileHeader
          profile={profile}
          isFollowing={isFollowing}
          postCount={profilePosts.length}
          onToggleFollow={handleToggleFollow}
        />

        <FeedList
          posts={profilePosts}
          userState={userState}
          onLike={handleLike}
          onSave={handleSave}
          onShare={handleShare}
        />
      </main>
    </div>
  );
}
