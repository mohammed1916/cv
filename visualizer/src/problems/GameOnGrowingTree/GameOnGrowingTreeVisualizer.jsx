import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import FloatingPanel from "../../components/shared/FloatingPanel";
import PatternOverlay from "../../components/PatternOverlay";
import VisualizationControls from "../../components/VisualizationControls";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { useVisualizationFeatures } from "../../hooks/useVisualizationFeatures";
import { getVisualizationFeatures } from "../../config/visualizationRegistry";
import { createPositionStep, createTreeDPStep, createDACStep, createContextualStepBuilder } from "../../utils/stepBuilder";
import "./GameOnGrowingTreeVisualizer.css";
import "./DualRepresentationView.css";
import { Stack3D } from "../../components/viz3d";
import PartialAnswersPanel from "../../components/PartialAnswersPanel";
import TreeStatePanel from "./TreeStatePanel";
import DockableWorkspace from "../../components/shared/DockableWorkspace";
import DPDetailPanel from "./DPDetailPanel";
import ComparisonBox from "./ComparisonBox";
import RankHighlightOverlay from "./RankHighlightOverlay";
import EdgeFlowOverlay from "./EdgeFlowOverlay";
import InsertTop3Breakdown from "./InsertTop3Breakdown";
import { TreeHighlightOverlay } from "./TreeDPLinking";
import BottomUpDetailsPanel from "./BottomUpDetailsPanel";
import TraversalTrail, { TreeTraversalHighlight } from "./TraversalTrail";
import ValueSourceTracking from "./ValueSourceTracking";
import TreeDPConnector from "./TreeDPConnector";
import { getExamples } from '../../config/examplesRegistry'
import SituationOverlay from "./SituationOverlay";
import { useSituationAnalysis } from "./useSituationAnalysis";
import { usePruningAnalysis } from "./usePruningAnalysis";
import DualRepresentationView from "./DualRepresentationView";
const MAX_TREE_NODES_TO_RENDER = 120;

const EXAMPLES = getExamples('game-on-growing-tree');

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def scoreForPrefix(parent, size):' },
  { line: 2, text: '    first = [0] * size  # top 1 depth' },
  { line: 3, text: '    second = [0] * size # top 2 depth' },
  { line: 4, text: '    third = [0] * size  # top 3 depth' },
  { line: 5, text: '    for node in range(size-1, 0, -1):' },
  { line: 6, text: '        p = parent[node]' },
  { line: 7, text: '        depth = second[node] + 1' },
  { line: 8, text: '        insertTop3(first, second, third, p, depth)' },
  { line: 9, text: '    for node in range(1, size):' },
  { line: 10, text: '        p = parent[node]' },
  { line: 11, text: '        depth = (third[p]+1 if second[p]<=second[node]+1 else second[p]+1)' },
  { line: 12, text: '        insertTop3(first, second, third, node, depth)' },
  { line: 13, text: '    return max(second) + 1' },
]

function insertTop3(first, second, third, idx, value) {
  if (value > first[idx]) {
    third[idx] = second[idx];
    second[idx] = first[idx];
    first[idx] = value;
    return 1;
  }
  if (value > second[idx]) {
    third[idx] = second[idx];
    second[idx] = value;
    return 2;
  }
  if (value > third[idx]) {
    third[idx] = value;
    return 3;
  }
  return 0;
}

function scoreForPrefix(parentZeroBased, size) {
  const first = new Array(size).fill(0);
  const second = new Array(size).fill(0);
  const third = new Array(size).fill(0);

  for (let node = size - 1; node >= 1; node -= 1) {
    const parent = parentZeroBased[node];
    const depth = second[node] + 1;
    insertTop3(first, second, third, parent, depth);
  }

  for (let node = 1; node < size; node += 1) {
    const parent = parentZeroBased[node];
    const depth =
      second[parent] <= second[node] + 1
        ? third[parent] + 1
        : second[parent] + 1;
    insertTop3(first, second, third, node, depth);
  }

  let best = 0;
  for (let i = 0; i < size; i += 1) {
    if (second[i] > best) best = second[i];
  }
  return best + 1;
}

function createParentParseSteps(raw) {
  const parsed = [];
  const steps = [];

  raw.forEach((value, idx) => {
    const zeroBased = value - 1;
    parsed.push(zeroBased);
    steps.push(
      createPositionStep(
        2, // activeLine
        idx, // index
        value, // value (1-based for display)
        "read", // operation
        `Read parent ${value} for node ${idx + 1} and store ${zeroBased}.`,
        {
          phase: "parse-parent",
          parsedParents: [...parsed],
          currentParentValue: zeroBased,
        }
      )
    );
  });

  return steps;
}

