"use client";

import { profiles } from "@/data/profiles";
import { UserState } from "@/data/types";
import Avatar from "./Avatar";
import Link from "next/link";

interface RightPanelProps {
  userState: UserState;
  onToggleFollow: (profileId: string) => void;
}

export default function RightPanel({
  userState,
  onToggleFollow,
}: RightPanelProps) {
  // Show profiles the user is NOT following as suggestions
  const suggestions = profiles.filter(
    (p) => !userState.following.includes(p.id)
  );
  const displaySuggestions = suggestions.slice(0, 5);

  return (
    <div className="sticky top-0 pt-4 w-[350px] hidden lg:block">
      {/* Who to follow */}
      <div className="bg-zinc-900 rounded-2xl overflow-hidden">
        <h2 className="text-xl font-bold text-zinc-100 px-4 py-3">
          Quem seguir
        </h2>
        {displaySuggestions.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors"
          >
            <Link href={`/profile/${profile.id}`}>
              <Avatar profile={profile} size="sm" />
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                href={`/profile/${profile.id}`}
                className="block text-sm font-bold text-zinc-100 hover:underline truncate"
              >
                {profile.name}
              </Link>
              <span className="block text-xs text-zinc-500 truncate">
                {profile.handle}
              </span>
            </div>
            <button
              onClick={() => onToggleFollow(profile.id)}
              className="px-4 py-1.5 text-sm font-bold rounded-full bg-zinc-100 text-black hover:bg-zinc-300 transition-colors shrink-0"
            >
              Seguir
            </button>
          </div>
        ))}
        {suggestions.length > 5 && (
          <Link
            href="/explore"
            className="block px-4 py-3 text-sm text-blue-400 hover:bg-zinc-800/50 transition-colors"
          >
            Mostrar mais
          </Link>
        )}
      </div>

      {/* Trending tags */}
      <div className="bg-zinc-900 rounded-2xl overflow-hidden mt-4">
        <h2 className="text-xl font-bold text-zinc-100 px-4 py-3">
          Temas
        </h2>
        {[
          "Prudência",
          "Caridade",
          "Fortaleza",
          "Esperança",
          "Humildade",
          "Lei Natural",
          "Privatio Boni",
        ].map((tag) => (
          <div
            key={tag}
            className="px-4 py-2.5 hover:bg-zinc-800/50 transition-colors"
          >
            <span className="text-sm font-bold text-zinc-200">{tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
