"use client";

import { UserState, EngagementEvent } from "@/data/types";
import { posts as allPosts } from "@/data/posts";

const STORAGE_KEY = "eternos-user";

export const defaultState: UserState = {
  following: [],
  liked: [],
  saved: [],
  shared: [],
  authorEngagement: {},
  tagAffinity: {},
  hidden: [],
  engagementLog: [],
};

export function getUserState(): UserState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    // Merge with defaults for backwards compatibility
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

export function setUserState(state: UserState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ── Engagement weights (Twitter-inspired) ──
// Like = 0.5, Save = 13.5 (≈ reply weight), Share = 1.0 (≈ retweet),
// Profile click = 12.0, Dwell = 10.0 (extended engagement)
const ENGAGEMENT_WEIGHTS: Record<EngagementEvent["type"], number> = {
  like: 0.5,
  save: 13.5,
  share: 1.0,
  profile_click: 12.0,
  dwell: 10.0,
};

function logEngagement(
  state: UserState,
  postId: string,
  type: EngagementEvent["type"]
): UserState {
  const post = allPosts.find((p) => p.id === postId);
  if (!post) return state;

  const weight = ENGAGEMENT_WEIGHTS[type];

  // Update Real Graph (author engagement score)
  state.authorEngagement[post.authorId] =
    (state.authorEngagement[post.authorId] || 0) + weight;

  // Update SimClusters (tag affinity)
  state.tagAffinity[post.tag] =
    (state.tagAffinity[post.tag] || 0) + weight;

  // Append to engagement log (keep last 500 events)
  state.engagementLog.push({
    postId,
    authorId: post.authorId,
    tag: post.tag,
    type,
    timestamp: Date.now(),
  });
  if (state.engagementLog.length > 500) {
    state.engagementLog = state.engagementLog.slice(-500);
  }

  return state;
}

export function toggleFollow(profileId: string): UserState {
  const state = getUserState();
  const idx = state.following.indexOf(profileId);
  if (idx === -1) {
    state.following.push(profileId);
  } else {
    state.following.splice(idx, 1);
  }
  setUserState(state);
  return state;
}

export function toggleLike(postId: string): UserState {
  let state = getUserState();
  const idx = state.liked.indexOf(postId);
  if (idx === -1) {
    state.liked.push(postId);
    state = logEngagement(state, postId, "like");
  } else {
    state.liked.splice(idx, 1);
  }
  setUserState(state);
  return state;
}

export function toggleSave(postId: string): UserState {
  let state = getUserState();
  const idx = state.saved.indexOf(postId);
  if (idx === -1) {
    state.saved.push(postId);
    state = logEngagement(state, postId, "save");
  } else {
    state.saved.splice(idx, 1);
  }
  setUserState(state);
  return state;
}

export function recordShare(postId: string): UserState {
  let state = getUserState();
  if (!state.shared.includes(postId)) {
    state.shared.push(postId);
  }
  state = logEngagement(state, postId, "share");
  setUserState(state);
  return state;
}

export function recordProfileClick(profileId: string): UserState {
  let state = getUserState();
  // Use a synthetic postId for profile clicks
  state.authorEngagement[profileId] =
    (state.authorEngagement[profileId] || 0) + ENGAGEMENT_WEIGHTS.profile_click;
  state.engagementLog.push({
    postId: `profile:${profileId}`,
    authorId: profileId,
    tag: "",
    type: "profile_click",
    timestamp: Date.now(),
  });
  if (state.engagementLog.length > 500) {
    state.engagementLog = state.engagementLog.slice(-500);
  }
  setUserState(state);
  return state;
}

export function hidePost(postId: string): UserState {
  const state = getUserState();
  if (!state.hidden.includes(postId)) {
    state.hidden.push(postId);
  }
  setUserState(state);
  return state;
}
