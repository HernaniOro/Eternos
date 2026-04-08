"use client";

import { Post, UserState } from "@/data/types";
import { profiles } from "@/data/profiles";
import PostCard from "./PostCard";

interface FeedListProps {
  posts: Post[];
  userState: UserState;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onShare?: (postId: string) => void;
  onHide?: (postId: string) => void;
}

export default function FeedList({
  posts,
  userState,
  onLike,
  onSave,
  onShare,
  onHide,
}: FeedListProps) {
  if (posts.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-zinc-500">
        <p className="text-lg">Nenhum post ainda.</p>
        <p className="text-sm mt-1">Siga pensadores para ver seus posts aqui.</p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => {
        const profile = profiles.find((p) => p.id === post.authorId);
        if (!profile) return null;
        return (
          <PostCard
            key={post.id}
            post={post}
            profile={profile}
            userState={userState}
            onLike={onLike}
            onSave={onSave}
            onShare={onShare}
            onHide={onHide}
          />
        );
      })}
    </div>
  );
}