function solveWithTrace(parentZeroBased, size, answersSnapshot) {
  const first = new Array(size).fill(0);
  const second = new Array(size).fill(0);
  const third = new Array(size).fill(0);
  const steps = [];
  const snapshotLimit = Math.min(size, MAX_TREE_NODES_TO_RENDER);

  // Shared context for all DP steps
  const dpContext = {
    subproblemSize: size,
    stackSize: 0,
    answers: answersSnapshot,
  };

  const getDPSnapshot = () => ({
    first: first.slice(0, snapshotLimit),
    second: second.slice(0, snapshotLimit),
    third: third.slice(0, snapshotLimit),
  });

  // Helper to create a basic DP step with shared context
  const captureDP = (
    activeLine,
    message,
    relatedLines = [activeLine],
    focus = null,
  ) => {
    steps.push({
      activeLine,
      relatedLines,
      message,
      ...dpContext,
      focus,
      dpSnapshot: getDPSnapshot(),
    });
  };

  captureDP(6, `Initialize top-3 arrays for size ${size}.`, [6, 7, 8]);

  for (let node = size - 1; node >= 1; node -= 1) {
    const parent = parentZeroBased[node];
    const depth = second[node] + 1;

    steps.push(
      createTreeDPStep(
        9,
        "up",
        node,
        parent,
        `Bottom-up: node ${node} contributes depth ${depth} to parent ${parent}.`,
        getDPSnapshot(),
        { sourceNode: node, targetNode: parent },
        [9, 10, 11],
      )
    );
    Object.assign(steps[steps.length - 1], dpContext);

    const which = insertTop3(first, second, third, parent, depth);
    let lineNo, msg, relLines;

    if (which === 1) {
      lineNo = 12;
      msg = `depth ${depth} becomes first[${parent}] and shifts the previous values right.`;
      relLines = [12, 13, 14];
    } else if (which === 2) {
      lineNo = 13;
      msg = `depth ${depth} becomes second[${parent}] and shifts third.`;
      relLines = [13, 14];
    } else if (which === 3) {
      lineNo = 14;
      msg = `depth ${depth} becomes third[${parent}].`;
      relLines = [14];
    } else {
      lineNo = 14;
      msg = `depth ${depth} is pruned - worse than all current top-3 values.`;
      relLines = [14];
    }

    steps.push(
      createTreeDPStep(
        lineNo,
        "up",
        node,
        parent,
        msg,
        getDPSnapshot(),
        { sourceNode: node, targetNode: parent, pruned: which === 0 },
        relLines,
      )
    );
    Object.assign(steps[steps.length - 1], dpContext);
  }

  for (let node = 1; node < size; node += 1) {
    const parent = parentZeroBased[node];
    const useThird = second[parent] <= second[node] + 1;
    const depth = useThird ? third[parent] + 1 : second[parent] + 1;

    steps.push(
      createTreeDPStep(
        15,
        "down",
        parent,
        node,
        `Top-down: node ${node} receives depth ${depth} from parent ${parent}.`,
        getDPSnapshot(),
        { sourceNode: parent, targetNode: node },
        [15, 16, 17, 18, 19, 20],
      )
    );
    Object.assign(steps[steps.length - 1], dpContext);

    const which = insertTop3(first, second, third, node, depth);
    let lineNo, msg, relLines;

    if (which === 1) {
      lineNo = 21;
      msg = `depth ${depth} becomes first[${node}] and shifts the previous values right.`;
      relLines = [21, 22, 23];
    } else if (which === 2) {
      lineNo = 22;
      msg = `depth ${depth} becomes second[${node}] and shifts third.`;
      relLines = [22, 23];
    } else if (which === 3) {
      lineNo = 23;
      msg = `depth ${depth} becomes third[${node}].`;
      relLines = [23];
    } else {
      lineNo = 23;
      msg = `depth ${depth} is pruned - worse than all current top-3 values.`;
      relLines = [23];
    }

    steps.push(
      createTreeDPStep(
        lineNo,
        "down",
        parent,
        node,
        msg,
        getDPSnapshot(),
        { sourceNode: parent, targetNode: node, pruned: which === 0 },
        relLines,
      )
    );
    Object.assign(steps[steps.length - 1], dpContext);
  }

  const value = Math.max(...second) + 1;
  captureDP(24, `Return max(second) + 1 = ${value}.`, [24]);

  return { value, steps };
}

