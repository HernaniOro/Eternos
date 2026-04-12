export interface Profile {
  id: string;
  name: string;
  handle: string;
  bio: string;
  era: string;
  category: "biblico" | "filosofo" | "teologo" | "escritor" | "cientista" | "contemporaneo";
  avatar: string; // initials or emoji fallback
  accentColor: string; // tailwind color class
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  tag: string; // virtude or principle
  type: "citacao" | "espelho" | "provocacao" | "micro-argumento" | "analogia";
  createdAt: string; // ISO date for sorting
  replyTo?: string;       // post ID this replies to
  replyToHandle?: string; // @handle of the original author (for display)
}

// ── Engagement tracking (inspired by Twitter's Real Graph) ──

export interface EngagementEvent {
  postId: string;
  authorId: string;
  tag: string;
  type: "like" | "save" | "share" | "profile_click" | "dwell";
  timestamp: number;
}

export interface UserState {
  following: string[];
  liked: string[];
  saved: string[];
  shared: string[];
  // Real Graph: per-author interaction counts
  authorEngagement: Record<string, number>;
  // SimClusters: per-tag affinity scores
  tagAffinity: Record<string, number>;
  // Negative signals
  hidden: string[]; // post IDs the user dismissed
  // Engagement log for time-weighted scoring
  engagementLog: EngagementEvent[];
}
