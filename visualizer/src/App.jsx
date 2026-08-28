import React, {
  useEffect,
  useMemo,
  useState,
  Component,
  Suspense,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

import ProblemScaffold from "./components/panels/ProblemScaffold";
import ProblemInfoPanel from "./components/ProblemInfoPanel";
import ZoomControls from "./components/ZoomControls";
import { ZoomProvider } from "./context/ZoomContext";
import ThemeToggle from "./components/ThemeToggle";
import { ThemeProvider } from "./context/ThemeContext";
import { useVisualizationContext } from "./context/VisualizationContext";
import { useChatContext } from "./context/ChatContext";
import { ChatDrawer } from "./components/Chatbot";
import "./App.css";
import { TRACKS } from "./data/implementedProblems";

const RuntimePlayground = React.lazy(
  () => import("./playground/RuntimePlayground"),
);

/* ── Auto-discovery ──────────────────────────────────────────────────── */

// Metadata lives in a lightweight meta.js (eagerly bundled), while the heavy
// visualizer is dynamically imported via index.jsx so each one code-splits.
const metaModules = import.meta.glob("./problems/*/meta.js", { eager: true });
const lazyModules = import.meta.glob("./problems/*/index.jsx");

const ALL_PROBLEMS = Object.entries(metaModules)
  .map(([path, mod]) => {
    const meta = mod?.meta;
    if (!meta?.number || !meta?.title) return null;
    const loader = lazyModules[path.replace(/\/meta\.js$/, "/index.jsx")];
    return {
      id: `prob-${meta.slug || meta.number}`,
      number: meta.number,
      title: meta.title,
      slug: meta.slug || meta.title.toLowerCase().replace(/\s+/g, "-"),
      description: meta.description || "",
      difficulty: meta.difficulty || "Medium",
      tags: meta.tags || [],
      accent: meta.accent || "#64748b",
      component: loader ? React.lazy(() => loader()) : null,
      implemented: !!loader,
    };
  })
  .filter(Boolean);

const IMPLEMENTED_BY_NUMBER = new Map(
  ALL_PROBLEMS.map((p) => [p.number, p]),
);

const BASICS_PROBLEMS = ALL_PROBLEMS.filter((p) =>
  (p.tags || []).includes("Basics"),
);

const CODEFORCES_PROBLEMS = ALL_PROBLEMS.filter((p) =>
  (p.tags || []).includes("Codeforces"),
);

// Curated by LeetCode problem number rather than a meta.js tag, since these
// are fixed external lists (Blind 75 / NeetCode 150), not something to
// remember to tag on every new problem.
const BLIND75_NUMBERS = [
  "1", "121", "217", "238", "53", "152", "153", "33", "15", "11", "371",
  "191", "338", "268", "190", "70", "322", "300", "1143", "139", "39",
  "198", "213", "91", "62", "55", "133", "207", "417", "200", "128",
  "269", "261", "323", "57", "56", "435", "252", "253", "206", "141",
  "21", "23", "19", "143", "73", "54", "48", "79", "3", "424", "76",
  "242", "49", "20", "125", "5", "647", "271", "104", "100", "226",
  "124", "102", "297", "572", "105", "98", "230", "235", "208", "211",
  "212", "347", "295",
];

const NEETCODE150_ENTRIES = [
  ["217", "Contains Duplicate"], ["242", "Valid Anagram"], ["1", "Two Sum"],
  ["49", "Group Anagrams"], ["347", "Top K Frequent Elements"],
  ["271", "Encode and Decode Strings"], ["238", "Product of Array Except Self"],
  ["36", "Valid Sudoku"], ["128", "Longest Consecutive Sequence"],
  ["125", "Valid Palindrome"], ["167", "Two Sum II - Input Array Is Sorted"],
  ["15", "3Sum"], ["11", "Container With Most Water"], ["42", "Trapping Rain Water"],
  ["121", "Best Time to Buy and Sell Stock"],
  ["3", "Longest Substring Without Repeating Characters"],
  ["424", "Longest Repeating Character Replacement"], ["567", "Permutation in String"],
  ["76", "Minimum Window Substring"], ["239", "Sliding Window Maximum"],
  ["20", "Valid Parentheses"], ["155", "Min Stack"],
  ["150", "Evaluate Reverse Polish Notation"], ["739", "Daily Temperatures"],
  ["853", "Car Fleet"], ["84", "Largest Rectangle in Histogram"],
  ["704", "Binary Search"], ["74", "Search a 2D Matrix"], ["875", "Koko Eating Bananas"],
  ["153", "Find Minimum in Rotated Sorted Array"], ["33", "Search in Rotated Sorted Array"],
  ["981", "Time Based Key-Value Store"], ["4", "Median of Two Sorted Arrays"],
  ["206", "Reverse Linked List"], ["21", "Merge Two Sorted Lists"],
  ["141", "Linked List Cycle"], ["143", "Reorder List"],
  ["19", "Remove Nth Node From End of List"], ["138", "Copy List with Random Pointer"],
  ["2", "Add Two Numbers"], ["287", "Find the Duplicate Number"], ["146", "LRU Cache"],
  ["23", "Merge k Sorted Lists"], ["25", "Reverse Nodes in k-Group"],
  ["226", "Invert Binary Tree"], ["104", "Maximum Depth of Binary Tree"],
  ["543", "Diameter of Binary Tree"], ["110", "Balanced Binary Tree"],
  ["100", "Same Tree"], ["572", "Subtree of Another Tree"],
  ["235", "Lowest Common Ancestor of a Binary Search Tree"],
  ["102", "Binary Tree Level Order Traversal"], ["199", "Binary Tree Right Side View"],
  ["1448", "Count Good Nodes in Binary Tree"], ["98", "Validate Binary Search Tree"],
  ["230", "Kth Smallest Element in a BST"],
  ["105", "Construct Binary Tree from Preorder and Inorder Traversal"],
  ["124", "Binary Tree Maximum Path Sum"], ["297", "Serialize and Deserialize Binary Tree"],
  ["703", "Kth Largest Element in a Stream"], ["1046", "Last Stone Weight"],
  ["973", "K Closest Points to Origin"], ["215", "Kth Largest Element in an Array"],
  ["621", "Task Scheduler"], ["355", "Design Twitter"],
  ["295", "Find Median from Data Stream"], ["78", "Subsets"], ["39", "Combination Sum"],
  ["40", "Combination Sum II"], ["46", "Permutations"], ["90", "Subsets II"],
  ["22", "Generate Parentheses"], ["79", "Word Search"], ["131", "Palindrome Partitioning"],
  ["17", "Letter Combinations of a Phone Number"], ["51", "N-Queens"],
  ["208", "Implement Trie (Prefix Tree)"],
  ["211", "Design Add and Search Words Data Structure"], ["212", "Word Search II"],
  ["200", "Number of Islands"], ["695", "Max Area of Island"], ["133", "Clone Graph"],
  ["286", "Walls and Gates"], ["994", "Rotting Oranges"],
  ["417", "Pacific Atlantic Water Flow"], ["130", "Surrounded Regions"],
  ["207", "Course Schedule"], ["210", "Course Schedule II"], ["261", "Graph Valid Tree"],
  ["323", "Number of Connected Components in an Undirected Graph"],
  ["684", "Redundant Connection"], ["127", "Word Ladder"], ["743", "Network Delay Time"],
  ["332", "Reconstruct Itinerary"], ["1584", "Min Cost to Connect All Points"],
  ["778", "Swim in Rising Water"], ["269", "Alien Dictionary"],
  ["787", "Cheapest Flights Within K Stops"], ["70", "Climbing Stairs"],
  ["746", "Min Cost Climbing Stairs"], ["198", "House Robber"], ["213", "House Robber II"],
  ["5", "Longest Palindromic Substring"], ["647", "Palindromic Substrings"],
  ["91", "Decode Ways"], ["322", "Coin Change"], ["152", "Maximum Product Subarray"],
  ["139", "Word Break"], ["300", "Longest Increasing Subsequence"],
  ["416", "Partition Equal Subset Sum"], ["62", "Unique Paths"],
  ["1143", "Longest Common Subsequence"],
  ["309", "Best Time to Buy and Sell Stock with Cooldown"], ["518", "Coin Change II"],
  ["494", "Target Sum"], ["97", "Interleaving String"],
  ["329", "Longest Increasing Path in a Matrix"], ["115", "Distinct Subsequences"],
  ["72", "Edit Distance"], ["312", "Burst Balloons"], ["10", "Regular Expression Matching"],
  ["53", "Maximum Subarray"], ["55", "Jump Game"], ["45", "Jump Game II"],
  ["134", "Gas Station"], ["846", "Hand of Straights"],
  ["1899", "Merge Triplets to Form Target Triplet"], ["763", "Partition Labels"],
  ["678", "Valid Parenthesis String"], ["57", "Insert Interval"], ["56", "Merge Intervals"],
  ["435", "Non-overlapping Intervals"], ["252", "Meeting Rooms"], ["253", "Meeting Rooms II"],
  ["1851", "Minimum Interval to Include Each Query"], ["48", "Rotate Image"],
  ["54", "Spiral Matrix"], ["73", "Set Matrix Zeroes"], ["202", "Happy Number"],
  ["66", "Plus One"], ["50", "Pow(x, n)"], ["43", "Multiply Strings"],
  ["2013", "Detect Squares"], ["136", "Single Number"], ["191", "Number of 1 Bits"],
  ["338", "Counting Bits"], ["190", "Reverse Bits"], ["268", "Missing Number"],
  ["371", "Sum of Two Integers"], ["7", "Reverse Integer"],
];

const BLIND75_PROBLEMS = BLIND75_NUMBERS
  .map((num) => IMPLEMENTED_BY_NUMBER.get(num))
  .filter(Boolean);

const NEETCODE150_PROBLEMS = NEETCODE150_ENTRIES.map(([number, title]) => {
  const implemented = IMPLEMENTED_BY_NUMBER.get(number);
  if (implemented) return implemented;
  return {
    id: `neetcode150-${number}`,
    number,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
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
  return catalogProblems.map((problem) => {
    const implemented = IMPLEMENTED_BY_NUMBER.get(problem.number);
    if (!implemented) {
      return {
        ...problem,
        accent: "#64748b",
        description:
          "Cataloged in explorer. Visualizer shell is ready; implementation can be plugged into reusable panels.",
        component: null,
        implemented: false,
      };
    }
    return { ...problem, ...implemented, implemented: true };
  });
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

function LayoutControls({ layoutWidth, onChange, compact = false }) {
  return (
    <div className={`layout-controls ${compact ? "compact" : ""}`}>
      <span className="layout-label">Layout</span>
      <div className="layout-pill">
        <button
          className={`layout-btn ${layoutWidth === "normal" ? "active" : ""}`}
          onClick={() => onChange("normal")}
        >
          Normal
        </button>
        <button
          className={`layout-btn ${layoutWidth === "wide" ? "active" : ""}`}
          onClick={() => onChange("wide")}
        >
          Wide
        </button>
        <button
          className={`layout-btn ${layoutWidth === "full" ? "active" : ""}`}
          onClick={() => onChange("full")}
        >
          Full
        </button>
      </div>
    </div>
  );
}

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
      </div>
    </details>
  );
}

function ProblemPage({
  problem,
  onBack,
  layoutWidth,
  onLayoutChange,
  enableTransitions,
  problemDescriptions,
  utilityControls,
}) {
  const Component = problem.component;
  const { publishStep, publishDescription } = useVisualizationContext();
  useEffect(() => {
    publishStep(null, problem.title);
    publishDescription(problem.description || null);
    return () => publishStep(null, '');
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
        </div>
        <span
          className={`difficulty badge difficulty-${problem.difficulty.toLowerCase()}`}
        >
          {problem.difficulty}
        </span>
        <LayoutControls
          layoutWidth={layoutWidth}
          onChange={onLayoutChange}
          compact
        />
        <div className="problem-utilities">{utilityControls}</div>
      </header>
      <ProblemInfoPanel
        slug={problem.slug}
        number={problem.number}
        descriptions={problemDescriptions}
      />
      <div className="problem-content">
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
  const { openChat, closeChat, isOpen, selectMode, toggleSelectMode, attachContext } = useChatContext();

  useEffect(() => {
    if (!selectMode) return undefined;
    const onSelect = (event) => {
      if (event.target.closest('[data-chat-ignore], button, input, textarea, select, a')) return;
      const element = event.target;
      if (!element || element.closest('.chat-drawer, .chat-launcher')) return;
      event.preventDefault();
      event.stopPropagation();
      const text = (element.innerText || element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 1200);
      const label = element.getAttribute('aria-label') || element.dataset.chatLabel || element.className || element.tagName;
      attachContext(`Selected: ${String(label).slice(0, 120)}`, {
        tag: element.tagName.toLowerCase(),
        text,
        id: element.id || undefined,
        classes: typeof element.className === 'string' ? element.className : undefined,
      });
      toggleSelectMode();
      document.body.classList.remove('chat-select-mode');
      openChat();
    };
    document.addEventListener('click', onSelect, true);
    return () => document.removeEventListener('click', onSelect, true);
  }, [selectMode, attachContext, toggleSelectMode, openChat]);

  return <>
    {!isOpen && <button type="button" className={`chat-launcher ${selectMode ? 'selecting' : ''}`} onClick={selectMode ? () => { toggleSelectMode(); document.body.classList.remove('chat-select-mode'); closeChat(); } : openChat} title={selectMode ? 'Exit selection and close chat' : 'Open algorithm assistant'}>
      {selectMode ? 'Select element…' : 'Ask AI'}
    </button>}
    <ChatDrawer />
  </>;
}

function HomePage({
  track,
  onTrackChange,
  onSelect,
  onOpenPlayground,
  layoutWidth,
  onLayoutChange,
  enableTransitions,
}) {
  const [catalogProblems, setCatalogProblems] = useState([]);
  const [catalogError, setCatalogError] = useState("");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [status, setStatus] = useState("Implemented");
  const [activeTag, setActiveTag] = useState("All");
  const [visibleCount, setVisibleCount] = useState(60);

  const isLeetCodeTrack = track === TRACKS.LEETCODE;
  const isCodeforcesTrack = track === TRACKS.CODEFORCES;
  const isBlind75Track = track === TRACKS.BLIND75;
  const isNeetCode150Track = track === TRACKS.NEETCODE150;

  useEffect(() => {
    if (!isLeetCodeTrack) return;

    let cancelled = false;

    fetch("/data/leetcodeCatalog.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Catalog load failed: ${response.status}`);
        }
        return response.json();
      })
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

  const normalizedSearch = search.trim().toLowerCase();

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

  const visible = filtered.slice(0, visibleCount);
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
      <header className="home-header">
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
            <div className="brand-icon">⟨/⟩</div>
            <div>
              <h1>CP Visualizer</h1>
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
              onClick={() => onTrackChange(TRACKS.BLIND75)}
            >
              Blind 75
            </button>
            <button
              className={`track-btn ${track === TRACKS.NEETCODE150 ? "active" : ""}`}
              onClick={() => onTrackChange(TRACKS.NEETCODE150)}
            >
              NeetCode 150
            </button>
            <button
              className={`track-btn ${track === TRACKS.LEETCODE ? "active" : ""}`}
              onClick={() => onTrackChange(TRACKS.LEETCODE)}
            >
              LeetCode Track
            </button>
            <button
              className={`track-btn ${track === TRACKS.BASICS ? "active" : ""}`}
              onClick={() => onTrackChange(TRACKS.BASICS)}
            >
              Basics Track
            </button>
            <button
              className={`track-btn ${track === TRACKS.CODEFORCES ? "active" : ""}`}
              onClick={() => onTrackChange(TRACKS.CODEFORCES)}
            >
              Codeforces Track
            </button>
          </div>

          <button
            type="button"
            className="playground-launch-btn"
            onClick={onOpenPlayground}
          >
            <span aria-hidden="true">{`{ }`}</span>
            Create Visualizer
          </button>

          <LayoutControls layoutWidth={layoutWidth} onChange={onLayoutChange} />
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
              setVisibleCount(60);
            }}
            placeholder="Search by number, title, slug, or tag"
          />

          <select
            className="filter-select"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
          >
            <option>All</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          {isLeetCodeTrack || isNeetCode150Track ? (
            <select
              className="filter-select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option>All</option>
              <option>Implemented</option>
              <option>Catalog Only</option>
            </select>
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

      <main className="cards-grid">
        {visible.map((p, i) =>
          enableTransitions ? (
            <motion.button
              key={p.id}
              className="problem-card"
              style={{ "--accent": p.accent }}
              onClick={() => onSelect(p)}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                // Stagger is capped: with 60 visible cards an uncapped
                // `i * 0.07` delayed the last card by ~4.3s, so the grid looked
                // broken rather than animated. 25ms steps that stop at 0.3s keep
                // the cascade visible while finishing quickly.
                delay: Math.min(0.3, i * 0.025),
                type: "spring",
                stiffness: 420,
                damping: 32,
              }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="card-top">
                <span
                  className={`badge difficulty-${p.difficulty.toLowerCase()}`}
                >
                  {p.difficulty}
                </span>
                <span className="card-num">#{p.number}</span>
              </div>
              <h2 className="card-title">{p.title}</h2>
              <p className="card-desc">{p.description}</p>
              <div className="card-footer">
                <div className="card-tags">
                  {p.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                <span className="card-arrow">{p.implemented ? "→" : "⋯"}</span>
              </div>
            </motion.button>
          ) : (
            <button
              key={p.id}
              className="problem-card"
              style={{ "--accent": p.accent }}
              onClick={() => onSelect(p)}
            >
              <div className="card-top">
                <span
                  className={`badge difficulty-${p.difficulty.toLowerCase()}`}
                >
                  {p.difficulty}
                </span>
                <span className="card-num">#{p.number}</span>
              </div>
              <h2 className="card-title">{p.title}</h2>
              <p className="card-desc">{p.description}</p>
              <div className="card-footer">
                <div className="card-tags">
                  {p.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                <span className="card-arrow">{p.implemented ? "→" : "⋯"}</span>
              </div>
            </button>
          ),
        )}
      </main>

      {visibleCount < filtered.length && (
        <div className="load-more-wrap">
          <button
            className="load-more-btn"
            onClick={() => setVisibleCount((count) => count + 60)}
          >
            Load atmost 60 more problems
          </button>
        </div>
      )}
    </Shell>
  );
}

/* ── Root App ────────────────────────────────────────────────────────── */
export default function App() {
  const [active, setActive] = useState(null);
  const [showPlayground, setShowPlayground] = useState(() => {
    try {
      return window.location.hash === "#playground";
    } catch {
      return false;
    }
  });
  const [track, setTrack] = useState(TRACKS.LEETCODE);
  const [layoutWidth, setLayoutWidth] = useState("full");
  const [navigationTransitionsEnabled, setNavigationTransitionsEnabled] =
    useState(() => {
      try {
        const stored = window.localStorage.getItem("cpviz.navigationTransitions");
        return stored === null ? true : stored !== "0";
      } catch {
        return true;
      }
    });
  // null until the fetch settles, so ProblemInfoPanel can tell "still loading"
  // apart from "loaded, but this problem has no description" — the latter hides
  // the toggle entirely.
  const [problemDescriptions, setProblemDescriptions] = useState(null);

  useEffect(() => {
    fetch("/data/problemDescriptions.json")
      .then((res) => res.json())
      .then((data) => setProblemDescriptions(data))
      .catch(() => setProblemDescriptions({}));
  }, []);

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
      setActive(null);
      setShowPlayground(window.location.hash === "#playground");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const goBack = () => {
    window.history.pushState({}, "", window.location.pathname);
    setActive(null);
    setShowPlayground(false);
  };

  const openPlayground = () => {
    window.history.pushState({ view: "playground" }, "", "#playground");
    setActive(null);
    setShowPlayground(true);
  };

  const selectProblem = (problem) => {
    window.history.pushState(
      { slug: problem.slug },
      "",
      `#${problem.slug}`,
    );
    setShowPlayground(false);
    setActive(problem);
  };

  const handleTrackChange = (nextTrack) => {
    setTrack(nextTrack);
    setActive(null);
    setShowPlayground(false);
  };

  const utilityControls = (
    <>
      <ThemeToggle />
      <SettingsMenu
        navigationTransitionsEnabled={navigationTransitionsEnabled}
        onToggleNavigationTransitions={setNavigationTransitionsEnabled}
      />
    </>
  );

  const pageContent = showPlayground ? (
    <Suspense
      key="runtime-playground-boundary"
      fallback={
        <div className="playground-loading">Loading Visualizer Playground…</div>
      }
    >
      <RuntimePlayground
        key="runtime-playground"
        onBack={goBack}
        utilityControls={utilityControls}
        layoutWidth={layoutWidth}
        onLayoutChange={setLayoutWidth}
      />
    </Suspense>
  ) : active ? (
    <ProblemPage
      key={active.id}
      problem={active}
      onBack={goBack}
      layoutWidth={layoutWidth}
      onLayoutChange={setLayoutWidth}
      enableTransitions={navigationTransitionsEnabled}
      problemDescriptions={problemDescriptions}
      utilityControls={utilityControls}
    />
  ) : (
    <HomePage
      key={`home-${track}`}
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
      <ZoomControls />
      <div className={`app layout-${layoutWidth}`}>
        {!active && !showPlayground && (
          <div className="app-toolbar">{utilityControls}</div>
        )}
        {/* A flex column (not overflow:auto) so children get a definite height to
            resolve `height: 100%` against — an auto-overflow box lets children
            grow and scroll instead of constraining them, which left every
            visualizer shell unable to fill. Pages that need to scroll (home,
            .problem-content) own their own overflow. */}
        <div
          id="zoom-content-wrapper"
          style={{
            flex: '1 1 0',
            minHeight: 0,
            marginTop: active || showPlayground ? '0' : '60px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {navigationTransitionsEnabled ? (
            <AnimatePresence mode="wait">{pageContent}</AnimatePresence>
          ) : (
            pageContent
          )}
        </div>
        <ChatAssistant />
      </div>
      </ZoomProvider>
    </ThemeProvider>
  );
}
