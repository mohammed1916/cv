import ViewMenu from './components/ViewMenu';
import { ALL_PROBLEMS } from './data/problemRoutes.js';
import { createPortal } from 'react-dom';
import { resolveVisualSelection } from './components/shared/visualSelection.js';
import WelcomeHero from "./components/marketing/WelcomeHero";
import PrerequisiteDrawer from './components/PrerequisiteDrawer';
import CreateVisualizerButton from './components/CreateVisualizerButton';
import './components/shared/FluidMotion.css';
import './components/shared/RecoveredVisualizerTheme.css';
import LiveTutorial from './access/LiveTutorial';
import { TUTORIAL_STEPS } from './access/tutorialSteps';
import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  Component,
  Suspense,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import PrivacyPreferences from './analytics/PrivacyPreferences';
import { trackPage, trackEvent, openPrivacyPreferences } from './analytics/client';

import ProblemScaffold from "./components/panels/ProblemScaffold";
import ProblemNavigation from "./components/ProblemNavigation";

import { ZoomProvider } from "./context/ZoomContext";
import ThemeToggle from "./components/ThemeToggle";
import FeedbackWidget from "./components/feedback/FeedbackWidget";
import { ThemeProvider } from "./context/ThemeContext";
import { useVisualizationContext } from "./context/VisualizationContext";
import { useChatContext } from "./context/ChatContext";
import "./components/Chatbot/chatbot.css";
import VirtualCardGrid from "./components/VirtualCardGrid";

const ChatDrawer = React.lazy(() => import("./components/Chatbot/ChatDrawer"));
import "./App.css";
import { TRACKS } from "./data/implementedProblems";
import { mergeCatalog } from './data/catalogCoverage';
import { loadLeetCodeCatalog } from './data/leetcodeCatalogLoader';
import { useAccess } from "./access/useAccess";
import { isFreeProblem, accessLabel, PLANS, BETA_FREE_ACCESS } from "./access/policy";
import {
  AccessDialog,
  BetaSignIn,
  GoogleSignIn,
  Plans,
  PlaygroundGate,
} from "./access/AccessUI";

const RuntimePlayground = React.lazy(
  () => import("./playground/RuntimePlayground"),
);

const TrailerStudio = import.meta.env.DEV ? React.lazy(() => import('./promo/TrailerStudio')) : null;

/* ── Auto-discovery ──────────────────────────────────────────────────── */

// Metadata lives in a lightweight meta.js (eagerly bundled), while the heavy
// visualizer is dynamically imported via index.jsx so each one code-splits.
const IMPLEMENTED_BY_NUMBER = new Map(ALL_PROBLEMS.map((p) => [p.number, p]));

const BASICS_PROBLEMS = ALL_PROBLEMS.filter((p) =>
  (p.tags || []).includes("Basics"),
).sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));

const CODEFORCES_PROBLEMS = ALL_PROBLEMS.filter((p) =>
  (p.tags || []).includes("Codeforces"),
);

// Curated by LeetCode problem number rather than a meta.js tag, since these
// are fixed external lists (Blind 75 / NeetCode 150), not something to
// remember to tag on every new problem.
const BLIND75_NUMBERS = [
  "1",
  "121",
  "217",
  "238",
  "53",
  "152",
  "153",
  "33",
  "15",
  "11",
  "371",
  "191",
  "338",
  "268",
  "190",
  "70",
  "322",
  "300",
  "1143",
  "139",
  "39",
  "198",
  "213",
  "91",
  "62",
  "55",
  "133",
  "207",
  "417",
  "200",
  "128",
  "269",
  "261",
  "323",
  "57",
  "56",
  "435",
  "252",
  "253",
  "206",
  "141",
  "21",
  "23",
  "19",
  "143",
  "73",
  "54",
  "48",
  "79",
  "3",
  "424",
  "76",
  "242",
  "49",
  "20",
  "125",
  "5",
  "647",
  "271",
  "104",
  "100",
  "226",
  "124",
  "102",
  "297",
  "572",
  "105",
  "98",
  "230",
  "235",
  "208",
  "211",
  "212",
  "347",
  "295",
];