function solveAndBuildSteps(q, parentInput) {
  const raw = parentInput
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((x) => Number(x));

  if (!Number.isInteger(q) || q < 1 || q > 200000) {
    throw new Error("q must be an integer in [1, 200000].");
  }
  if (raw.length !== q) {
    throw new Error(`Expected ${q} parent values but got ${raw.length}.`);
  }

  const parentZeroBased = [0];
  for (let i = 0; i < q; i += 1) {
    const v = raw[i];
    if (!Number.isInteger(v) || v < 1 || v > i + 1) {
      throw new Error(
        `Invalid parent v_${i + 1} = ${v}. Must satisfy 1 <= v_i <= i.`,
      );
    }
    parentZeroBased.push(v - 1);
  }

  const steps = createParentParseSteps(raw);
  if (q === 1) {
    const answers = [1];
    steps.push({
      activeLine: 3,
      relatedLines: [3],
      message: "Only one node, answer is 1.",
      intervalLeft: null,
      intervalRight: null,
      midpoint: null,
      computedValue: null,
      stackSize: 0,
      answers,
    });
    return { answers, steps };
  }

  steps.push({
    activeLine: 2,
    relatedLines: [2],
    message: "Parent list parsed. Build the tree and continue.",
    phase: "parse-parent-done",
    parsedParents: parentZeroBased.slice(1),
    currentParentIndex: q - 1,
    currentParentValue: parentZeroBased[q],
  });

  const ans = new Array(q + 4).fill(0);
  ans[1] = 1;
  ans[2] = 1;
  ans[3] = 2;
  ans[q + 2] = 17;

  const stack = [[3, q + 2]];

  // Helper to create DAC step with shared context (stack and answers)
  const captureDACStep = (
    activeLine,
    message,
    l,
    r,
    m,
    c,
    relatedLines = [activeLine],
  ) => {
    steps.push(
      createDACStep(
        activeLine,
        m ? "conquer" : "divide",
        l,
        r,
        message,
        {
          midpoint: m,
          computedValue: c,
          stackSize: stack.length,
          stack: stack.slice(),
          answers: ans.slice(2, q + 2),
        },
        relatedLines,
      )
    );
  };

  captureDACStep(
    26,
    "Initialize answer array, sentinel value, and divide-and-conquer stack.",
    3,
    q + 2,
    null,
    null,
    [26, 27, 28],
  );

  while (stack.length > 0) {
    const [left, right] = stack.pop();
    captureDACStep(
      29,
      `Pop interval [${left}, ${right}] from the stack.`,
      left,
      right,
      null,
      null,
      [29, 30],
    );

    const mid = (left + right) >> 1;
    captureDACStep(31, `Midpoint is ${mid}.`, left, right, mid, null, [31]);

    captureDACStep(
      32,
      `Run solve(${mid}) and trace its two DP passes.`,
      left,
      right,
      mid,
      null,
      [5, 6, 9, 15, 24],
    );
    const solved = solveWithTrace(parentZeroBased, mid, ans.slice(2, q + 2));
    steps.push(...solved.steps);

    ans[mid] = solved.value;
    captureDACStep(
      33,
      `ans[${mid}] = ${solved.value}.`,
      left,
      right,
      mid,
      solved.value,
      [33],
    );

    if (ans[left] === ans[mid]) {
      for (let i = left + 1; i < mid; i += 1) ans[i] = solved.value;
      captureDACStep(
        34,
        `Left endpoint matches midpoint, so fill [${left + 1}, ${mid - 1}] with ${solved.value}.`,
        left,
        right,
        mid,
        solved.value,
        [34, 35],
      );
    } else if (left + 1 < mid) {
      stack.push([left, mid]);
      captureDACStep(
        36,
        `Left half still needs work, push [${left}, ${mid}].`,
        left,
        right,
        mid,
        solved.value,
        [36, 37],
      );
    }

    if (ans[mid] === ans[right]) {
      for (let i = mid + 1; i < right; i += 1) ans[i] = solved.value;
      captureDACStep(
        38,
        `Midpoint matches right endpoint, so fill [${mid + 1}, ${right - 1}] with ${solved.value}.`,
        left,
        right,
        mid,
        solved.value,
        [38, 39],
      );
    } else if (mid + 1 < right) {
      stack.push([mid, right]);
      captureDACStep(
        40,
        `Right half still needs work, push [${mid}, ${right}].`,
        left,
        right,
        mid,
        solved.value,
        [40, 41],
      );
    }
  }

  captureDACStep(
    42,
    "All intervals are resolved. Print the final answers from 2 to n + 1.",
    null,
    null,
    null,
    null,
    [42],
  );

  return { answers: ans.slice(2, q + 2), steps };
}

function buildTreeData(parentZeroBased, m) {
  const renderCount = Math.min(m, MAX_TREE_NODES_TO_RENDER);
  const adj = Array.from({ length: renderCount }, () => []);

  for (let node = 1; node < renderCount; node += 1) {
    const p = parentZeroBased[node];
    if (p >= renderCount) continue;
    adj[p].push(node);
    adj[node].push(p);
  }

  const parent = new Array(renderCount).fill(-1);
  const depth = new Array(renderCount).fill(0);
  const levels = [];
  const queue = [0];
  parent[0] = 0;

  for (let qi = 0; qi < queue.length; qi += 1) {
    const u = queue[qi];
    const d = depth[u];
    if (!levels[d]) levels[d] = [];
    levels[d].push(u);

    for (const v of adj[u]) {
      if (parent[v] !== -1) continue;
      parent[v] = u;
      depth[v] = d + 1;
      queue.push(v);
    }
  }

  const positions = new Map();
  levels.forEach((nodes, levelIdx) => {
    const y = 44 + levelIdx * 74;
    const count = nodes.length;
    const width = Math.max(1, count);
    nodes.forEach((node, idx) => {
      const x = ((idx + 1) * 1000) / (width + 1);
      positions.set(node, { x, y });
    });
  });

  const edges = [];
  for (let node = 1; node < renderCount; node += 1) {
    const p = parent[node];
    if (p > -1 && p !== node) edges.push({ from: p, to: node });
  }

  return {
    renderCount,
    adj,
    depth,
    positions,
    edges,
    truncated: m > renderCount,
  };
}

