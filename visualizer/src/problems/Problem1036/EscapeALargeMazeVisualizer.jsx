import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import PlaybackControls from "../../components/PlaybackControls";
import FloatingPanel from "../../components/shared/FloatingPanel";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import "./EscapeALargeMazeVisualizer.css";

const GRID = 1_000_000;
const DIRECTIONS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
const key = (x, y) => `${x},${y}`;
const EXAMPLES = [
  {
    name: "Trapped corner",
    blocked: [
      [0, 1],
      [1, 0],
    ],
    source: [0, 0],
    target: [0, 2],
  },
  {
    name: "Empty million-grid",
    blocked: [],
    source: [0, 0],
    target: [999999, 999999],
  },
  {
    name: "Enclosed target",
    blocked: [
      [4, 5],
      [5, 4],
      [6, 5],
      [5, 6],
    ],
    source: [0, 0],
    target: [5, 5],
  },
  {
    name: "Open detour",
    blocked: [
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    source: [0, 0],
    target: [3, 1],
  },
];

const CODE_TEXT = [
  "def isEscapePossible(blocked, source, target):",
  "    walls = {tuple(cell) for cell in blocked}",
  "    b = len(blocked)",
  "    limit = b * (b - 1) // 2",
  "",
  "    def bfs(start, end):",
  "        queue = deque([tuple(start)])",
  "        seen = {tuple(start)}",
  "        while queue and len(seen) <= limit:",
  "            x, y = queue.popleft()",
  "            if [x, y] == end: return True",
  "            for dx, dy in directions:",
  "                nx, ny = x + dx, y + dy",
  "                if in_bounds and not_blocked and not_seen:",
  "                    seen.add((nx, ny))",
  "                    queue.append((nx, ny))",
  "        return len(seen) > limit",
  "",
  "    return bfs(source, target) and bfs(target, source)",
];

const CODE = CODE_TEXT.map((text, index) => ({ line: index + 1, text }));

function validate(value) {
  const coord = (p) =>
    Array.isArray(p) &&
    p.length === 2 &&
    p.every((v) => Number.isInteger(v) && v >= 0 && v < GRID);
  if (!value || !Array.isArray(value.blocked) || value.blocked.length > 200)
    throw new Error("blocked must be an array of at most 200 cells.");
  if (
    !coord(value.source) ||
    !coord(value.target) ||
    value.blocked.some((p) => !coord(p))
  )
    throw new Error("Coordinates must be integer pairs between 0 and 999999.");
  if (key(...value.source) === key(...value.target))
    throw new Error("Source and target must differ.");
  const walls = new Set(value.blocked.map((p) => key(...p)));
  if (walls.size !== value.blocked.length)
    throw new Error("Blocked coordinates must be unique.");
  if (walls.has(key(...value.source)) || walls.has(key(...value.target)))
    throw new Error("Source and target cannot be blocked.");
  return value;
}

// Captures the first few BFS operations for animation, but ALWAYS computes
// the real verdict using the full enclosure bound (up to 19,900 cells).
function traceBfs(start, end, walls, limit, label, maxFrames = 100) {
  const queue = [start];
  let head = 0;
  const seen = new Set([key(...start)]);
  const frames = [];
  const record = (line, message, current = null, final = false) => {
    if (frames.length < maxFrames || final) {
      frames.push({
        phase: label,
        line,
        message,
        current,
        visited: Array.from(seen),
        frontier: queue.slice(head).map((p) => key(...p)),
        explored: seen.size,
        final,
      });
    }
  };
  record(8, `Start ${label.toLowerCase()} search at (${start.join(", ")}).`);
  while (head < queue.length && seen.size <= limit) {
    const [x, y] = queue[head++];
    if (x === end[0] && y === end[1]) {
      record(10, `Reached the other endpoint at (${x}, ${y}).`, [x, y], true);
      return { escaped: true, reason: "reached", explored: seen.size, frames };
    }
    for (const [dx, dy] of DIRECTIONS) {
      const nx = x + dx,
        ny = y + dy,
        k = key(nx, ny);
      if (
        nx >= 0 &&
        ny >= 0 &&
        nx < GRID &&
        ny < GRID &&
        !walls.has(k) &&
        !seen.has(k)
      ) {
        seen.add(k);
        queue.push([nx, ny]);
      }
    }
    record(
      14,
      `Expand (${x}, ${y}); ${seen.size} cells discovered, ${queue.length - head} waiting.`,
      [x, y],
    );
  }
  const escaped = seen.size > limit;
  record(
    16,
    escaped
      ? `Explored ${seen.size} cells, exceeding the enclosure bound ${limit}. This endpoint cannot be trapped.`
      : `Search stopped after ${seen.size} cells. The endpoint is enclosed.`,
    null,
    true,
  );
  return {
    escaped,
    reason: escaped ? "exceeded" : "enclosed",
    explored: seen.size,
    frames,
  };
}

function buildTrace(input) {
  const walls = new Set(input.blocked.map((p) => key(...p)));
  const b = input.blocked.length;
  const limit = (b * (b - 1)) / 2;
  const forward = traceBfs(input.source, input.target, walls, limit, "Source");
  // Always show both searches so the reason for the two-way test is visible.
  const backward = traceBfs(input.target, input.source, walls, limit, "Target");
  const possible = forward.escaped && backward.escaped;
  const frames = [...forward.frames, ...backward.frames];
  frames.push({
    phase: "Result",
    line: 18,
    message: possible
      ? "Both searches escaped their potential enclosures. A path exists."
      : `A search could not escape its enclosure. No path exists.`,
    current: null,
    visited: [],
    frontier: [],
    explored: 0,
    final: true,
  });
  return { frames, possible, forward, backward, limit };
}

function MazeGrid({ input, frame, focus }) {
  const center =
    frame?.current || (focus === "Target" ? input.target : input.source);
  const radius = 7;
  const maxStart = GRID - (radius * 2 + 1);
  const startX = Math.max(0, Math.min(maxStart, center[0] - radius));
  const startY = Math.max(0, Math.min(maxStart, center[1] - radius));
  const walls = useMemo(
    () => new Set(input.blocked.map((p) => key(...p))),
    [input],
  );
  const visited = useMemo(() => new Set(frame?.visited || []), [frame]);
  const frontier = useMemo(() => new Set(frame?.frontier || []), [frame]);
  const cells = [];
  for (let y = startY + 14; y >= startY; y--) {
    for (let x = startX; x <= startX + 14; x++) {
      const k = key(x, y);
      let kind = "empty";
      if (visited.has(k)) kind = "visited";
      if (frontier.has(k)) kind = "frontier";
      if (walls.has(k)) kind = "blocked";
      if (x === input.source[0] && y === input.source[1]) kind = "source";
      if (x === input.target[0] && y === input.target[1]) kind = "target";
      if (frame?.current?.[0] === x && frame?.current?.[1] === y)
        kind = "current";
      cells.push(
        <div
          key={k}
          className={`elm-cell elm-${kind}`}
          title={`(${x}, ${y})${kind === "empty" ? "" : ` · ${kind}`}`}
        >
          {kind === "source"
            ? "S"
            : kind === "target"
              ? "T"
              : kind === "current"
                ? "●"
                : ""}
        </div>,
      );
    }
  }
  return (
    <div className="elm-grid-wrap">
      <div
        className="elm-grid"
        role="img"
        aria-label={`15 by 15 local grid viewport, x ${startX} to ${startX + 14}, y ${startY} to ${startY + 14}`}
      >
        {cells}
      </div>
      <div className="elm-viewport">
        Viewport x: {startX}–{startX + 14} · y: {startY}–{startY + 14}{" "}
        <span>· entire grid: 1,000,000 × 1,000,000</span>
      </div>
    </div>
  );
}

export default function EscapeALargeMazeVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0]);
  const [draft, setDraft] = useState(
    JSON.stringify(
      {
        blocked: EXAMPLES[0].blocked,
        source: EXAMPLES[0].source,
        target: EXAMPLES[0].target,
      },
      null,
      2,
    ),
  );
  const [error, setError] = useState("");
  const trace = useMemo(() => buildTrace(input), [input]);
  const {
    stepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(trace.frames.length);
  const rawStep = stepIndex >= 0 ? trace.frames[stepIndex] : null;
  const step = rawStep || {
    phase: "Source",
    line: 1,
    message: "Press play or next to begin the bounded BFS.",
    explored: 0,
    frontier: [],
    visited: [],
  };
  const codeStep = rawStep ? { ...rawStep, activeLine: rawStep.line } : null;
  const { showPatternOverlay, setShowPatternOverlay, setActiveLineDom } =
    usePatternOverlay();
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll();
  const [panelDivs, setPanelDivs] = useState(null);
  const panels = useMemo(
    () => [
      { id: "maze", title: "Maze Explorer" },
      {
        id: "input",
        title: "Inputs & Explanation",
        dockMode: "split-bottom",
        ratio: 0.58,
      },
      { id: "code", title: "Code Trace", dockMode: "split-left", ratio: 0.6 },
    ],
    [],
  );
  const onPanelReady = useCallback((divs) => setPanelDivs(divs), []);
  const load = useCallback(
    (next) => {
      setInput(next);
      setDraft(
        JSON.stringify(
          { blocked: next.blocked, source: next.source, target: next.target },
          null,
          2,
        ),
      );
      setError("");
      handleReset();
    },
    [handleReset],
  );
  const apply = useCallback(() => {
    try {
      load(validate(JSON.parse(draft)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [draft, load]);
  const focus = step.phase === "Target" ? "Target" : "Source";
  return (
    <div className="problem-shell elm-problem-shell">
      <LuminoDockPanel panels={panels} onPanelReady={onPanelReady} />
      {panelDivs && (
        <>
          {panelDivs.maze &&
            createPortal(
              <div className="elm-shell elm-dock-body">
                <header className="elm-header">
                  <div>
                    <span className="elm-eyebrow">
                      LEETCODE 1036 · GRAPH / BFS
                    </span>
                    <h2>Escape a Large Maze</h2>
                    <p>
                      Discover why exploring a small area is enough in a
                      million-by-million grid.
                    </p>
                  </div>
                  <span
                    className={`elm-result ${trace.possible ? "elm-yes" : "elm-no"}`}
                  >
                    Answer: {String(trace.possible)}
                  </span>
                </header>

                <section className="elm-panel elm-main">
                  <div className="elm-panel-heading">
                    <h3>Local grid exploration</h3>
                    <span>{step.phase} BFS</span>
                  </div>
                  <MazeGrid input={input} frame={step} focus={focus} />
                  <div className="elm-legend">
                    <span>
                      <i className="elm-source" /> Source
                    </span>
                    <span>
                      <i className="elm-target" /> Target
                    </span>
                    <span>
                      <i className="elm-blocked" /> Blocked
                    </span>
                    <span>
                      <i className="elm-visited" /> Visited
                    </span>
                    <span>
                      <i className="elm-frontier" /> Frontier
                    </span>
                    <span>
                      <i className="elm-current" /> Current
                    </span>
                  </div>
                  <div className="elm-narrative" aria-live="polite">
                    <strong>
                      Step {stepIndex + 1} / {trace.frames.length}
                    </strong>
                    <p>{step.message}</p>
                  </div>
                </section>
                <div className="elm-stats">
                  <div>
                    <small>Blocked cells</small>
                    <strong>{input.blocked.length}</strong>
                  </div>
                  <div>
                    <small>Enclosure bound</small>
                    <strong>{trace.limit.toLocaleString()}</strong>
                  </div>
                  <div>
                    <small>Visited in this step</small>
                    <strong>{step.explored.toLocaleString()}</strong>
                  </div>
                  <div>
                    <small>Frontier</small>
                    <strong>{step.frontier.length.toLocaleString()}</strong>
                  </div>
                </div>
              </div>,
              panelDivs.maze,
            )}
          {panelDivs.input &&
            createPortal(
              <div className="elm-shell elm-dock-body">
                <section className="elm-panel">
                  <div className="elm-presets">
                    {EXAMPLES.map((ex, i) => (
                      <button
                        key={ex.name}
                        type="button"
                        className={input === ex ? "active" : ""}
                        onClick={() => load(EXAMPLES[i])}
                      >
                        {ex.name}
                      </button>
                    ))}
                  </div>
                  <div className="elm-panel-heading">
                    <h3>Try your own input</h3>
                    <span>JSON</span>
                  </div>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    spellCheck="false"
                    aria-label="Input JSON"
                    rows={8}
                  />
                  {error && (
                    <p className="elm-error" role="alert">
                      {error}
                    </p>
                  )}
                  <button className="elm-primary elm-apply" onClick={apply}>
                    Apply input
                  </button>
                </section>
                <section className="elm-panel elm-explain">
                  <div className="elm-panel-heading">
                    <h3>Why two bounded searches?</h3>
                  </div>
                  <p>
                    At most <strong>200 blocked squares</strong> can enclose
                    only a small region. The maximum number of enclosed open
                    squares is bounded by <code>b × (b − 1) / 2</code>, where{" "}
                    <code>b</code> is the number of blocked squares.
                  </p>
                  <p>
                    If BFS visits <strong>more than the bound</strong>, the
                    start cannot be trapped. If it reaches the other endpoint,
                    that is also enough. Otherwise, the start is enclosed.
                  </p>
                  <p>
                    We must check <strong>both source and target</strong>,
                    because either endpoint might be trapped independently.
                  </p>
                  <div className="elm-outcomes">
                    <div>
                      <strong>Source search</strong>
                      <span>
                        {trace.forward.reason} ·{" "}
                        {trace.forward.explored.toLocaleString()} cells
                      </span>
                    </div>
                    <div>
                      <strong>Target search</strong>
                      <span>
                        {trace.backward.reason} ·{" "}
                        {trace.backward.explored.toLocaleString()} cells
                      </span>
                    </div>
                  </div>
                  <p className="elm-note">
                    The animation shows a capped number of steps for
                    responsiveness. The verdict is calculated using the complete
                    bounded searches. The 15×15 viewport follows the active BFS
                    cell; it does not represent the full grid.
                  </p>
                </section>
              </div>,
              panelDivs.input,
            )}
          {panelDivs.code &&
            createPortal(
              <div className="elm-code-dock">
                <CodeTracePanel
                  step={codeStep}
                  codeLines={CODE}
                  onActiveLineDomChange={setActiveLineDom}
                  autoScroll={autoScrollCode}
                />
              </div>,
              panelDivs.code,
            )}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">
          <PlaybackControls
            isPlaying={isPlaying}
            isDone={isDone}
            speed={speed}
            onPlayToggle={togglePlay}
            onPrev={stepBack}
            onNext={stepForward}
            onReset={handleReset}
            prevDisabled={stepIndex < 0}
            nextDisabled={isDone}
            resetDisabled={stepIndex < 0}
            onSpeedChange={(e) => setSpeed(Number(e.target.value))}
            showPatternOverlay={showPatternOverlay}
            onShowPatternOverlayChange={setShowPatternOverlay}
            patternOverlayLabel="Show pattern overlay"
            showPatternOverlayToggle={false}
            autoScroll={autoScrollCode}
            onAutoScrollChange={setAutoScrollCode}
            autoScrollLabel="Auto-scroll code"
            showAutoScroll
          />
        </FloatingPanel>,
        document.body,
      )}
    </div>
  );
}