const NEETCODE150_ENTRIES = [
  ["217", "Contains Duplicate"],
  ["242", "Valid Anagram"],
  ["1", "Two Sum"],
  ["49", "Group Anagrams"],
  ["347", "Top K Frequent Elements"],
  ["271", "Encode and Decode Strings"],
  ["238", "Product of Array Except Self"],
  ["36", "Valid Sudoku"],
  ["128", "Longest Consecutive Sequence"],
  ["125", "Valid Palindrome"],
  ["167", "Two Sum II - Input Array Is Sorted"],
  ["15", "3Sum"],
  ["11", "Container With Most Water"],
  ["42", "Trapping Rain Water"],
  ["121", "Best Time to Buy and Sell Stock"],
  ["3", "Longest Substring Without Repeating Characters"],
  ["424", "Longest Repeating Character Replacement"],
  ["567", "Permutation in String"],
  ["76", "Minimum Window Substring"],
  ["239", "Sliding Window Maximum"],
  ["20", "Valid Parentheses"],
  ["155", "Min Stack"],
  ["150", "Evaluate Reverse Polish Notation"],
  ["739", "Daily Temperatures"],
  ["853", "Car Fleet"],
  ["84", "Largest Rectangle in Histogram"],
  ["704", "Binary Search"],
  ["74", "Search a 2D Matrix"],
  ["875", "Koko Eating Bananas"],
  ["153", "Find Minimum in Rotated Sorted Array"],
  ["33", "Search in Rotated Sorted Array"],
  ["981", "Time Based Key-Value Store"],
  ["4", "Median of Two Sorted Arrays"],
  ["206", "Reverse Linked List"],
  ["21", "Merge Two Sorted Lists"],
  ["141", "Linked List Cycle"],
  ["143", "Reorder List"],
  ["19", "Remove Nth Node From End of List"],
  ["138", "Copy List with Random Pointer"],
  ["2", "Add Two Numbers"],
  ["287", "Find the Duplicate Number"],
  ["146", "LRU Cache"],
  ["23", "Merge k Sorted Lists"],
  ["25", "Reverse Nodes in k-Group"],
  ["226", "Invert Binary Tree"],
  ["104", "Maximum Depth of Binary Tree"],
  ["543", "Diameter of Binary Tree"],
  ["110", "Balanced Binary Tree"],
  ["100", "Same Tree"],
  ["572", "Subtree of Another Tree"],
  ["235", "Lowest Common Ancestor of a Binary Search Tree"],
  ["102", "Binary Tree Level Order Traversal"],
  ["199", "Binary Tree Right Side View"],
  ["1448", "Count Good Nodes in Binary Tree"],
  ["98", "Validate Binary Search Tree"],
  ["230", "Kth Smallest Element in a BST"],
  ["105", "Construct Binary Tree from Preorder and Inorder Traversal"],
  ["124", "Binary Tree Maximum Path Sum"],
  ["297", "Serialize and Deserialize Binary Tree"],
  ["703", "Kth Largest Element in a Stream"],
  ["1046", "Last Stone Weight"],
  ["973", "K Closest Points to Origin"],
  ["215", "Kth Largest Element in an Array"],
  ["621", "Task Scheduler"],
  ["355", "Design Twitter"],
  ["295", "Find Median from Data Stream"],
  ["78", "Subsets"],
  ["39", "Combination Sum"],
  ["40", "Combination Sum II"],
  ["46", "Permutations"],
  ["90", "Subsets II"],
  ["22", "Generate Parentheses"],
  ["79", "Word Search"],
  ["131", "Palindrome Partitioning"],
  ["17", "Letter Combinations of a Phone Number"],
  ["51", "N-Queens"],
  ["208", "Implement Trie (Prefix Tree)"],
  ["211", "Design Add and Search Words Data Structure"],
  ["212", "Word Search II"],
  ["200", "Number of Islands"],
  ["695", "Max Area of Island"],
  ["133", "Clone Graph"],
  ["286", "Walls and Gates"],
  ["994", "Rotting Oranges"],
  ["417", "Pacific Atlantic Water Flow"],
  ["130", "Surrounded Regions"],
  ["207", "Course Schedule"],
  ["210", "Course Schedule II"],
  ["261", "Graph Valid Tree"],
  ["323", "Number of Connected Components in an Undirected Graph"],
  ["684", "Redundant Connection"],
  ["127", "Word Ladder"],
  ["743", "Network Delay Time"],
  ["332", "Reconstruct Itinerary"],
  ["1584", "Min Cost to Connect All Points"],
  ["778", "Swim in Rising Water"],
  ["269", "Alien Dictionary"],
  ["787", "Cheapest Flights Within K Stops"],
  ["70", "Climbing Stairs"],
  ["746", "Min Cost Climbing Stairs"],
  ["198", "House Robber"],
  ["213", "House Robber II"],
  ["5", "Longest Palindromic Substring"],
  ["647", "Palindromic Substrings"],
  ["91", "Decode Ways"],
  ["322", "Coin Change"],
  ["152", "Maximum Product Subarray"],
  ["139", "Word Break"],
  ["300", "Longest Increasing Subsequence"],
  ["416", "Partition Equal Subset Sum"],
  ["62", "Unique Paths"],
  ["1143", "Longest Common Subsequence"],
  ["309", "Best Time to Buy and Sell Stock with Cooldown"],
  ["518", "Coin Change II"],
  ["494", "Target Sum"],
  ["97", "Interleaving String"],
  ["329", "Longest Increasing Path in a Matrix"],
  ["115", "Distinct Subsequences"],
  ["72", "Edit Distance"],
  ["312", "Burst Balloons"],
  ["10", "Regular Expression Matching"],
  ["53", "Maximum Subarray"],
  ["55", "Jump Game"],
  ["45", "Jump Game II"],
  ["134", "Gas Station"],
  ["846", "Hand of Straights"],
  ["1899", "Merge Triplets to Form Target Triplet"],
  ["763", "Partition Labels"],
  ["678", "Valid Parenthesis String"],
  ["57", "Insert Interval"],
  ["56", "Merge Intervals"],
  ["435", "Non-overlapping Intervals"],
  ["252", "Meeting Rooms"],
  ["253", "Meeting Rooms II"],
  ["1851", "Minimum Interval to Include Each Query"],
  ["48", "Rotate Image"],
  ["54", "Spiral Matrix"],
  ["73", "Set Matrix Zeroes"],
  ["202", "Happy Number"],
  ["66", "Plus One"],
  ["50", "Pow(x, n)"],
  ["43", "Multiply Strings"],
  ["2013", "Detect Squares"],
  ["136", "Single Number"],
  ["191", "Number of 1 Bits"],
  ["338", "Counting Bits"],
  ["190", "Reverse Bits"],
  ["268", "Missing Number"],
  ["371", "Sum of Two Integers"],
  ["7", "Reverse Integer"],
];