function pickBobNode(adj, states, chip) {
  let best = -1;
  let bestScore = -1;

  for (let node = 0; node < states.length; node += 1) {
    if (states[node] !== "white") continue;
    let whiteDeg = 0;
    for (const v of adj[node]) {
      if (states[v] === "white") whiteDeg += 1;
    }

    const score = whiteDeg * 1000 - Math.abs(node - chip);
    if (score > bestScore) {
      bestScore = score;
      best = node;
    }
  }

  return best;
}

function pickAliceMove(adj, states, chip) {
  let best = -1;
  let bestScore = -1;

  for (const next of adj[chip]) {
    if (states[next] !== "white") continue;

    let onward = 0;
    for (const v of adj[next]) {
      if (states[v] === "white") onward += 1;
    }

    const score = onward * 1000 - next;
    if (score > bestScore) {
      bestScore = score;
      best = next;
    }
  }

  return best;
}

function simulateTreeGameWithTrace(treeData) {
  const { renderCount, adj } = treeData;
  const states = new Array(renderCount).fill("white");
  const chipPath = [];
  const moves = [];
  const stateHierarchy = {
    overallPhase: "game-simulation",
    overallMessage: "Simulating Alice vs Bob game on tree",
    substates: [],
  };

  let start = 0;
  let startDegree = -1;
  for (let node = 0; node < renderCount; node += 1) {
    const deg = adj[node].length;
    if (deg > startDegree) {
      startDegree = deg;
      start = node;
    }
  }

  states[start] = "red";
  chipPath.push(start);
  let chip = start;

  stateHierarchy.substates.push({
    level: "initialization",
    message: `Game initialized: Alice starts at node ${start + 1} (degree ${startDegree})`,
  });

  moves.push({
    type: "game-start",
    message: `Alice starts at node ${start + 1} (highest degree).`,
    states: states.slice(),
    chip,
    chipPath: chipPath.slice(),
    hierarchyLevel: "detail",
  });

  let roundNum = 1;
  while (true) {
    const bob = pickBobNode(adj, states, chip);
    if (bob !== -1) {
      states[bob] = "blue";
      const whiteNeighbors = adj[bob].filter(v => states[v] === "white").length;

      stateHierarchy.substates.push({
        level: "round-bob",
        roundNum,
        message: `Round ${roundNum}: Bob blocks node ${bob + 1} (${whiteNeighbors} white neighbors)`,
      });

      moves.push({
        type: "bob-block",
        message: `Bob blocks node ${bob + 1} (closest white node with most white neighbors).`,
        states: states.slice(),
        chip,
        chipPath: chipPath.slice(),
        blockNode: bob,
        hierarchyLevel: "detail",
        round: roundNum,
      });
    }

    const next = pickAliceMove(adj, states, chip);
    if (next === -1) {
      stateHierarchy.substates.push({
        level: "game-end",
        message: `Game ended: Alice trapped at node ${chip + 1}, no valid moves`,
        finalChipPosition: chip + 1,
        pathLength: chipPath.length,
      });

      moves.push({
        type: "game-end",
        message: `Alice has no moves. Game ends.`,
        states: states.slice(),
        chip,
        chipPath: chipPath.slice(),
        hierarchyLevel: "detail",
      });
      break;
    }

    states[next] = "red";
    chip = next;
    chipPath.push(chip);
    const onwardOptions = adj[next].filter(v => states[v] === "white").length;

    stateHierarchy.substates.push({
      level: "round-alice",
      roundNum,
      message: `Round ${roundNum}: Alice moves to node ${next + 1} (${onwardOptions} onward options)`,
    });

    moves.push({
      type: "alice-move",
      message: `Alice moves to node ${next + 1} (neighbor with most onward options).`,
      states: states.slice(),
      chip,
      chipPath: chipPath.slice(),
      moveNode: next,
      hierarchyLevel: "detail",
      round: roundNum,
    });

    roundNum++;
  }

  const blockedEdges = new Set();
  for (const v of adj[chip]) {
    if (states[v] !== "white") {
      const a = Math.min(chip, v);
      const b = Math.max(chip, v);
      blockedEdges.add(`${a}-${b}`);
    }
  }

  return {
    states,
    chip,
    chipPath,
    blockedEdges,
    moves,
    stateHierarchy,
  };
}

