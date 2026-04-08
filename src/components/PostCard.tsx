"use client";

import { Post, Profile, UserState } from "@/data/types";
import { timeAgo } from "@/lib/timeago";
import Avatar from "./Avatar";
import Link from "next/link";

interface PostCardProps {
  post: Post;
  profile: Profile;
  userState: UserState;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onShare?: (postId: string) => void;
  onHide?: (postId: string) => void;
}

function HeartIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-rose-500">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-blue-500">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function HideIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function PostCard({
  post,
  profile,
  userState,
  onLike,
  onSave,
  onShare,
  onHide,
}: PostCardProps) {
  const isLiked = userState.liked.includes(post.id);
  const isSaved = userState.saved.includes(post.id);
  const isShared = userState.shared?.includes(post.id) ?? false;

  async function handleShare() {
    const text = `"${post.content}"\n\n— ${profile.name}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
        onShare?.(post.id);
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      onShare?.(post.id);
    }
  }

  return (
    <article className="group px-4 py-3 border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors">
      <div className="flex gap-3">
        <Link href={`/profile/${profile.id}`}>
          <Avatar profile={profile} />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1.5 text-sm">
            <Link
              href={`/profile/${profile.id}`}
              className="font-bold text-zinc-100 hover:underline truncate"
            >
              {profile.name}
            </Link>
            <span className="text-zinc-500 truncate">{profile.handle}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-500 shrink-0">
              {timeAgo(post.createdAt)}
            </span>
          </div>

          {/* Content */}
          <p className="mt-1 text-zinc-200 text-[15px] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Tag */}
          <div className="mt-2">
            <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
              {post.tag}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-8 mt-2 -ml-2">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1.5 p-2 rounded-full transition-colors ${
                isLiked
                  ? "text-rose-500 hover:bg-rose-500/10"
                  : "text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10"
              }`}
            >
              <HeartIcon filled={isLiked} />
            </button>

            <button
              onClick={() => onSave(post.id)}
              className={`flex items-center gap-1.5 p-2 rounded-full transition-colors ${
                isSaved
                  ? "text-blue-500 hover:bg-blue-500/10"
                  : "text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10"
              }`}
            >
              <BookmarkIcon filled={isSaved} />
            </button>

            <button
              onClick={handleShare}
              className={`flex items-center gap-1.5 p-2 rounded-full transition-colors ${
                isShared
                  ? "text-emerald-500 hover:bg-emerald-500/10"
                  : "text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10"
              }`}
            >
              <ShareIcon />
            </button>

            <button
              onClick={() => onHide?.(post.id)}
              className="flex items-center gap-1.5 p-2 rounded-full text-zinc-500 hover:text-orange-500 hover:bg-orange-500/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Ver menos assim"
            >
              <HideIcon />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