const BLIND75_PROBLEMS = BLIND75_NUMBERS.map((num) =>
  IMPLEMENTED_BY_NUMBER.get(num),
).filter(Boolean);

const NEETCODE150_PROBLEMS = NEETCODE150_ENTRIES.map(([number, title]) => {
  const implemented = IMPLEMENTED_BY_NUMBER.get(number);
  if (implemented) return implemented;
  return {
    id: `neetcode150-${number}`,
    number,
    title,
    slug: title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    description:
      "Part of NeetCode 150. Visualizer not yet implemented in this app.",
    difficulty: "Medium",
    tags: ["NeetCode150"],
    accent: "#64748b",
    component: null,
    implemented: false,
  };
});

function buildCatalogProblems(catalogProblems) {
  return mergeCatalog(catalogProblems, ALL_PROBLEMS.filter(problem => problem.implemented));
}

/* ── Error Boundary ──────────────────────────────────────────────────── */

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Visualizer error:", error, info);
    trackEvent("app_error", { error_type: "render" });
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            gap: 16,
            padding: 32,
            color: "#94a3b8",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32 }}>⚠️</div>
          <h2 style={{ color: "#f87171", margin: 0 }}>Visualizer Error</h2>
          <p style={{ margin: 0, maxWidth: 480, fontSize: 14 }}>
            {this.state.error.message ||
              "An unexpected error occurred in this visualizer."}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#1e293b",
              color: "#f8fafc",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function SettingsMenu({
  navigationTransitionsEnabled,
  onToggleNavigationTransitions,
}) {
  return (
    <details className="settings-menu">
      <summary className="settings-summary" aria-label="Open settings">
        <span className="settings-summary-icon">⚙</span>
        <span>Settings</span>
      </summary>
      <div className="settings-panel">
        <div className="settings-panel-title">Navigation</div>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={navigationTransitionsEnabled}
            onChange={(event) =>
              onToggleNavigationTransitions(event.target.checked)
            }
          />
          <span>
            <strong>Enable transitions</strong>
            <small>Animate page switches and problem card entrances.</small>
          </span>
        </label>
        <section
          className="settings-about"
          aria-labelledby="settings-about-title"
        >
          <h2 id="settings-about-title">About</h2>
          <strong>Visualizer Pro</strong>
          <p>
            Explore algorithms step by step with interactive inputs, code
            traces, and a workspace you can arrange. Start with a free Easy
            problem, then practice your own code in the playground.
          </p>
          <p>
            Use Help &amp; tutorial for a quick start and panel docking
            instructions.
          </p>
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <a href="https://visualizer.pro">visualizer.pro</a>
          </p>
          <div className="about-links">
            <a href="/privacy.html">Privacy Policy</a>
            <button type="button" className="about-link-button" onClick={openPrivacyPreferences}>Analytics preferences</button>
          </div>
          <p
            className="trademark-disclaimer"
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted, #71717a)",
              marginTop: "1rem",
            }}
          >
            LeetCode is a trademark of LeetCode LLC. This site is not affiliated
            with or endorsed by LeetCode.
          </p>
        </section>
      </div>
    </details>
  );
}

