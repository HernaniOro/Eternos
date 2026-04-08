import { Post, UserState } from "@/data/types";
import { posts as allPosts } from "@/data/posts";

// ── Session seed: controls shuffle order ──
// Same seed = same order. Call refreshSeed() to get a fresh shuffle.
let _sessionSeed: number | null = null;
function getSessionSeed(): number {
  if (_sessionSeed !== null) return _sessionSeed;
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("mirabiles-seed");
    if (stored) {
      _sessionSeed = parseInt(stored, 10);
    } else {
      _sessionSeed = Math.floor(Math.random() * 2147483647);
      sessionStorage.setItem("mirabiles-seed", _sessionSeed.toString());
    }
  } else {
    _sessionSeed = 42;
  }
  return _sessionSeed!;
}

/** Generate a new seed → next rankFeed() call produces a fresh order */
export function refreshSeed(): void {
  _sessionSeed = Math.floor(Math.random() * 2147483647);
  if (typeof window !== "undefined") {
    sessionStorage.setItem("mirabiles-seed", _sessionSeed.toString());
  }
}

// Deterministic pseudo-random seeded by (session + post ID)
// Same session = same order. New session (reopen browser) = new shuffle.
function seededRandom(seed: string): number {
  const sessionSeed = getSessionSeed();
  let hash = sessionSeed;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return (Math.abs(hash) % 10000) / 10000;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * VERITAS FEED ALGORITHM
 * Adapted from Twitter's open-source recommendation algorithm
 * (github.com/twitter/the-algorithm, April 2023)
 * ═══════════════════════════════════════════════════════════════
 *
 * Twitter's pipeline:
 *   1. Candidate sourcing (~1500 tweets, 50% in-network / 50% out-of-network)
 *   2. Heavy Ranker (48M param neural net → single score per tweet)
 *   3. Heuristics & filtering (author diversity, balance, social proof)
 *
 * Our adaptation for pre-generated content:
 *   1. All posts are candidates (no sourcing needed)
 *   2. Scoring uses Twitter's signal weights, adapted for our engagement types
 *   3. Same heuristic filters: author diversity, in/out balance, hidden posts
 *
 * Twitter's Heavy Ranker formula:
 *   score = Σ(weight_i × P(engagement_i))
 *
 *   Engagement weights (from source code):
 *     Like          =   0.5
 *     Retweet       =   1.0
 *     Reply         =  13.5
 *     Profile Click =  12.0
 *     Good Click    =  11.0
 *     Dwell (2min+) =  10.0
 *     Author Reply  =  75.0
 *     Negative      = −74.0
 *     Report        = −369.0
 *
 * Our mapping:
 *     Like   → Like (0.5)
 *     Share  → Retweet (1.0)
 *     Save   → Reply/deep engagement (13.5)
 *     Profile Click → Profile Click (12.0)
 *     Hidden → Negative feedback (−74.0)
 */

// ── CONSTANTS (from Twitter's algo) ──

const HALF_LIFE_MS = 6 * 60 * 60 * 1000; // 6 hours (Twitter uses 6h, not 7d)
const IN_NETWORK_RATIO = 0.5; // Twitter targets 50/50 in/out balance
const MAX_CONSECUTIVE_SAME_AUTHOR = 1; // Author diversity: never two in a row
const REAL_GRAPH_DECAY_MS = 7 * 24 * 60 * 60 * 1000; // Real Graph decays over 7 days

// ── STAGE 1: CANDIDATE SCORING ──

interface ScoredPost {
  post: Post;
  score: number;
  isInNetwork: boolean;
}

function computeRealGraphScore(
  authorId: string,
  userState: UserState
): number {
  /**
   * Real Graph: predicts likelihood of engagement between user and author.
   * Twitter uses a neural model; we approximate with:
   *   - Base score from cumulative author engagement
   *   - Time-weighted: recent interactions count more
   */
  const baseScore = userState.authorEngagement[authorId] || 0;

  // Time-weighted recent interactions (last 7 days count 2x)
  const now = Date.now();
  let recentBoost = 0;
  for (const event of userState.engagementLog) {
    if (event.authorId === authorId) {
      const age = now - event.timestamp;
      if (age < REAL_GRAPH_DECAY_MS) {
        const freshness = 1 - age / REAL_GRAPH_DECAY_MS;
        recentBoost += freshness * 2.0;
      }
    }
  }

  return baseScore + recentBoost;
}

function computeSimClustersScore(
  tag: string,
  userState: UserState
): number {
  /**
   * SimClusters: Twitter groups users into ~145k communities.
   * We approximate with tag affinity — how much the user engages
   * with posts of this tag/topic.
   */
  return userState.tagAffinity[tag] || 0;
}

function computeTimeDecay(createdAt: string): number {
  /**
   * Twitter's time decay: half-life of 6 hours.
   * score_decay = 0.5^(age_hours / 6)
   */
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return Math.pow(0.5, ageMs / HALF_LIFE_MS);
}

function scorePost(post: Post, userState: UserState): ScoredPost {
  const isFollowing = userState.following.includes(post.authorId);
  const isHidden = userState.hidden.includes(post.id);

  // Hidden posts get massive negative score (Twitter: -74.0 for negative feedback)
  if (isHidden) {
    return { post, score: -1000, isInNetwork: isFollowing };
  }

  // ── Real Graph (author relationship strength) ──
  const realGraph = computeRealGraphScore(post.authorId, userState);
  // Normalize to a multiplier: 1.0 base, up to ~5.0 for strong relationships
  const realGraphMultiplier = 1.0 + Math.min(realGraph / 20, 4.0);

  // ── SimClusters (topic affinity) ──
  const simClusters = computeSimClustersScore(post.tag, userState);
  // Normalize to multiplier: 1.0 base, up to ~3.0 for loved topics
  const simClustersMultiplier = 1.0 + Math.min(simClusters / 30, 2.0);

  // ── In-Network boost (Twitter: followed accounts dominate "For You") ──
  const inNetworkBoost = isFollowing ? 3.0 : 1.0;

  // ── Social Proof for out-of-network ──
  // Twitter requires second-degree connection. We approximate:
  // out-of-network posts with zero affinity score get penalized
  let socialProofPenalty = 1.0;
  if (!isFollowing && realGraph === 0 && simClusters === 0) {
    socialProofPenalty = 0.3; // Still show, but demoted
  }

  // ── Time decay (6-hour half-life) ──
  const timeDecay = computeTimeDecay(post.createdAt);

  // ── Content type boost (Twitter: images/video get ~2x in Light Ranker) ──
  // Our equivalent: "citacao" and "analogia" are richer content
  const contentBoost =
    post.type === "citacao" ? 1.3 :
    post.type === "analogia" ? 1.2 :
    post.type === "espelho" ? 1.15 : 1.0;

  // ── Final score ──
  const score =
    inNetworkBoost *
    realGraphMultiplier *
    simClustersMultiplier *
    socialProofPenalty *
    contentBoost *
    timeDecay;

  return { post, score, isInNetwork: isFollowing };
}

// ── STAGE 2: HEURISTIC FILTERS ──

function applyAuthorDiversity(scored: ScoredPost[]): ScoredPost[] {
  /**
   * Twitter rule: no too-many consecutive tweets from one author.
   * We cap at MAX_CONSECUTIVE_SAME_AUTHOR.
   */
  const result: ScoredPost[] = [];
  const deferred: ScoredPost[] = [];

  for (const item of scored) {
    // Count consecutive posts from same author at the end of result
    let consecutive = 0;
    for (let i = result.length - 1; i >= 0; i--) {
      if (result[i].post.authorId === item.post.authorId) {
        consecutive++;
      } else {
        break;
      }
    }

    if (consecutive >= MAX_CONSECUTIVE_SAME_AUTHOR) {
      deferred.push(item);
    } else {
      result.push(item);
    }
  }

  // Append deferred posts at the end
  return [...result, ...deferred];
}

function applyNetworkBalance(scored: ScoredPost[]): ScoredPost[] {
  /**
   * Twitter enforces ~50/50 in-network vs out-of-network.
   * We interleave to approximate this ratio.
   */
  const inNetwork = scored.filter((s) => s.isInNetwork);
  const outNetwork = scored.filter((s) => !s.isInNetwork);

  // If user follows nobody, just return all
  if (inNetwork.length === 0) return scored;
  if (outNetwork.length === 0) return scored;

  const result: ScoredPost[] = [];
  let inIdx = 0;
  let outIdx = 0;
  let inCount = 0;
  let outCount = 0;

  while (inIdx < inNetwork.length || outIdx < outNetwork.length) {
    const total = inCount + outCount || 1;
    const currentInRatio = inCount / total;

    // Pick from whichever pool is under-represented
    if (currentInRatio < IN_NETWORK_RATIO && inIdx < inNetwork.length) {
      result.push(inNetwork[inIdx++]);
      inCount++;
    } else if (outIdx < outNetwork.length) {
      result.push(outNetwork[outIdx++]);
      outCount++;
    } else if (inIdx < inNetwork.length) {
      result.push(inNetwork[inIdx++]);
      inCount++;
    }
  }

  return result;
}

// ── MAIN EXPORT ──

export function rankFeed(userState: UserState): Post[] {
  /**
   * Full pipeline:
   * 1. Score all posts (Heavy Ranker equivalent)
   * 2. Sort by score
   * 3. Filter hidden posts
   * 4. Apply author diversity (no spam from one author)
   * 5. Apply network balance (50/50 in/out when possible)
   * 6. Add small jitter for freshness on reload
   */

  // Stage 1: Score
  let scored = allPosts.map((post) => scorePost(post, userState));

  // Filter out hidden
  scored = scored.filter((s) => !userState.hidden.includes(s.post.id));

  // Sort by score (descending)
  scored.sort((a, b) => b.score - a.score);

  // Stage 2: Heuristics
  scored = applyAuthorDiversity(scored);

  // Only apply network balance if user is following someone
  if (userState.following.length > 0) {
    scored = applyNetworkBalance(scored);
  }

  // ── Shuffle jitter ──
  // Strong jitter (±40%) seeded by session + post ID.
  // Same session = same order. New session = fresh shuffle.
  // This keeps the feed feeling alive and varied, while
  // still respecting engagement signals (followed/liked authors float up).
  scored = scored.map((s) => ({
    ...s,
    score: s.score * (0.6 + seededRandom(s.post.id) * 0.8),
  }));

  // Re-sort after jitter
  scored.sort((a, b) => b.score - a.score);

  return scored.map((s) => s.post);
}

/**
 * Get posts for a specific profile, sorted by date (newest first)
 */
export function getProfilePosts(authorId: string): Post[] {
  return allPosts
    .filter((p) => p.authorId === authorId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

/**
 * Get saved posts in order
 */
export function getSavedPosts(userState: UserState): Post[] {
  return userState.saved
    .map((id) => allPosts.find((p) => p.id === id))
    .filter((p): p is Post => p !== undefined);
}
