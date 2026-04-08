"use client";

import { Profile } from "@/data/types";
import Avatar from "./Avatar";

interface ProfileHeaderProps {
  profile: Profile;
  isFollowing: boolean;
  postCount: number;
  onToggleFollow: () => void;
}

export default function ProfileHeader({
  profile,
  isFollowing,
  postCount,
  onToggleFollow,
}: ProfileHeaderProps) {
  return (
    <div>
      {/* Banner */}
      <div className={`h-32 ${profile.accentColor} opacity-30`} />

      <div className="px-4 pb-4">
        {/* Avatar */}
        <div className="-mt-10 mb-3 flex items-end justify-between">
          <div className="border-4 border-black rounded-full">
            <Avatar profile={profile} size="lg" />
          </div>
          <button
            onClick={onToggleFollow}
            className={`px-5 py-2 text-sm font-bold rounded-full transition-colors ${
              isFollowing
                ? "border border-zinc-600 text-zinc-100 hover:border-red-500 hover:text-red-500"
                : "bg-zinc-100 text-black hover:bg-zinc-300"
            }`}
          >
            {isFollowing ? "Seguindo" : "Seguir"}
          </button>
        </div>

        {/* Info */}
        <h1 className="text-xl font-bold text-zinc-100">{profile.name}</h1>
        <p className="text-sm text-zinc-500">{profile.handle}</p>
        {profile.era && (
          <p className="text-xs text-zinc-600 mt-0.5">{profile.era}</p>
        )}
        <p className="mt-2 text-[15px] text-zinc-300 leading-relaxed">
          {profile.bio}
        </p>

        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-zinc-400">
            <span className="font-bold text-zinc-100">{postCount}</span> posts
          </span>
        </div>
      </div>

      <div className="border-b border-zinc-800" />
    </div>
  );
}