function ProblemPage({
  problem,
  problems,
  onSelect,
  pro,
  onBack,
  layoutWidth,
  onLayoutChange,
  enableTransitions,
  utilityControls,
}) {
  const Component = problem.component;
  const { publishStep, publishDescription } = useVisualizationContext();
  useEffect(() => {
    publishStep(null, problem.title);
    publishDescription(problem.description || null);
    return () => publishStep(null, "");
  }, [problem.title, problem.description, publishStep, publishDescription]);
  const Shell = enableTransitions ? motion.div : "div";
  const shellProps = enableTransitions
    ? {
      initial: { opacity: 0, x: 14 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -14 },
      // Stiffer spring and a shorter slide: AnimatePresence runs this on every
      // problem navigation, where the old 50px/320-stiffness travel was slow
      // enough to feel like the page was still loading.
      transition: { type: "spring", stiffness: 520, damping: 38 },
    }
    : {};
  return (
    <Shell className="problem-page" {...shellProps}>
      <header className="problem-header">
        <button className="back-btn" onClick={onBack}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Problems
        </button>
        <div className="problem-title-group">
          <span className="problem-num">#{problem.number}</span>
          <h1 className="problem-title">{problem.title}</h1>
          <span
            className={`difficulty badge difficulty-${problem.difficulty.toLowerCase()}`}
          >
            {problem.difficulty}
          </span>
        </div>
        <ViewMenu layoutWidth={layoutWidth} onLayoutChange={onLayoutChange} />
        <div className="problem-utilities">{utilityControls}</div>
      </header>
      <ProblemNavigation
        problem={problem}
        problems={problems}
        pro={pro}
        onSelect={onSelect}
      />
      <div className="problem-content" data-visualizer-root>
        <ErrorBoundary key={problem.id}>
          {Component ? (
            <Suspense
              fallback={
                <div style={{ padding: 20, color: "#94a3b8" }}>
                  Loading visualizer…
                </div>
              }
            >
              <Component problem={problem} />
            </Suspense>
          ) : (
            <ProblemScaffold problem={problem} />
          )}
        </ErrorBoundary>
      </div>
    </Shell>
  );
}

function ChatAssistant() {
  const {
    openChat,
    disableSelectMode,
    isOpen,
    selectMode,
    attachContext,
  } = useChatContext();
  const [chatLoaded, setChatLoaded] = useState(false);
  // Keep the drawer mounted after first use to preserve drafts and active streams.
  if (isOpen && !chatLoaded) setChatLoaded(true);

  useEffect(() => {
    if (!selectMode) return undefined;
    const onSelect = (event) => {
      const selection = resolveVisualSelection(event.target);
      if (!selection) return;
      event.preventDefault();
      event.stopPropagation();
      attachContext(selection.label, selection.data);
      disableSelectMode();
      openChat();
    };
    document.addEventListener("click", onSelect, true);
    return () => document.removeEventListener("click", onSelect, true);
  }, [selectMode, attachContext, disableSelectMode, openChat]);

  return (
    <>
      {(!isOpen || selectMode) && createPortal(
        <button
          type="button"
          className={`chat-launcher ${selectMode ? "selecting" : ""}`}
          onClick={
            selectMode
              ? disableSelectMode
              : openChat
          }
          title={
            selectMode
              ? "Exit select mode (Esc)"
              : "Open algorithm assistant"
          }
        >
          {selectMode ? "Exit select mode · Esc" : "Ask AI"}
        </button>, document.body
      )}
      {chatLoaded && (
        <Suspense fallback={<div role="status">Loading assistant…</div>}>
          <ChatDrawer />
        </Suspense>
      )}
    </>
  );
}

