import { useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import FloatingPanel from "../../components/shared/FloatingPanel";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";

import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from "../../config/examplesRegistry";

import "./LRUCacheVisualizer.css";

// ─── Pattern annotations ───────────────────────────────────────────────────

const SOLUTION_CODE = [
  { line: 1, text: "class Node:" },
  { line: 2, text: "    def __init__(self, key, val):" },
  { line: 3, text: "        self.key, self.val = key, val" },
  { line: 4, text: "        self.prev = self.next = None" },
  { line: 5, text: "" },
  { line: 6, text: "class LRUCache:" },
  { line: 7, text: "    def __init__(self, capacity: int):" },
  { line: 8, text: "        self.cap = capacity" },
  { line: 9, text: "        self.cache = {}" },
  {
    line: 10,
    text: "        self.left, self.right = Node(0, 0), Node(0, 0)",
  },
  {
    line: 11,
    text: "        self.left.next, self.right.prev = self.right, self.left",
  },
  { line: 12, text: "" },
  { line: 13, text: "    def remove(self, node):" },
  { line: 14, text: "        prv, nxt = node.prev, node.next" },
  { line: 15, text: "        prv.next, nxt.prev = nxt, prv" },
  { line: 16, text: "" },
  { line: 17, text: "    def insert(self, node):" },
  {
    line: 18,
    text: "        prv, nxt = self.right.prev, self.right",
  },
  {
    line: 19,
    text: "        prv.next = nxt.prev = node",
  },
  {
    line: 20,
    text: "        node.prev, node.next = prv, nxt",
  },
  { line: 21, text: "" },
  {
    line: 22,
    text: "    def get(self, key: int) -> int:",
  },
  {
    line: 23,
    text: "        if key in self.cache:",
  },
  {
    line: 24,
    text: "            self.remove(self.cache[key])",
  },
  {
    line: 25,
    text: "            self.insert(self.cache[key])",
  },
  {
    line: 26,
    text: "            return self.cache[key].val",
  },
  {
    line: 27,
    text: "        return -1",
  },
  { line: 28, text: "" },
  {
    line: 29,
    text: "    def put(self, key: int, value: int) -> None:",
  },
  {
    line: 30,
    text: "        if key in self.cache:",
  },
  {
    line: 31,
    text: "            self.remove(self.cache[key])",
  },
  {
    line: 32,
    text: "        self.cache[key] = Node(key, value)",
  },
  {
    line: 33,
    text: "        self.insert(self.cache[key])",
  },
  { line: 34, text: "" },
  {
    line: 35,
    text: "        if len(self.cache) > self.cap:",
  },
  {
    line: 36,
    text: "            lru = self.left.next",
  },
  {
    line: 37,
    text: "            self.remove(lru)",
  },
  {
    line: 38,
    text: "            del self.cache[lru.key]",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function cloneCache(cache) {
  return Object.fromEntries(
    Object.entries(cache).map(([key, node]) => [
      key,
      {
        ...node,
      },
    ]),
  );
}

function cloneHistory(history) {
  return history.map((item) => ({
    ...item,
    cacheState: item.cacheState
      ? item.cacheState.map((entry) => ({ ...entry }))
      : [],
  }));
}

function cacheStateFromList(cache, list) {
  return list
    .map((key) => cache[key])
    .filter(Boolean)
    .map((node) => ({
      key: node.key,
      val: node.val,
    }));
}

function formatCacheState(cache, list) {
  const entries = cacheStateFromList(cache, list);

  if (entries.length === 0) {
    return "empty";
  }

  return entries.map((entry) => `${entry.key}:${entry.val}`).join(" → ");
}

// ─── Step generation ───────────────────────────────────────────────────────

function generateSteps(commands, argsList) {
  const steps = [];

  if (
    !Array.isArray(commands) ||
    commands.length === 0 ||
    commands[0] !== "LRUCache"
  ) {
    steps.push({
      phase: "done",
      cache: {},
      list: [],
      capacity: 0,
      outputs: [],
      history: [],
      activeLine: 6,
      message:
        "Invalid commands sequence. Must start with LRUCache initialization.",
      statusType: "fail",
    });

    return steps;
  }

  const firstArgs = Array.isArray(argsList?.[0]) ? argsList[0] : [];
  const parsedCapacity = Number(firstArgs[0]);

  const capacity =
    Number.isFinite(parsedCapacity) && parsedCapacity >= 0 ? parsedCapacity : 0;

  let cache = {};
  let list = [];
  let outputs = [null];
  let history = [];

  const addStep = ({
    phase,
    activeLine,
    message,
    currCmd,
    currArgs,
    cmdIndex,
    statusType = "normal",
    focusKey = null,
    evicted = null,
  }) => {
    steps.push({
      phase,
      cache: cloneCache(cache),
      list: [...list],
      capacity,
      outputs: [...outputs],
      history: cloneHistory(history),
      activeLine,
      message,
      currCmd,
      currArgs: Array.isArray(currArgs) ? [...currArgs] : currArgs,
      cmdIndex,
      statusType,
      focusKey,
      evicted: evicted ? { ...evicted } : null,
    });
  };

  history.push({
    id: "command-0",
    cmdIndex: 0,
    type: "init",
    command: `LRUCache(${capacity})`,
    title: `LRUCache(${capacity})`,
    detail: `Created an empty LRU cache with capacity ${capacity}.`,
    output: null,
    cacheState: [],
  });

  addStep({
    phase: "init",
    activeLine: 7,
    cmdIndex: 0,
    currCmd: "LRUCache",
    currArgs: [capacity],
    statusType: "success",
    message: `Initialize LRUCache with capacity ${capacity}. Create dummy LEFT and RIGHT nodes.`,
  });

  for (let i = 1; i < commands.length; i++) {
    const cmd = commands[i];
    const args = Array.isArray(argsList?.[i]) ? argsList[i] : [];

    addStep({
      phase: `cmd_${i}_start`,
      activeLine: cmd === "get" ? 22 : 29,
      currCmd: cmd,
      currArgs: args,
      cmdIndex: i,
      focusKey: args[0] ?? null,
      message: `Execute ${cmd}(${args.join(", ")}).`,
    });

    // ─────────────────────────────────────────────────────────────────────
    // GET
    // ─────────────────────────────────────────────────────────────────────

    if (cmd === "get") {
      const key = args[0];

      addStep({
        phase: `cmd_${i}_check`,
        activeLine: 23,
        currCmd: cmd,
        currArgs: args,
        cmdIndex: i,
        focusKey: key,
        message: `Check whether key ${key} exists in the hash map.`,
      });

      if (Object.prototype.hasOwnProperty.call(cache, key)) {
        const value = cache[key].val;

        list = list.filter((existingKey) => existingKey !== key);

        addStep({
          phase: `cmd_${i}_remove`,
          activeLine: 24,
          currCmd: cmd,
          currArgs: args,
          cmdIndex: i,
          focusKey: key,
          message: `Key ${key} exists with value ${value}. Remove it from its current linked-list position.`,
        });

        list.push(key);

        addStep({
          phase: `cmd_${i}_insert`,
          activeLine: 25,
          currCmd: cmd,
          currArgs: args,
          cmdIndex: i,
          focusKey: key,
          message: `Move key ${key} to the MRU side because it was just accessed.`,
        });

        outputs.push(value);

        history.push({
          id: `command-${i}`,
          cmdIndex: i,
          type: "get-hit",
          command: `get(${key})`,
          title: `get(${key}) → ${value}`,
          detail: `Cache hit. Key ${key} maps to value ${value}. The node was moved to the MRU side.`,
          output: value,
          key,
          value,
          cacheState: cacheStateFromList(cache, list),
        });

        addStep({
          phase: `cmd_${i}_return`,
          activeLine: 26,
          currCmd: cmd,
          currArgs: args,
          cmdIndex: i,
          focusKey: key,
          statusType: "success",
          message: `Cache hit: ${key} → ${value}. Return ${value} and mark key ${key} as most recently used.`,
        });
      } else {
        outputs.push(-1);

        history.push({
          id: `command-${i}`,
          cmdIndex: i,
          type: "get-miss",
          command: `get(${key})`,
          title: `get(${key}) → -1`,
          detail: `Cache miss. Key ${key} is not currently stored in the cache.`,
          output: -1,
          key,
          cacheState: cacheStateFromList(cache, list),
        });

        addStep({
          phase: `cmd_${i}_notfound`,
          activeLine: 27,
          currCmd: cmd,
          currArgs: args,
          cmdIndex: i,
          focusKey: key,
          statusType: "fail",
          message: `Cache miss: key ${key} is not in the cache. Return -1.`,
        });
      }

      continue;
    }

    // ─────────────────────────────────────────────────────────────────────
    // PUT
    // ─────────────────────────────────────────────────────────────────────

    if (cmd === "put") {
      const key = args[0];
      const val = args[1];

      const existed = Object.prototype.hasOwnProperty.call(cache, key);
      const previousValue = existed ? cache[key].val : undefined;

      addStep({
        phase: `cmd_${i}_check`,
        activeLine: 30,
        currCmd: cmd,
        currArgs: args,
        cmdIndex: i,
        focusKey: key,
        message: `Check whether key ${key} already exists in the cache.`,
      });

      if (existed) {
        list = list.filter((existingKey) => existingKey !== key);

        addStep({
          phase: `cmd_${i}_remove_exist`,
          activeLine: 31,
          currCmd: cmd,
          currArgs: args,
          cmdIndex: i,
          focusKey: key,
          message: `Key ${key} already exists with value ${previousValue}. Remove its old linked-list position before updating it.`,
        });
      }

      cache[key] = {
        key,
        val,
      };

      addStep({
        phase: `cmd_${i}_create`,
        activeLine: 32,
        currCmd: cmd,
        currArgs: args,
        cmdIndex: i,
        focusKey: key,
        message: existed
          ? `Replace key ${key}'s old value ${previousValue} with ${val}.`
          : `Create Node(${key}, ${val}) and store key ${key} in the hash map.`,
      });

      list.push(key);

      addStep({
        phase: `cmd_${i}_insert`,
        activeLine: 33,
        currCmd: cmd,
        currArgs: args,
        cmdIndex: i,
        focusKey: key,
        message: `Place ${key} → ${val} at the MRU side of the doubly linked list.`,
      });

      addStep({
        phase: `cmd_${i}_check_cap`,
        activeLine: 35,
        currCmd: cmd,
        currArgs: args,
        cmdIndex: i,
        focusKey: key,
        message: `Cache currently contains ${Object.keys(cache).length} item${
          Object.keys(cache).length === 1 ? "" : "s"
        }. Capacity is ${capacity}.`,
      });

      let evicted = null;

      if (Object.keys(cache).length > capacity) {
        const lruKey = list[0];
        const lruNode = cache[lruKey];

        evicted = {
          key: lruKey,
          val: lruNode?.val,
        };

        addStep({
          phase: `cmd_${i}_lru`,
          activeLine: 36,
          currCmd: cmd,
          currArgs: args,
          cmdIndex: i,
          focusKey: lruKey,
          evicted,
          statusType: "warning",
          message: `Capacity exceeded. The leftmost real node is the LRU entry: ${lruKey} → ${lruNode?.val}.`,
        });

        list.shift();

        addStep({
          phase: `cmd_${i}_remove_lru`,
          activeLine: 37,
          currCmd: cmd,
          currArgs: args,
          cmdIndex: i,
          focusKey: lruKey,
          evicted,
          statusType: "warning",
          message: `Remove LRU node ${lruKey} → ${lruNode?.val} from the linked list.`,
        });

        delete cache[lruKey];

        addStep({
          phase: `cmd_${i}_del_lru`,
          activeLine: 38,
          currCmd: cmd,
          currArgs: args,
          cmdIndex: i,
          focusKey: lruKey,
          evicted,
          statusType: "warning",
          message: `Evicted ${lruKey} → ${lruNode?.val}. It is no longer stored in the hash map.`,
        });
      }

      outputs.push(null);

      const cacheState = cacheStateFromList(cache, list);

      let detail;

      if (evicted) {
        detail = `Inserted ${key} → ${val}. Capacity was exceeded, so LRU entry ${evicted.key} → ${evicted.val} was evicted.`;
      } else if (existed) {
        detail = `Updated key ${key} from ${previousValue} to ${val} and moved it to the MRU side.`;
      } else {
        detail = `Inserted ${key} → ${val} and placed it at the MRU side.`;
      }

      history.push({
        id: `command-${i}`,
        cmdIndex: i,
        type: evicted ? "put-evict" : existed ? "put-update" : "put",
        command: `put(${key}, ${val})`,
        title: `put(${key}, ${val})`,
        detail,
        output: null,
        key,
        value: val,
        previousValue,
        evicted,
        cacheState,
      });

      addStep({
        phase: `cmd_${i}_done`,
        activeLine: evicted ? 38 : 35,
        currCmd: cmd,
        currArgs: args,
        cmdIndex: i,
        focusKey: key,
        evicted,
        statusType: evicted ? "warning" : "success",
        message: evicted
          ? `put(${key}, ${val}) complete. Evicted LRU entry ${evicted.key} → ${evicted.val}. Current cache: ${formatCacheState(
              cache,
              list,
            )}.`
          : `put(${key}, ${val}) complete. Current cache: ${formatCacheState(
              cache,
              list,
            )}.`,
      });

      continue;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Unknown command
    // ─────────────────────────────────────────────────────────────────────

    outputs.push(null);

    history.push({
      id: `command-${i}`,
      cmdIndex: i,
      type: "unknown",
      command: `${cmd}(${args.join(", ")})`,
      title: `${cmd}(${args.join(", ")})`,
      detail: `Unknown command "${cmd}".`,
      output: null,
      cacheState: cacheStateFromList(cache, list),
    });

    addStep({
      phase: `cmd_${i}_unknown`,
      activeLine: 6,
      currCmd: cmd,
      currArgs: args,
      cmdIndex: i,
      statusType: "fail",
      message: `Unknown command "${cmd}". Expected "get" or "put".`,
    });
  }

  steps.push({
    phase: "done",
    cache: cloneCache(cache),
    list: [...list],
    capacity,
    outputs: [...outputs],
    history: cloneHistory(history),
    activeLine: 6,
    message: `All commands executed. Final cache: ${formatCacheState(
      cache,
      list,
    )}.`,
    statusType: "success",
  });

  return steps;
}

const EXAMPLES = getExamples("lrucache");

// ─── Component ─────────────────────────────────────────────────────────────

export default function LRUCacheVisualizer() {
  const [commandsInput, setCommandsInput] = useState(
    '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]',
  );

  const [argsInput, setArgsInput] = useState(
    "[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]",
  );

  const [autoScrollCode, setAutoScrollCode] = useAutoScroll();

  const { showPatternOverlay, setShowPatternOverlay, setActiveLineDom } =
    usePatternOverlay();

  const { commands, argsList, inputError } = useMemo(() => {
    try {
      const cmds = JSON.parse(commandsInput);
      const args = JSON.parse(argsInput);

      if (!Array.isArray(cmds) || !Array.isArray(args)) {
        throw new Error("Commands and arguments must both be arrays.");
      }

      if (cmds.length !== args.length) {
        throw new Error(
          "Commands and arguments must be arrays of equal length.",
        );
      }

      if (cmds.length === 0) {
        throw new Error("At least one command is required.");
      }

      return {
        commands: cmds,
        argsList: args,
        inputError: "",
      };
    } catch (error) {
      return {
        commands: ["LRUCache", "put", "put", "get", "put"],
        argsList: [[2], [1, 1], [2, 2], [1], [3, 3]],
        inputError: error.message || "Invalid JSON format.",
      };
    }
  }, [commandsInput, argsInput]);

  const steps = useMemo(
    () => generateSteps(commands, argsList),
    [commands, argsList],
  );

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
  } = usePlaybackState(steps.length);

  const step = stepIndex >= 0 ? steps[stepIndex] : null;

  const applyExample = useCallback(
    (example) => {
      setCommandsInput(JSON.stringify(example.commands));
      setArgsInput(JSON.stringify(example.argsList));
      handleReset();
    },
    [handleReset],
  );

  // ─── Input panel ────────────────────────────────────────────────────────

  const inputPanel = (
    <div className="vis-panel-body lru-panel-body">
      <div className="lru-example-row">
        {EXAMPLES.map((example) => (
          <button
            key={example.label}
            type="button"
            onClick={() => applyExample(example)}
            className="vis-example-btn lru-example-btn"
          >
            {example.label}
          </button>
        ))}
      </div>

      

      {inputError && <div className="lru-input-error">{inputError}</div>}

      <div className="lru-commands-list">
        {commands.map((cmd, index) => {
          const isActive = step?.cmdIndex === index;

          const isPassed =
            step?.phase === "done" ||
            (typeof step?.cmdIndex === "number" && step.cmdIndex > index);

          const output = step?.outputs?.[index];
          const args = Array.isArray(argsList[index]) ? argsList[index] : [];

          return (
            <div
              key={`${cmd}-${index}`}
              className={[
                "lru-cmd-item",
                isActive ? "active" : "",
                isPassed ? "passed" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="lru-cmd-idx">{index}</span>

              <span className="lru-cmd-name">{cmd}</span>

              <span className="lru-cmd-args">({args.join(", ")})</span>

              <span className="lru-cmd-output">
                {output !== undefined
                  ? `→ ${output === null ? "null" : output}`
                  : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── Visualization panel ────────────────────────────────────────────────

  const vizPanel = (
    <>
      <ManualInputPanel
        fields={[
          {
            key: "commands",
            label: "commands",
            type: "array",
          },
          {
            key: "argsList",
            label: "args",
            type: "array",
          },
        ]}
        values={{
          commands: commandsInput,
          argsList: argsInput,
        }}
        onChange={(key, value) => {
          if (key === "commands") {
            setCommandsInput(value);
          }

          if (key === "argsList") {
            setArgsInput(value);
          }

          handleReset();
        }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

      <div className="vis-panel-body lru-panel-body lru-visuals">
        {/* Current operation */}
        <div className="lru-current-operation">
          <div className="lru-current-operation-header">
            <span className="lru-section-title">Current Operation</span>

            {step?.cmdIndex !== undefined && (
              <span className="lru-operation-index">#{step.cmdIndex}</span>
            )}
          </div>

          <div className="lru-current-operation-body">
            {step?.currCmd ? (
              <>
                <div className="lru-current-command">
                  {step.currCmd}
                  <span className="lru-current-command-args">
                    ({step.currArgs?.join(", ")})
                  </span>
                </div>

                <div className="lru-current-message">{step.message}</div>
              </>
            ) : (
              <div className="lru-current-message">
                {step?.message || "Press Next or Play to begin."}
              </div>
            )}

            {step?.evicted && (
              <div className="lru-eviction-banner">
                <span className="lru-eviction-label">EVICTED</span>

                <span className="lru-eviction-value">
                  {step.evicted.key} → {step.evicted.val}
                </span>

                <span className="lru-eviction-reason">least recently used</span>
              </div>
            )}
          </div>
        </div>

        {/* Linked List visualization */}
        <div className="lru-list-container">
          <span className="lru-section-title">
            Doubly Linked List
            <span className="lru-section-subtitle">
              LEFT = LRU · RIGHT = MRU
            </span>
          </span>

          <div className="lru-list-track">
            <div className="lru-dummy-node">
              LEFT
              <span className="lru-dummy-caption">LRU</span>
            </div>

            <AnimatePresence mode="popLayout">
              {step?.list?.map((key) => {
                const node = step.cache[key];

                if (!node) {
                  return null;
                }

                const isActive =
                  step.focusKey === key || step.currArgs?.[0] === key;

                return (
                  <motion.div
                    key={key}
                    layout
                    initial={{
                      opacity: 0,
                      scale: 0.5,
                      y: -20,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.5,
                      y: 20,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                    className={["lru-node", isActive ? "active" : ""]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="lru-node-label">key</div>

                    <div className="lru-node-key">{node.key}</div>

                    <div className="lru-node-label">value</div>

                    <div className="lru-node-val">{node.val}</div>

                    <div className="lru-node-connector" />
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <div className="lru-dummy-node right">
              RIGHT
              <span className="lru-dummy-caption">MRU</span>
            </div>
          </div>
        </div>

        {/* Hash Map visualization */}
        <div className="lru-map-container">
          <div className="lru-map-header">
            <span className="lru-section-title">Hash Map (self.cache)</span>

            <span className="lru-capacity-badge">
              Size: {Object.keys(step?.cache || {}).length} /{" "}
              {step?.capacity ?? 0}
            </span>
          </div>

          <div className="lru-map-grid">
            <AnimatePresence mode="popLayout">
              {step &&
                Object.entries(step.cache).map(([keyString, node]) => {
                  const numericKey = Number(keyString);

                  const actualKey = Number.isNaN(numericKey)
                    ? keyString
                    : numericKey;

                  const isActive =
                    step.focusKey === actualKey ||
                    step.currArgs?.[0] === actualKey;

                  return (
                    <motion.div
                      key={`map-${keyString}`}
                      layout
                      initial={{
                        opacity: 0,
                        scale: 0.8,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.8,
                      }}
                      className={["lru-map-entry", isActive ? "active" : ""]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span className="lru-map-key">{keyString}</span>

                      <span className="lru-map-arrow">→</span>

                      <span className="lru-map-ptr">
                        Node({node.key}, {node.val})
                      </span>
                    </motion.div>
                  );
                })}
            </AnimatePresence>

            {(!step || Object.keys(step.cache).length === 0) && (
              <span className="lru-empty-message">Cache is empty</span>
            )}
          </div>
        </div>

        {/* Operation history */}
        <div className="lru-history-container">
          <div className="lru-history-header">
            <span className="lru-section-title">
              Operation History
              <span className="lru-section-subtitle">
                See where each key/value went
              </span>
            </span>

            <span className="lru-history-count">
              {step?.history?.length || 0} completed
            </span>
          </div>

          <div className="lru-history-list">
            {!step?.history?.length && (
              <div className="lru-history-empty">
                Execute commands to build the history.
              </div>
            )}

            {step?.history?.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className={[
                  "lru-history-item",
                  `lru-history-${item.type}`,
                ].join(" ")}
              >
                <div className="lru-history-index">{item.cmdIndex}</div>

                <div className="lru-history-content">
                  <div className="lru-history-title-row">
                    <span className="lru-history-title">{item.title}</span>

                    {item.type === "get-hit" && (
                      <span className="lru-history-tag hit">HIT</span>
                    )}

                    {item.type === "get-miss" && (
                      <span className="lru-history-tag miss">MISS</span>
                    )}

                    {item.evicted && (
                      <span className="lru-history-tag evict">EVICTION</span>
                    )}

                    {item.type === "put-update" && (
                      <span className="lru-history-tag update">UPDATE</span>
                    )}
                  </div>

                  <div className="lru-history-detail">{item.detail}</div>

                  {item.evicted && (
                    <div className="lru-history-eviction">
                      <span>Removed from cache:</span>
                      <strong>
                        {item.evicted.key} → {item.evicted.val}
                      </strong>
                    </div>
                  )}

                  <div className="lru-history-cache-state">
                    <span className="lru-history-cache-label">
                      Cache after operation:
                    </span>

                    {item.cacheState?.length ? (
                      <div className="lru-history-cache-items">
                        {item.cacheState.map((entry, entryIndex) => (
                          <span
                            key={`${item.id}-${entry.key}-${entryIndex}`}
                            className="lru-history-cache-chip"
                          >
                            {entry.key} → {entry.val}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="lru-history-cache-empty">empty</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // ─── Code panel ─────────────────────────────────────────────────────────

  const codePanel = (
    <div
      style={{
        position: "relative",
        height: "100%",
      }}
    >
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        onActiveLineDomChange={setActiveLineDom}
        autoScroll={autoScrollCode}
        disableResizer
      />

      {showPatternOverlay && <CodePatternAnnotations step={step} />}
    </div>
  );

  // ─── Status panel ───────────────────────────────────────────────────────

  const statusPanel = (
    <div
      className={[
        "lru-status",
        step?.statusType === "success" ? "success" : "",
        step?.statusType === "fail" ? "fail" : "",
        step?.statusType === "warning" ? "warning" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {step?.message || "Ready to execute commands."}
    </div>
  );

  // ─── Playback panel ─────────────────────────────────────────────────────

  const playbackPanel = (
    <>
      <PlaybackControls
        onReset={handleReset}
        onPrev={stepBack}
        onPlayToggle={togglePlay}
        onNext={stepForward}
        resetDisabled={steps.length === 0}
        prevDisabled={stepIndex < 0}
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

      {showPatternOverlay && <PatternLegend />}
    </>
  );

  // ─── Dock configuration ─────────────────────────────────────────────────

  const [panelDivs, setPanelDivs] = useState(null);

  const panelConfigs = useMemo(
    () => [
      {
        id: "input",
        title: "Sequence Commands",
        dockMode: "split-right",
      },
      {
        id: "viz",
        title: "Doubly Linked List & Hash Map",
        dockMode: "split-right",
      },
      {
        id: "code",
        title: "Code Trace",
        dockMode: "split-right",
      },
      {
        id: "status",
        title: "Status",
        dockMode: "split-bottom",
        ratio: 0.08,
      },
    ],
    [],
  );

  const handlePanelReady = useCallback((divs) => {
    setPanelDivs(divs);
  }, []);

  return (
    <div className="vis-shell lru-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />

      {panelDivs && (
        <>
          {panelDivs.input && createPortal(inputPanel, panelDivs.input)}

          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}

          {panelDivs.code && createPortal(codePanel, panelDivs.code)}

          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}

      {createPortal(
        <FloatingPanel title="Playback Controls">
          {playbackPanel}
        </FloatingPanel>,
        document.body,
      )}
    </div>
  );
}