export default function GameOnGrowingTreeVisualizer() {
  const [qInput, setQInput] = useState("9");
  const [parentsInput, setParentsInput] = useState("1 1 3 3 1 2 1 2 8");
  const [previewSize, setPreviewSize] = useState(null);
  const [parsedParentSnapshot, setParsedParentSnapshot] = useState([]);
  const [viewMode, setViewMode] = useState('panels'); // 'panels' or 'dual-rep'

  const handleExampleClick = useCallback((example) => {
    setQInput(example.q);
    setParentsInput(example.parents);
  }, []);

  const { answers, steps, inputError } = useMemo(() => {
    try {
      const q = Number(qInput.trim());
      const result = solveAndBuildSteps(q, parentsInput);
      return { answers: result.answers, steps: result.steps, inputError: "" };
    } catch (error) {
      return {
        answers: [],
        steps: [],
        inputError: error?.message || "Invalid input",
      };
    }
  }, [qInput, parentsInput]);

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
  } = usePlaybackState(steps.length, 650);
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll();
  const [showPatternOverlay, setShowPatternOverlay] = useState(true);
  const [activeLineDom, setActiveLineDom] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Use modular visualization features system
  const vizFeatureDefs = getVisualizationFeatures('game-on-growing-tree');
  const { items: vizFeatures, toggle: toggleVizFeature, enabledIds: enabledVizIds } = useVisualizationFeatures(vizFeatureDefs);

  // Load solution code from registry
  const SOLUTION_CODE = SOLUTION_CODE_INLINE;

  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const prevStep = stepIndex > 0 ? steps[stepIndex - 1] : null;

  // Analyze current situation for visualization
  const situation = useSituationAnalysis(step, prevStep);

  // Analyze pruning for visualization
  const pruningAnalysis = usePruningAnalysis(step, steps, stepIndex);

  // track previous answers to detect per-index changes
  const prevAnswersRef = useRef(null);
  useEffect(() => {
    prevAnswersRef.current = step?.answers ?? null;
  }, [step?.answers]);

  const prevParsedParentsRef = useRef(null);
  useEffect(() => {
    prevParsedParentsRef.current = parsedParentSnapshot;
  }, [parsedParentSnapshot]);

  useEffect(() => {
    if (!step) {
      setPreviewSize(null);
      setParsedParentSnapshot([]);
      return;
    }

    if (Array.isArray(step.parsedParents) && step.parsedParents.length > 0) {
      setParsedParentSnapshot(step.parsedParents);
    }

    if (step.subproblemSize != null) {
      setPreviewSize(step.subproblemSize);
      return;
    }

    if (step.midpoint != null) {
      setPreviewSize(step.midpoint);
    }
  }, [step]);

  const currentTree = useMemo(() => {
    const size = previewSize;
    if (!Number.isInteger(size) || size < 1 || size > answers.length + 1)
      return null;

    const raw = parentsInput
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((x) => Number(x));

    if (raw.length === 0) return null;

    const parentZeroBased = [0];
    for (let i = 0; i < raw.length; i += 1) {
      parentZeroBased.push(raw[i] - 1);
    }

    const treeData = buildTreeData(parentZeroBased, size);
    const game = simulateTreeGameWithTrace(treeData);
    return { ...treeData, ...game, size };
  }, [answers.length, parentsInput, previewSize]);

  const parentZeroBased = useMemo(() => {
    const raw = parentsInput
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((x) => Number(x));

    const result = [0];
    for (let i = 0; i < raw.length; i++) {
      result.push(raw[i] - 1);
    }
    return result;
  }, [parentsInput]);

  const treeFocus = useMemo(() => {
    if (!currentTree?.positions || !step?.focus) return null;

    const { sourceNode, targetNode, direction, phase } = step.focus;
    const sourcePosition = currentTree.positions.get(sourceNode);
    const targetPosition = currentTree.positions.get(targetNode);

    if (!sourcePosition || !targetPosition) return null;

    return {
      sourceNode,
      targetNode,
      sourcePosition,
      targetPosition,
      direction,
      phase,
    };
  }, [currentTree?.positions, step?.focus]);

  const stepKey = step
    ? `${stepIndex}-${step.activeLine}-${step.subproblemSize ?? "root"}-${step.midpoint ?? "none"}`
    : "idle";

  // Calculate source tracking for DP values
  const calculateDPSources = useCallback(() => {
    if (!step?.dpSnapshot || !currentTree) return null;

    const rawSnapshot = step.dpSnapshot;
    const sources = { firstSources: null, secondSources: null, thirdSources: null };

    // For each node, track which child (or self) contributed each value
    try {
      if (rawSnapshot.first && Array.isArray(rawSnapshot.first)) {
        sources.firstSources = rawSnapshot.first.map((val, nodeIdx) => {
          // Find the child that contributed this value
          const childrenValues = currentTree.edges
            ?.filter(e => e.from === nodeIdx)
            .map(e => rawSnapshot.first?.[e.to] || 0) || [];

          const maxChild = childrenValues.length > 0
            ? currentTree.edges
                .filter(e => e.from === nodeIdx)
                .find(e => rawSnapshot.first?.[e.to] === Math.max(...childrenValues))?.to
            : undefined;

          return maxChild !== undefined ? maxChild : nodeIdx;
        });
      }

      if (rawSnapshot.second && Array.isArray(rawSnapshot.second)) {
        sources.secondSources = rawSnapshot.second.map((val, nodeIdx) => {
          const childrenValues = currentTree.edges
            ?.filter(e => e.from === nodeIdx)
            .map(e => rawSnapshot.second?.[e.to] || 0) || [];

          const maxChild = childrenValues.length > 0
            ? currentTree.edges
                .filter(e => e.from === nodeIdx)
                .find(e => rawSnapshot.second?.[e.to] === Math.max(...childrenValues))?.to
            : undefined;

          return maxChild !== undefined ? maxChild : nodeIdx;
        });
      }

      if (rawSnapshot.third && Array.isArray(rawSnapshot.third)) {
        sources.thirdSources = rawSnapshot.third.map((val, nodeIdx) => {
          const childrenValues = currentTree.edges
            ?.filter(e => e.from === nodeIdx)
            .map(e => rawSnapshot.third?.[e.to] || 0) || [];

          const maxChild = childrenValues.length > 0
            ? currentTree.edges
                .filter(e => e.from === nodeIdx)
                .find(e => rawSnapshot.third?.[e.to] === Math.max(...childrenValues))?.to
            : undefined;

          return maxChild !== undefined ? maxChild : nodeIdx;
        });
      }
    } catch (e) {
      // Silently handle if sources can't be calculated
      return null;
    }

    return sources;
  }, [step?.dpSnapshot, currentTree]);

  const dpSources = useMemo(() => calculateDPSources(), [calculateDPSources]);
  const dpSnapshot = step?.dpSnapshot
    ? {
        ...step.dpSnapshot,
        firstSources: dpSources?.firstSources,
        secondSources: dpSources?.secondSources,
        thirdSources: dpSources?.thirdSources,
      }
    : null;

  const currentPhase = step?.phase
    ? step.phase
    : step?.subproblemSize != null
      ? "solve-prefix"
      : step?.midpoint != null
        ? "divide-and-conquer"
        : "idle";

  // Determine active pass
  const isBottomUpPass = step?.activeLine >= 9 && step?.activeLine <= 14;
  const isTopDownPass = step?.activeLine >= 15 && step?.activeLine <= 23;
  const activePass = isBottomUpPass ? "⬆️ Bottom-Up" : isTopDownPass ? "⬇️ Top-Down" : null;

  const summaryCards = [
    { label: "Queries", value: qInput.trim() || "0" },
    { label: "Rendered prefix", value: currentTree?.size ?? "—" },
    { label: "Playback steps", value: steps.length },
    { label: "Final scores", value: answers.length || "—" },
  ];

  const dockPanels = useMemo(() => [
    ...(enabledVizIds.includes('dpDetails') ? [{
      id: "dp-details",
      title: "DP Details",
      subtitle: "Triplet values for each node (first, second, third)",
      defaultZone: "right",
      content: <DPDetailPanel step={step} dpSnapshot={dpSnapshot} />,
    }] : []),
    ...(enabledVizIds.includes('edgeFlow') ? [{
      id: "edge-flow",
      title: "Edge Flow",
      subtitle: "Direction and depth value flowing through edges",
      defaultZone: "right",
      content: <EdgeFlowOverlay step={step} currentTree={currentTree} />,
    }] : []),
    ...(enabledVizIds.includes('comparisons') ? [{
      id: "comparisons",
      title: "Critical Decision",
      subtitle: "When and why different depths are chosen",
      defaultZone: "right",
      content: <ComparisonBox step={step} dpSnapshot={dpSnapshot} />,
    }] : []),
    ...(enabledVizIds.includes('rankHighlight') ? [{
      id: "rank-highlight",
      title: "Rank Highlights",
      subtitle: "Color-coded ranking of DP values",
      defaultZone: "right",
      content: <RankHighlightOverlay dpSnapshot={dpSnapshot} limit={15} />,
    }] : []),
    ...(enabledVizIds.includes('insertBreakdown') ? [{
      id: "insert-breakdown",
      title: "InsertTop3 Breakdown",
      subtitle: "Step-by-step comparison and insertion logic",
      defaultZone: "right",
      content: <InsertTop3Breakdown step={step} dpSnapshot={dpSnapshot} />,
    }] : []),
    ...(enabledVizIds.includes('bottomUp') ? [{
      id: "bottom-up",
      title: "Bottom-Up Details",
      subtitle: "Which children feed each node's triplet",
      defaultZone: "right",
      content: <BottomUpDetailsPanel step={step} currentTree={currentTree} dpSnapshot={dpSnapshot} parentZeroBased={parentZeroBased} />,
    }] : []),
    ...(enabledVizIds.includes('traversalTrail') ? [{
      id: "traversal",
      title: "Traversal Trail",
      subtitle: "Breadcrumb of visited nodes in current pass",
      defaultZone: "right",
      content: <TraversalTrail step={step} currentTree={currentTree} parentZeroBased={parentZeroBased} />,
    }] : []),
    ...(enabledVizIds.includes('valueSource') ? [{
      id: "value-source",
      title: "Value Source Tracking",
      subtitle: "Where each depth value comes from",
      defaultZone: "right",
      content: <ValueSourceTracking step={step} dpSnapshot={dpSnapshot} parentZeroBased={parentZeroBased} />,
    }] : []),
    {
      id: "input",
      title: "Input Playground",
      subtitle: inputError ? "Fix the input to resume playback." : "Edit the tree and replay the solver.",
      defaultZone: "left",
      content: (
        <div className="gogt-panel-body">
          <div className="gogt-examples">
            {EXAMPLES.map((example) => (
              <button
                key={example.label}
                type="button"
                className="gogt-example-btn"
                onClick={() => handleExampleClick(example)}
              >
                {example.label}
              </button>
            ))}
          </div>

          <label className="gogt-field">
            <span>q insertions</span>
            <input
              className="gogt-input"
              value={qInput}
              onChange={(event) => setQInput(event.target.value)}
            />
          </label>

          <label className="gogt-field">
            <span>Parent list</span>
            <textarea
              className="gogt-textarea"
              value={parentsInput}
              onChange={(event) => setParentsInput(event.target.value)}
            />
          </label>

          {inputError ? (
            <div className="gogt-error">{inputError}</div>
          ) : (
            <div className="gogt-output-wrap">
              <div className="gogt-output-label">Final answers</div>
              <div className="gogt-output mono">{answers.join(" ")}</div>
            </div>
          )}

          <div className="gogt-parent-strip">
            <div className="gogt-output-label">Parent parsing preview</div>
            <div className="gogt-parent-grid">
              {(parsedParentSnapshot.length > 0
                ? parsedParentSnapshot
                : parentsInput
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((value) => Number(value) - 1)
              ).map((value, idx) => {
                const isActive = step?.currentParentIndex === idx;
                const prevValue = prevParsedParentsRef.current?.[idx];
                const wasRevealed = prevValue != null;

                return (
                  <div key={`parent-${idx}`} className="gogt-parent-column">
                    <div className="gogt-parent-column-label">node {idx + 2}</div>
                    <div
                      className={`gogt-parent-cell ${isActive ? "active" : ""} ${wasRevealed ? "revealed" : ""}`}
                    >
                      <span>{Number.isFinite(value) ? value + 1 : "?"}</span>
                      <small>parent</small>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="gogt-parent-note">
              Input is 1-indexed. The solver immediately stores parents in 0-based
              form for the DP passes.
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "storyboard",
      title: "Playback Storyboard",
      subtitle: step ? `Step ${stepIndex + 1} of ${steps.length}` : "Press play to start.",
      defaultZone: "right",
      content: (
        <div className="gogt-panel-body">
          <div className="gogt-step-overview">
            <div className="gogt-step-pill">{currentPhase}</div>
            <div className="gogt-step-copy">
              <strong>
                {step ? `Line ${step.activeLine}` : "Playback not started"}
              </strong>
              <p>
                {step
                  ? step.message
                  : "Start playback to see the parent parsing, midpoint selection, DP propagation, and answer filling."}
              </p>
            </div>
          </div>

          <div className="gogt-metrics">
            <div className="gogt-metric-card">
              <span>Interval</span>
              <strong>
                {step?.intervalLeft != null && step?.intervalRight != null
                  ? `[${step.intervalLeft}, ${step.intervalRight}]`
                  : "—"}
              </strong>
            </div>
            <div className="gogt-metric-card">
              <span>Midpoint</span>
              <strong>{step?.midpoint ?? "—"}</strong>
            </div>
            <div className="gogt-metric-card">
              <span>Computed value</span>
              <strong>{step?.computedValue ?? "—"}</strong>
            </div>
            <div className="gogt-metric-card">
              <span>Stack size</span>
              <strong>{step?.stackSize ?? 0}</strong>
            </div>
          </div>

          <div className="gogt-stack-row">
            <Stack3D
              label="interval stack"
              items={step?.stack?.map(([left, right]) => `[${left} — ${right}]`) ?? []}
              emptyText="empty"
              topBadge="top"
              highlightIndex={step?.stack ? step.stack.length - 1 : -1}
            />
          </div>

          <div className="gogt-output-wrap">
            <div className="gogt-output-label">Partial answers at this step</div>
            <PartialAnswersPanel
              label=""
              answers={step?.answers ?? []}
              prevAnswers={prevAnswersRef.current}
              labelPrefix="a"
            />
          </div>
        </div>
      ),
    },
    {
      id: "code",
      title: "Simplified Solution Trace",
      subtitle: step ? `Active line ${step.activeLine}` : "Line-by-line solution view.",
      defaultZone: "full",
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          title="Simplified Solution Trace"
          subtitle={
            step
              ? `Active line ${step.activeLine}: ${step.message}`
              : "Trace your simplified Codeforces solution line-by-line."
          }
          autoScroll={autoScrollCode}
          onActiveLineDomChange={setActiveLineDom}
        />
      ),
    },
    {
      id: "tree",
      title: "Tree State Preview",
      subtitle: currentTree?.size ? `Prefix size ${currentTree.size}` : "Waiting for a rendered prefix.",
      defaultZone: "full",
      content: (
        <TreeStatePanel
          currentTree={currentTree}
          treeFocus={treeFocus}
          stepKey={stepKey}
          dpSnapshot={dpSnapshot}
          maxTreeNodesToRender={MAX_TREE_NODES_TO_RENDER}
          step={step}
          parentZeroBased={parentZeroBased}
          showTraversalTrail={enabledVizIds.includes('traversalTrail')}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode}
        />
      ),
    },
  ], [enabledVizIds, step, dpSnapshot, currentTree, parentZeroBased, qInput, parentsInput, parsedParentSnapshot, inputError, answers, steps, stepIndex, currentPhase, treeFocus, stepKey, selectedNode]);

  return (
    <div className="gogt-shell">
      <section className="gogt-hero">
        <div className="gogt-hero-copy">
          <span className="gogt-kicker">Codeforces F • Tree game + DP</span>
          <h2>See how each prefix of the growing tree gets solved.</h2>
          <p>
            This walkthrough combines the divide-and-conquer outer loop, the
            `first/second/third` DP arrays, and a live tree preview so the score
            update is easier to follow at every step.
          </p>
        </div>

        <div className="gogt-summary-grid">
          {summaryCards.map((card) => (
            <div key={card.label} className="gogt-summary-card">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* View Mode Toggle */}
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        padding: '12px 18px',
        background: 'rgba(30, 41, 59, 0.5)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        zIndex: 100,
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#94a3b8',
        }}>
          {viewMode === 'panels' ? 'Panel View' : 'Structure View'}
        </span>
        <button
          onClick={() => setViewMode(viewMode === 'panels' ? 'dual-rep' : 'panels')}
          style={{
            padding: '6px 12px',
            background: viewMode === 'dual-rep' ? 'rgba(59, 130, 246, 0.9)' : 'rgba(100, 116, 139, 0.5)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '6px',
            color: '#e2e8f0',
            fontWeight: 600,
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.background = viewMode === 'dual-rep' ? 'rgba(59, 130, 246, 1)' : 'rgba(100, 116, 139, 0.7)'}
          onMouseLeave={(e) => e.target.style.background = viewMode === 'dual-rep' ? 'rgba(59, 130, 246, 0.9)' : 'rgba(100, 116, 139, 0.5)'}
        >
          {viewMode === 'panels' ? '⟨→⟩ Structure' : '⊞ Panels'}
        </button>
      </div>
      <div style={{ position: 'relative', minHeight: viewMode === 'dual-rep' ? '600px' : 'auto' }}>
        {viewMode === 'panels' ? (
          <>
            <TreeDPConnector
              treeNodePositions={currentTree?.positions}
              highlightNode={selectedNode}
              dpCellPositions={{}}
            />
            <DockableWorkspace
              title="Game On Growing Tree Workspace"
              panels={dockPanels}
              initialLayout={{
                rows: [
                  ["input", "storyboard"],
                  ["tree", "code"],
                ],
                minimized: [],
              }}
            />
          </>
        ) : (
          <DualRepresentationView
            step={step}
            steps={steps}
            stepIndex={stepIndex}
            dpSnapshot={dpSnapshot}
            totalNodes={currentTree?.size ?? 0}
            pruningAnalysis={pruningAnalysis}
            situationAnalysis={situation}
          />
        )}
      </div>

      {situation && (
        <SituationOverlay
          situation={situation}
          step={step}
          stepIndex={stepIndex}
          totalSteps={steps.length}
        />
      )}

      {activePass && !situation && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, rgba(76, 110, 245, 0.9), rgba(61, 95, 217, 0.9))',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          fontWeight: 700,
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(76, 110, 245, 0.3)',
          zIndex: 999,
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          {activePass}
        </div>
      )}

      {selectedNode !== null && (
        <FloatingPanel title={`Selected: Node ${selectedNode}`} style={{ position: 'fixed', bottom: '20px', right: '420px', zIndex: 1000, maxWidth: '300px' }}>
          <div style={{ padding: '12px', display: 'grid', gap: '8px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>Node {selectedNode}</div>
              <div>1st: {dpSnapshot?.first[selectedNode] || 0}</div>
              <div>2nd: {dpSnapshot?.second[selectedNode] || 0}</div>
              <div>3rd: {dpSnapshot?.third[selectedNode] || 0}</div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              style={{
                padding: '6px 12px',
                background: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '12px'
              }}
            >
              Clear Selection
            </button>
          </div>
        </FloatingPanel>
      )}

      <FloatingPanel title="Playback Controls">
        <PlaybackControls
          onReset={handleReset}
          onPrev={stepBack}
          onPlayToggle={togglePlay}
          onNext={stepForward}
          resetDisabled={steps.length === 0}
          prevDisabled={stepIndex <= 0}
          nextDisabled={steps.length === 0 || isDone}
          isPlaying={isPlaying}
          isDone={isDone}
          speed={speed}
          onSpeedChange={(event) => setSpeed(Number(event.target.value))}
          speedIndicator={`${speed}ms`}
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
          autoScrollLabel="Auto-scroll code"
          showAutoScroll
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
        <VisualizationControls
          features={vizFeatures}
          onToggle={toggleVizFeature}
        />
      </FloatingPanel>

      {showPatternOverlay && step && (
        <PatternOverlay step={step} activeLineDom={activeLineDom} />
      )}
    </div>
  );
}