function HomePage({
  onTutorial,
  pro,
  track,
  onTrackChange,
  onSelect,
  onOpenPlayground,
  enableTransitions,
}) {
  const [catalogProblems, setCatalogProblems] = useState([]);
  const [catalogError, setCatalogError] = useState("");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [status, setStatus] = useState("All");
  const [activeTag, setActiveTag] = useState("All");

  // Keep the scroll container mounted while resetting track-specific filters.
  const changeTrack = (nextTrack) => {
    if (nextTrack === track) return;
    setSearch("");
    setDifficulty("All");
    setStatus("All");
    setActiveTag("All");
    onTrackChange(nextTrack);
  };

  const isLeetCodeTrack = track === TRACKS.LEETCODE;
  const isCodeforcesTrack = track === TRACKS.CODEFORCES;
  const isBlind75Track = track === TRACKS.BLIND75;
  const isNeetCode150Track = track === TRACKS.NEETCODE150;

  useEffect(() => {
    if (!isLeetCodeTrack) return;

    let cancelled = false;

    loadLeetCodeCatalog()
      .then((payload) => {
        if (cancelled) return;
        const nextCatalogProblems = Array.isArray(payload?.problems)
          ? payload.problems
          : [];
        setCatalogProblems(nextCatalogProblems);
        setCatalogError("");
      })
      .catch((error) => {
        if (cancelled) return;
        setCatalogError(error.message || "Failed to load LeetCode catalog");
      });

    return () => {
      cancelled = true;
    };
  }, [isLeetCodeTrack]);

  const allProblems = useMemo(() => {
    if (isLeetCodeTrack) return buildCatalogProblems(catalogProblems);
    if (isCodeforcesTrack) return CODEFORCES_PROBLEMS;
    if (isBlind75Track) return BLIND75_PROBLEMS;
    if (isNeetCode150Track) return NEETCODE150_PROBLEMS;
    return BASICS_PROBLEMS;
  }, [
    catalogProblems,
    isCodeforcesTrack,
    isLeetCodeTrack,
    isBlind75Track,
    isNeetCode150Track,
  ]);

  const allTags = useMemo(() => {
    return Array.from(
      new Set(allProblems.flatMap((problem) => problem.tags || [])),
    ).sort();
  }, [allProblems]);

  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim().toLowerCase();

  const filtered = allProblems.filter((problem) => {
    if (difficulty !== "All" && problem.difficulty !== difficulty) return false;
    if (status === "Implemented" && !problem.implemented) return false;
    if (status === "Catalog Only" && problem.implemented) return false;
    if (activeTag !== "All" && !(problem.tags || []).includes(activeTag))
      return false;
    if (!normalizedSearch) return true;

    const haystack =
      `${problem.number} ${problem.title} ${problem.slug} ${(problem.tags || []).join(" ")}`.toLowerCase();
    return haystack.includes(normalizedSearch);
  });

  const Shell = enableTransitions ? motion.div : "div";
  const shellProps = enableTransitions
    ? {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      // Explicit short fade — the default (~0.3s) stacked in front of the card
      // stagger and made the list feel like it was loading slowly.
      transition: { duration: 0.14 },
    }
    : {};
  const Brand = enableTransitions ? motion.div : "div";

  return (
    <Shell className="home-page" {...shellProps}>
      <section className="home-create-hero" aria-label="Create a visualizer">
        <CreateVisualizerButton onClick={onOpenPlayground} />
      </section>
      <WelcomeHero
        onTutorial={onTutorial}
        onPlayground={onOpenPlayground}
        onStart={() =>
          onSelect(
            ALL_PROBLEMS.find(
              (p) => String(p.number) === "1" && !p.tags.includes("Codeforces"),
            ),
          )
        }
      />
      <header className="home-header">
        <h2 className="home-catalog-heading">Try any LeetCode problem</h2>
        <div className="home-header-row">
          <Brand
            className="brand"
            {...(enableTransitions
              ? {
                initial: { y: -18, opacity: 0 },
                animate: { y: 0, opacity: 1 },
                // No delay: the brand is above the fold, so holding it back just
                // reads as lag.
                transition: { type: "spring", stiffness: 460, damping: 30 },
              }
              : {})}
          >
            <img className="brand-icon" src="/visualizer-icon.png" alt="" width="36" height="36" />
            <div>
              <h2>Explore the problem library</h2>
              <p>
                {isLeetCodeTrack
                  ? "LeetCode and interview patterns"
                  : isCodeforcesTrack
                    ? "Codeforces competitive programming problems"
                    : isBlind75Track
                      ? "The classic 75-problem interview prep list"
                      : isNeetCode150Track
                        ? "NeetCode's 150-problem interview roadmap"
                        : "Core programming basics and loop patterns"}
              </p>
            </div>
          </Brand>

          <div
            className="track-switcher"
            role="tablist"
            aria-label="Problem tracks"
          >
            <button
              className={`track-btn ${track === TRACKS.BLIND75 ? "active" : ""}`}
              onClick={() => changeTrack(TRACKS.BLIND75)}
            >
              Blind 75
            </button>
            <button
              className={`track-btn ${track === TRACKS.NEETCODE150 ? "active" : ""}`}
              onClick={() => changeTrack(TRACKS.NEETCODE150)}
            >
              NeetCode 150
            </button>
            <button
              className={`track-btn ${track === TRACKS.LEETCODE ? "active" : ""}`}
              onClick={() => changeTrack(TRACKS.LEETCODE)}
            >
              LeetCode Track
            </button>
            <button
              className={`track-btn ${track === TRACKS.BASICS ? "active" : ""}`}
              onClick={() => changeTrack(TRACKS.BASICS)}
            >
              Basics Track
            </button>
            {/* <button
              className={`track-btn ${track === TRACKS.CODEFORCES ? "active" : ""}`}
              onClick={() => changeTrack(TRACKS.CODEFORCES)}
            >
              Codeforces Track
            </button> */}
          </div>

          <CreateVisualizerButton onClick={onOpenPlayground} />



        </div>

        <div className="catalog-meta">
          <span>
            {isLeetCodeTrack
              ? `Total catalog: ${allProblems.length}`
              : isCodeforcesTrack
                ? `Codeforces problems: ${allProblems.length}`
                : isBlind75Track
                  ? `Blind 75 problems: ${allProblems.length}`
                  : isNeetCode150Track
                    ? `NeetCode 150 problems: ${allProblems.length}`
                    : `Basics topics: ${allProblems.length}`}
          </span>
          <span>
            Implemented:{" "}
            {allProblems.filter((problem) => problem.implemented).length}
          </span>
          <span>Visible: {filtered.length}</span>
          {isLeetCodeTrack && catalogError ? (
            <span>Catalog error: {catalogError}</span>
          ) : null}
        </div>

        <div className="filters-row">
          <input
            className="search-input"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            placeholder="Search by number, title, slug, or tag"
          />

          <label className="filter-field">
            <span className="filter-label">Difficulty</span>
            <select
              className="filter-select"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
            >
              <option value="All">Any difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </label>

          {isLeetCodeTrack || isNeetCode150Track ? (
            <label className="filter-field">
              <span className="filter-label">Implementation</span>
              <select
                className="filter-select"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="All">All problems</option>
                <option value="Implemented">Visualized</option>
                <option value="Catalog Only">Catalogue only</option>
              </select>
            </label>
          ) : (
            <div className="track-note">
              {isCodeforcesTrack
                ? "Codeforces track focuses on advanced contest strategies and data structures."
                : isBlind75Track
                  ? "Blind 75 is fully implemented in this app."
                  : "Basics track includes foundational loop visualizations."}
            </div>
          )}
        </div>

        <div className="tag-row">
          <button
            className={`tag-filter ${activeTag === "All" ? "active" : ""}`}
            onClick={() => setActiveTag("All")}
          >
            All
          </button>
          {allTags.slice(0, 24).map((tag) => (
            <button
              key={tag}
              className={`tag-filter ${activeTag === tag ? "active" : ""}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </header>

      <VirtualCardGrid items={filtered} pro={pro} onSelect={onSelect} />
    </Shell>
  );
}

/* ── Root App ────────────────────────────────────────────────────────── */
export default function App() {
  const access = useAccess();
  const [navCatalog, setNavCatalog] = useState([]);

  useEffect(() => {
    let cancelled = false;
    loadLeetCodeCatalog()
      .then((payload) => {
        if (cancelled) return;
        setNavCatalog(Array.isArray(payload?.problems) ? payload.problems : []);
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, []);

  const navProblems = useMemo(
    () =>
      navCatalog.length
        ? mergeCatalog(
          navCatalog,
          ALL_PROBLEMS.filter((problem) => problem.implemented),
        )
        : ALL_PROBLEMS,
    [navCatalog],
  );
  const [dialog, setDialog] = useState(null);
  // Pricing opens on each visit; closing it is enough.
  useEffect(() => {
    if (!BETA_FREE_ACCESS) setDialog("plans");
  }, []);
  const [tourStep, setTourStep] = useState(null);
  const [lockedTitle, setLockedTitle] = useState("");
  const [active, setActive] = useState(
    () =>
      ALL_PROBLEMS.find((p) => `#${p.slug}` === window.location.hash) || null,
  );
  const [showPlayground, setShowPlayground] = useState(() => {
    try {
      return window.location.hash === "#playground";
    } catch {
      return false;
    }
  });
  const [track, setTrack] = useState(TRACKS.LEETCODE);
  const [showPrerequisites, setShowPrerequisites] = useState(() => window.location.hash === '#prerequisites');
  useEffect(() => {
    const path = showPrerequisites ? '/prerequisites' : showPlayground ? '/playground' : active ? `/problems/${active.slug}` : '/';
    const title = showPrerequisites ? 'Learning prerequisites' : showPlayground ? 'Code playground' : active ? `${active.number || ''} ${active.title}`.trim() : 'Algorithm catalogue';
    trackPage({ path, title: `${title} | Visualizer Pro`, problem_id: active && !showPlayground && !showPrerequisites ? String(active.number || active.slug) : undefined });
  }, [active, showPlayground, showPrerequisites]);
  const feedbackContext = showPrerequisites
    ? "Prerequisites page"
    : showPlayground
      ? "Playground"
      : active
        ? `Problem ${active.number || ""}: ${active.title}`.replace("Problem :", "Problem")
        : "Home page";
  const [layoutWidth, setLayoutWidth] = useState("full");
  const [navigationTransitionsEnabled, setNavigationTransitionsEnabled] =
    useState(() => {
      try {
        const stored = window.localStorage.getItem(
          "cpviz.navigationTransitions",
        );
        return stored === null ? true : stored !== "0";
      } catch {
        return true;
      }
    });
  useEffect(() => {
    try {
      window.localStorage.setItem(
        "cpviz.navigationTransitions",
        navigationTransitionsEnabled ? "1" : "0",
      );
    } catch (error) {
      void error;
    }
  }, [navigationTransitionsEnabled]);

  useEffect(() => {
    const onPop = () => {
      setActive(
        ALL_PROBLEMS.find((p) => `#${p.slug}` === window.location.hash) || null,
      );
      setShowPlayground(window.location.hash === "#playground");
      setShowPrerequisites(window.location.hash === '#prerequisites');
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("hashchange", onPop);
    };
  }, []);

  const goBack = () => {
    window.history.pushState({}, "", window.location.pathname + window.location.search);
    setActive(null);
    setShowPlayground(false);
    setShowPrerequisites(false);
  };

  const openPrerequisites = () => setShowPrerequisites(true);
  const closePrerequisites = () => {
    setShowPrerequisites(false);
    if (window.location.hash === '#prerequisites') window.history.replaceState({}, '', window.location.pathname + window.location.search);
  };

  const openPlayground = () => {
    setShowPrerequisites(false);
    window.history.pushState({ view: "playground" }, "", "#playground");
    setActive(null);
    setShowPlayground(true);
  };

  const selectProblem = (problem) => {
    if (!BETA_FREE_ACCESS && !isFreeProblem(problem) && !access.pro) {
      setLockedTitle(problem.title);
      setDialog("plans");
      return;
    }
    window.history.pushState({ slug: problem.slug }, "", `#${problem.slug}`);
    setShowPrerequisites(false);
    setShowPlayground(false);
    setActive(problem);
  };

  const handleTrackChange = (nextTrack) => {
    setShowPrerequisites(false);
    setTrack(nextTrack);
    setActive(null);
    setShowPlayground(false);
  };

  const navigateTour = (index) => {
    setDialog(null);
    setTourStep(index);
    const page = TUTORIAL_STEPS[index].page;
    if (page === 'home') { setTrack(TRACKS.LEETCODE); goBack(); }
    else if (page === 'prerequisites') openPrerequisites();
    else if (page === 'playground') openPlayground();
    else if (String(active?.number) !== '1') {
      const problem = ALL_PROBLEMS.find(p => String(p.number) === '1' && !p.tags?.includes('Codeforces'));
      if (problem) selectProblem(problem);
    }
  };

  const renderUtilityControls = ({ settings = true } = {}) => (
    <>
      <button
        className="access-toolbar-btn"
        onClick={() => navigateTour(0)}
      >
        Help & tutorial
      </button>
      <button
        className="access-toolbar-btn pro"
        onClick={() => {
          setLockedTitle("");
          setDialog("plans");
        }}
      >
        {BETA_FREE_ACCESS ? "Free beta · Pro access" : access.debugPro
          ? "Pro · DEV"
          : access.pro
            ? (access.account?.trialActive ? "Free trial · Pro" : "Pro account")
            : `Get Pro · ${PLANS.monthly.display}/month`}
      </button>
      {access.user ? (
        <details className="account-menu">
          <summary className="access-toolbar-btn account-avatar-btn" aria-label={`Account: ${access.user.displayName || access.user.email || "signed in"}`}>
            <span className="account-initial" aria-hidden="true">
              {String(access.user.displayName || access.user.email || "?").trim().charAt(0).toUpperCase() || "?"}
            </span>
          </summary>
          <div className="account-menu-popover">
            <p className="account-menu-name">{access.user.displayName || "Signed in"}</p>
            {access.user.email && <p className="account-menu-email">{access.user.email}</p>}
            <button type="button" onClick={access.logout} disabled={access.busy}>Sign out</button>
          </div>
        </details>
      ) : (
        <button
          className="access-toolbar-btn"
          disabled={access.busy}
          onClick={() => setDialog("account")}
        >
          Sign in
        </button>
      )}
      <ThemeToggle />
      {settings && (
        <SettingsMenu
          navigationTransitionsEnabled={navigationTransitionsEnabled}
          onToggleNavigationTransitions={setNavigationTransitionsEnabled}
        />
      )}
    </>
  );
  const utilityControls = renderUtilityControls();

  const pageContent = showPlayground ? (
    <div
      key="playground-page"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <div className="access-actions">
        <button className="access-toolbar-btn" onClick={goBack}>
          ← Problems
        </button>
        {utilityControls}
      </div>
      <PlaygroundGate
        key={access.user?.uid || "guest"}
        access={access}
        onPlans={() => setDialog("plans")}
      >
        <Suspense
          key="runtime-playground-boundary"
          fallback={
            <div className="playground-loading">
              Loading Visualizer Playground…
            </div>
          }
        >
          <RuntimePlayground
            key="runtime-playground"
            onBack={goBack}
            layoutWidth={layoutWidth}
            onLayoutChange={setLayoutWidth}
          />
        </Suspense>
      </PlaygroundGate>
    </div>
  ) : active && !isFreeProblem(active) && !access.pro ? (
    <div key="locked-problem" className="access-gate">
      {BETA_FREE_ACCESS ? <BetaSignIn access={access} title={active.title} /> : <>
        <h2>{active.title} · Pro</h2>
        <p>Sign in with a Pro account to open this visualizer.</p>
        <button onClick={() => setDialog("plans")}>View plans</button>
      </>}
      <button onClick={goBack}>Back to problems</button>
    </div>
  ) : active ? (
    <ProblemPage
      key={active.id}
      problem={active}
      problems={navProblems}
      onSelect={selectProblem}
      pro={access.pro}
      onBack={goBack}
      layoutWidth={layoutWidth}
      onLayoutChange={setLayoutWidth}
      enableTransitions={navigationTransitionsEnabled}
      utilityControls={renderUtilityControls({ settings: false })}
    />
  ) : (
    <HomePage
      key="home"
      onTutorial={() => navigateTour(0)}
      pro={access.pro}
      track={track}
      onTrackChange={handleTrackChange}
      onSelect={selectProblem}
      onOpenPlayground={openPlayground}
      layoutWidth={layoutWidth}
      onLayoutChange={setLayoutWidth}
      enableTransitions={navigationTransitionsEnabled}
    />
  );

  return (
    <ThemeProvider>
      <ZoomProvider>
        {showPlayground && <div className="playground-view-menu"><ViewMenu layoutWidth={layoutWidth} onLayoutChange={setLayoutWidth} /></div>}
        <PrerequisiteDrawer open={showPrerequisites} onOpen={openPrerequisites} onClose={closePrerequisites} onSelect={selectProblem} pro={access.pro} />
        <div className={`app layout-${layoutWidth}`}>
          <PrivacyPreferences />
          {!active && !showPlayground && !showPrerequisites && (
            <nav
              className="app-toolbar marketing-nav"
              aria-label="Main navigation"
            >
              <a
                className="marketing-brand"
                href="#"
                aria-label="home"
              >
                <small>VISUALIZER Pro</small>
              </a>
              <div className="marketing-nav-actions">
                <ViewMenu layoutWidth={layoutWidth} onLayoutChange={setLayoutWidth} />
                <button className="access-toolbar-btn" onClick={openPlayground}>
                  Playground ↗
                </button>
                {utilityControls}
              </div>
            </nav>
          )}
          {/* A flex column (not overflow:auto) so children get a definite height to
            resolve `height: 100%` against — an auto-overflow box lets children
            grow and scroll instead of constraining them, which left every
            visualizer shell unable to fill. Pages that need to scroll (home,
            .problem-content) own their own overflow. */}
          <div
            id="zoom-content-wrapper"
            style={{
              flex: "1 1 0",
              minHeight: 0,
              marginTop: "0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {navigationTransitionsEnabled ? (
              <AnimatePresence mode="wait">{pageContent}</AnimatePresence>
            ) : (
              pageContent
            )}
          </div>
          {dialog && (
            <AccessDialog
              glass={dialog === "account" && !access.user && BETA_FREE_ACCESS}
              title={
                dialog === "account"
                  ? "Your Visualizer Pro account"
                  : "Unlock Visualizer Pro"
              }
              onClose={() => setDialog(null)}
            >
              {dialog === "account" ? (
                <>
                  {access.user ? (
                    <>
                      <p>
                        {access.user.displayName} · {access.user.email}
                      </p>
                      <p>
                        {BETA_FREE_ACCESS ? "Free beta · All features unlocked" : access.debugPro
                          ? "Pro enabled locally for development"
                          : access.pro && access.account?.expiresAt
                            ? `${access.account.trialActive ? 'Free trial' : 'Pro'} active until ${new Date(
                              access.account.expiresAt,
                            ).toLocaleString()}`
                            : access.pro
                              ? "Pro account"
                              : "Free account"}
                      </p>
                      <button onClick={access.logout}>Sign out</button>
                      {!BETA_FREE_ACCESS && <button onClick={access.refresh}>Refresh access</button>}
                    </>
                  ) : (
                    <>
                      {BETA_FREE_ACCESS ? <BetaSignIn access={access} /> : <>
                        <p>Use Google to access the Pro subscription linked to your account.</p>
                        <GoogleSignIn access={access} />
                      </>}
                    </>
                  )}
                  <p role="alert">{access.error}</p>
                </>
              ) : (
                <Plans
                  access={access}
                  reason={
                    lockedTitle
                      ? `${lockedTitle} is included in Pro. Unlock it and every other implemented visualizer.`
                      : ""
                  }
                />
              )}
            </AccessDialog>
          )}
          {tourStep !== null && <LiveTutorial step={tourStep} onStep={navigateTour} onClose={() => setTourStep(null)} />}
          {TrailerStudio && new URLSearchParams(window.location.search).has('trailer') && <Suspense fallback={null}>
            <TrailerStudio canRecord={access.pro && Boolean(access.user)} onNavigate={page => {
              setTourStep(null);
              setDialog(null);
              if (page === 'home') { setTrack(TRACKS.LEETCODE); goBack(); }
              else if (page === 'prerequisites') openPrerequisites();
              else if (page === 'playground') openPlayground();
              else {
                const problem = ALL_PROBLEMS.find(p => String(p.number) === page && !p.tags?.includes('Codeforces'));
                if (!problem) throw new Error(`Problem ${page} is not available.`);
                if (String(active?.number) !== page) selectProblem(problem);
              }
            }} />
          </Suspense>}
          {feedbackContext !== "Home page" && (
            <FeedbackWidget user={access.user} context={feedbackContext} onSignIn={() => setDialog("account")} />
          )}
          <ChatAssistant />
        </div>
      </ZoomProvider>
    </ThemeProvider>
  );
}
