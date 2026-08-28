import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PlaybackControls from "../components/PlaybackControls";
import LuminoDockPanel from "../components/LuminoDockPanel";
import { usePlaybackState } from "../hooks/usePlaybackState";
import {
  DEFAULT_PLAYGROUND_CODE,
  buildDeclarationPreview,
  runVisualizationSource,
} from "./runtime";
import { inferPythonInput } from "./runtime/inferPythonInput";
import { normalizePastedPythonSource } from "./runtime/normalizePythonSource";
import {
  DEFAULT_PYTHON_CODE,
  DEFAULT_PYTHON_INPUT,
  compilePythonTrace,
  createDefaultPythonBindings,
  runPythonTrace,
} from "./runtime/python";
import { suggestPythonBindings } from "./ai/suggestPythonBindings";
import VisualizationCanvas from "./renderers/VisualizationCanvas";
import PythonTraceControls from "./PythonTraceControls";
import RuntimeCodeEditor from "./RuntimeCodeEditor";
import "./RuntimePlayground.css";

const SOURCE_STORAGE_KEY = "cpviz.runtime-playground.source.v1";
const PYTHON_SOURCE_STORAGE_KEY = "cpviz.runtime-playground.python-source.v1";
const PYTHON_INPUT_STORAGE_KEY = "cpviz.runtime-playground.python-input.v1";
const PYTHON_ENTRY_STORAGE_KEY = "cpviz.runtime-playground.python-entry.v1";
const PYTHON_BINDINGS_STORAGE_KEY = "cpviz.runtime-playground.python-bindings.v2";
const MODE_STORAGE_KEY = "cpviz.runtime-playground.mode.v1";
const AUTO_RUN_DELAY_MS = 600;
const PYTHON_AUTO_RUN_DELAY_MS = 900;
const MAX_SOURCE_LENGTH = 50_000;
const RUN_LIMITS = Object.freeze({
  timeoutMs: 1_500,
  maxFrames: 240,
  maxOperations: 4_000,
});
const PYTHON_RUN_LIMITS = Object.freeze({
  timeoutMs: 45_000,
  maxFrames: 240,
});
const PLAYGROUND_DOCK_PANELS = Object.freeze([
  { id: "editor", title: "Code & Inputs" },
  { id: "preview", title: "Live Preview", dockMode: "split-right" },
  { id: "timeline", title: "Playback & Diagnostics", dockMode: "split-bottom" },
]);

function readStoredText(key, fallback) {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function readStoredObject(key) {
  try {
    const stored = window.localStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : null;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function errorMessage(error) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "The visualization could not be executed.";
}

function containerCount(scene) {
  const containers = scene?.containers;
  if (Array.isArray(containers)) return containers.length;
  if (containers && typeof containers === "object") {
    return Object.keys(containers).length;
  }
  return 0;
}

function normalizeRunResult(result, fallbackScene) {
  const frames = Array.isArray(result?.frames)
    ? result.frames.filter((frame) => frame?.scene)
    : [];
  const scene = result?.scene ?? frames.at(-1)?.scene ?? fallbackScene;
  return { frames, scene };
}

function parsePythonInput(inputSource) {
  try {
    return { value: JSON.parse(inputSource), error: null };
  } catch (error) {
    return { value: null, error: `Input JSON: ${errorMessage(error)}` };
  }
}

function mergePythonBindings(defaults, previous, variables) {
  const validNames = new Set(
    (Array.isArray(variables) ? variables : []).map((variable) => String(variable.name)),
  );
  const merged = Object.fromEntries(
    Object.entries(defaults).map(([name, binding]) => [
      name,
      {
        ...binding,
        ...(validNames.has(name) ? previous?.[name] : null),
      },
    ]),
  );
  return normalizePythonBindings(merged, variables);
}

function inferredPythonKind(variable) {
  const kind = String(
    variable?.suggestedKind
    ?? variable?.category
    ?? variable?.type
    ?? "scalar",
  ).toLowerCase();
  if (["array", "list", "tuple", "deque", "string", "sequence"].includes(kind)) {
    return "sequence";
  }
  if (["matrix", "table", "dp", "heatmap", "grid"].includes(kind)) return "grid";
  if (["map", "dict", "set", "counter", "associative"].includes(kind)) {
    return "associative";
  }
  if (kind === "graph" || kind === "tree") return kind;
  return "scalar";
}

function effectivePythonKind(variable, binding) {
  const selected = binding?.kind;
  return selected == null || selected === "" || selected === "auto"
    ? inferredPythonKind(variable)
    : selected;
}

function normalizePythonBindings(bindings, variables) {
  const safeBindings = bindings && typeof bindings === "object"
    ? bindings
    : {};
  const variableByName = new Map(
    (Array.isArray(variables) ? variables : [])
      .filter((variable) => variable?.name != null)
      .map((variable) => [String(variable.name), variable]),
  );
  const sequenceTargets = new Set(
    Object.entries(safeBindings).flatMap(([name, binding]) => {
      const variable = variableByName.get(name);
      return binding?.enabled !== false
        && effectivePythonKind(variable, binding) === "sequence"
        ? [name]
        : [];
    }),
  );
  const firstTarget = sequenceTargets.values().next().value ?? null;

  return Object.fromEntries(
    Object.entries(safeBindings).map(([name, binding]) => {
      const config = binding && typeof binding === "object" ? binding : {};
      const variable = variableByName.get(name);
      const canPoint = effectivePythonKind(variable, config) === "scalar";
      if (config.role !== "pointer" || !canPoint) {
        return [name, {
          ...config,
          role: "value",
          target: null,
          pointerMode: null,
        }];
      }

      const target = sequenceTargets.has(config.target)
        ? config.target
        : firstTarget;
      const inferredMode = variable?.loopRole === "value" ? "value" : "index";
      return [name, {
        ...config,
        role: "pointer",
        target,
        pointerMode: ["index", "value"].includes(config.pointerMode)
          ? config.pointerMode
          : inferredMode,
      }];
    }),
  );
}

function executionErrorKind(error) {
  if (String(error?.code || "").includes("INPUT")) return "Input";
  if (String(error?.code || "").includes("SYNTAX")) return "Syntax";
  if (String(error?.code || "").startsWith("PYTHON")) return "Python";
  return "Runtime";
}

export default function RuntimePlayground({
  onBack,
  utilityControls = null,
  layoutWidth = "full",
  onLayoutChange,
}) {
  const [mode, setMode] = useState(() => {
    const stored = readStoredText(MODE_STORAGE_KEY, "script");
    return stored === "python" ? "python" : "script";
  });
  const [scriptSource, setScriptSource] = useState(() => (
    readStoredText(SOURCE_STORAGE_KEY, DEFAULT_PLAYGROUND_CODE)
  ));
  const [pythonSource, setPythonSource] = useState(() => (
    normalizePastedPythonSource(
      readStoredText(PYTHON_SOURCE_STORAGE_KEY, DEFAULT_PYTHON_CODE),
    )
  ));
  const [pythonInputSource, setPythonInputSource] = useState(() => (
    (() => {
      const storedInput = readStoredText(
      PYTHON_INPUT_STORAGE_KEY,
      JSON.stringify(DEFAULT_PYTHON_INPUT, null, 2),
      );
      const parsedInput = parsePythonInput(storedInput);
      if (parsedInput.error) return storedInput;
      const inferred = inferPythonInput(pythonSource, parsedInput.value);
      return inferred.changed
        ? JSON.stringify(inferred.value, null, 2)
        : storedInput;
    })()
  ));
  const [pythonEntry, setPythonEntry] = useState(() => (
    readStoredText(PYTHON_ENTRY_STORAGE_KEY, "")
  ));
  const [pythonVariables, setPythonVariables] = useState([]);
  const [pythonVariablesStale, setPythonVariablesStale] = useState(false);
  const [pythonBindings, setPythonBindings] = useState(() => (
    readStoredObject(PYTHON_BINDINGS_STORAGE_KEY)
  ));
  const pythonBindingsRef = useRef(pythonBindings);
  const isPython = mode === "python";
  const source = isPython ? pythonSource : scriptSource;
  const pythonInputState = useMemo(
    () => parsePythonInput(pythonInputSource),
    [pythonInputSource],
  );
  const [lastGoodRun, setLastGoodRun] = useState(null);
  const [executionError, setExecutionError] = useState(null);
  const [phase, setPhase] = useState(() =>
    source.trim() ? "waiting" : "idle",
  );
  const [isRunning, setIsRunning] = useState(false);
  const [aiVisualState, setAiVisualState] = useState({
    phase: "idle",
    message: "",
  });
  const [panelDivs, setPanelDivs] = useState(null);
  const requestVersionRef = useRef(0);
  const suggestionVersionRef = useRef(0);
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    pythonBindingsRef.current = pythonBindings;
  }, [pythonBindings]);

  const declarationState = useMemo(() => {
    if (isPython) {
      return { scene: { containers: [] }, error: null };
    }
    try {
      return {
        scene: buildDeclarationPreview(source),
        error: null,
      };
    } catch (error) {
      return {
        scene: null,
        error: errorMessage(error),
      };
    }
  }, [isPython, source]);

  const frames = lastGoodRun?.mode === mode ? lastGoodRun.frames ?? [] : [];
  const {
    stepIndex,
    setStepIndex,
    isPlaying,
    setIsPlaying,
    speed,
    setSpeed,
    stepForward,
    stepBack,
    handleReset,
    isDone,
    canNext,
    canPrev,
  } = usePlaybackState(frames.length, 620);

  const cancelExecution = useCallback(
    (nextPhase) => {
      requestVersionRef.current += 1;
      suggestionVersionRef.current += 1;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      window.clearTimeout(debounceRef.current);
      setIsRunning(false);
      setAiVisualState({ phase: "idle", message: "" });
      setIsPlaying(false);
      handleReset();
      setPhase(nextPhase);
    },
    [handleReset, setIsPlaying],
  );

  const executeSource = useCallback(
    async (runSource, { play = false } = {}) => {
      const runEntry = isPython ? pythonEntry : null;
      if (!runSource.trim()) {
        setPhase("idle");
        setExecutionError(null);
        handleReset();
        return;
      }

      if (isPython && pythonInputState.error) {
        setExecutionError({
          source: runSource,
          mode,
          inputSource: pythonInputSource,
          entrySource: runEntry,
          code: "INVALID_INPUT",
          message: pythonInputState.error,
        });
        setPhase("error");
        return;
      }

      if (runSource.length > MAX_SOURCE_LENGTH) {
        setExecutionError({
          source: runSource,
          mode,
          inputSource: isPython ? pythonInputSource : null,
          entrySource: runEntry,
          code: "SOURCE_LIMIT",
          message: `Source is limited to ${MAX_SOURCE_LENGTH.toLocaleString()} characters.`,
        });
        setPhase("error");
        return;
      }

      const requestVersion = ++requestVersionRef.current;
      suggestionVersionRef.current += 1;
      setAiVisualState({ phase: "idle", message: "" });
      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      setIsRunning(true);
      setPhase("running");
      setExecutionError(null);
      handleReset();

      try {
        const result = isPython
          ? await runPythonTrace(runSource, {
              ...PYTHON_RUN_LIMITS,
              input: pythonInputState.value,
              entry: runEntry,
              signal: abortController.signal,
            })
          : await runVisualizationSource(runSource, {
              ...RUN_LIMITS,
              signal: abortController.signal,
            });
        if (requestVersion !== requestVersionRef.current) return;

        let normalized;
        let traceResult = null;
        let resolvedBindings = pythonBindingsRef.current;
        if (isPython) {
          const defaults = createDefaultPythonBindings(result);
          resolvedBindings = mergePythonBindings(
            defaults,
            pythonBindingsRef.current,
            result.variables,
          );
          normalized = compilePythonTrace(result, resolvedBindings);
          traceResult = result;
          setPythonVariables(result.variables ?? []);
          setPythonVariablesStale(false);
          pythonBindingsRef.current = resolvedBindings;
          setPythonBindings(resolvedBindings);
        } else {
          normalized = normalizeRunResult(
            result,
            buildDeclarationPreview(runSource),
          );
        }
        setLastGoodRun({
          ...normalized,
          source: runSource,
          mode,
          inputSource: isPython ? pythonInputSource : null,
          entrySource: runEntry,
          traceResult,
          bindings: resolvedBindings,
        });
        abortControllerRef.current = null;
        setIsRunning(false);
        setPhase("ready");

        if (play && normalized.frames.length > 0) {
          setStepIndex(0);
          setIsPlaying(normalized.frames.length > 1);
        }
      } catch (error) {
        if (requestVersion !== requestVersionRef.current) return;
        abortControllerRef.current = null;
        setIsRunning(false);
        setPhase("error");
        setExecutionError({
          source: runSource,
          mode,
          inputSource: isPython ? pythonInputSource : null,
          entrySource: runEntry,
          message: errorMessage(error),
          code: error?.code,
          line: error?.line,
        });
      }
    },
    [
      handleReset,
      isPython,
      mode,
      pythonEntry,
      pythonInputSource,
      pythonInputState.error,
      pythonInputState.value,
      setIsPlaying,
      setStepIndex,
    ],
  );

  const stopRun = useCallback(() => {
    cancelExecution("stopped");
  }, [cancelExecution]);

  const updateSource = useCallback(
    (nextSource) => {
      cancelExecution(nextSource.trim() ? "waiting" : "idle");
      setExecutionError(null);
      if (isPython) {
        setPythonSource(nextSource);
        setPythonVariables([]);
        setPythonVariablesStale(true);
        if (!pythonInputState.error) {
          const inferred = inferPythonInput(
            nextSource,
            pythonInputState.value,
            pythonEntry,
          );
          if (inferred.changed) {
            setPythonInputSource(JSON.stringify(inferred.value, null, 2));
          }
        }
      } else {
        setScriptSource(nextSource);
      }
    },
    [
      cancelExecution,
      isPython,
      pythonEntry,
      pythonInputState.error,
      pythonInputState.value,
    ],
  );

  const updatePythonInput = useCallback(
    (nextInput) => {
      cancelExecution(source.trim() ? "waiting" : "idle");
      setExecutionError(null);
      setPythonInputSource(nextInput);
      setPythonVariables([]);
      setPythonVariablesStale(true);
    },
    [cancelExecution, source],
  );

  const updatePythonEntry = useCallback(
    (nextEntry) => {
      cancelExecution(source.trim() ? "waiting" : "idle");
      setExecutionError(null);
      setPythonEntry(nextEntry);
      setPythonVariables([]);
      setPythonVariablesStale(true);
    },
    [cancelExecution, source],
  );

  const changeMode = useCallback(
    (nextMode) => {
      if (nextMode === mode) return;
      const nextSource = nextMode === "python" ? pythonSource : scriptSource;
      cancelExecution(nextSource.trim() ? "waiting" : "idle");
      setExecutionError(null);
      setLastGoodRun(null);
      setMode(nextMode);
    },
    [cancelExecution, mode, pythonSource, scriptSource],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(SOURCE_STORAGE_KEY, scriptSource);
    } catch {
      // The playground still works when storage is disabled.
    }
  }, [scriptSource]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PYTHON_SOURCE_STORAGE_KEY, pythonSource);
      window.localStorage.setItem(PYTHON_INPUT_STORAGE_KEY, pythonInputSource);
      window.localStorage.setItem(PYTHON_ENTRY_STORAGE_KEY, pythonEntry);
      window.localStorage.setItem(PYTHON_BINDINGS_STORAGE_KEY, JSON.stringify(pythonBindings));
      window.localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      // The trace mode still works when storage is disabled.
    }
  }, [mode, pythonBindings, pythonEntry, pythonInputSource, pythonSource]);

  useEffect(() => {
    window.clearTimeout(debounceRef.current);
    if (
      !source.trim()
      || declarationState.error
      || (isPython && pythonInputState.error)
    ) return undefined;

    debounceRef.current = window.setTimeout(() => {
      executeSource(source);
    }, isPython ? PYTHON_AUTO_RUN_DELAY_MS : AUTO_RUN_DELAY_MS);

    return () => window.clearTimeout(debounceRef.current);
  }, [declarationState.error, executeSource, isPython, pythonInputState.error, source]);

  useEffect(
    () => () => {
      requestVersionRef.current += 1;
      suggestionVersionRef.current += 1;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      window.clearTimeout(debounceRef.current);
    },
    [],
  );

  const hasCurrentRun = Boolean(
    lastGoodRun?.mode === mode
    && lastGoodRun?.source === source
    && (!isPython || (
      lastGoodRun?.inputSource === pythonInputSource
      && lastGoodRun?.entrySource === pythonEntry
    )),
  );
  const currentFrames = hasCurrentRun ? frames : [];
  const currentFrame =
    stepIndex >= 0 ? currentFrames[stepIndex] ?? null : null;
  const currentError = declarationState.error
    ? { message: declarationState.error, kind: "Declaration" }
    : isPython && pythonInputState.error
      ? { message: pythonInputState.error, kind: "Input", line: null }
    : executionError?.source === source
      && executionError?.mode === mode
      && (!isPython || (
        executionError?.inputSource === pythonInputSource
        && executionError?.entrySource === pythonEntry
      ))
      ? {
          message: executionError.message,
          kind: executionErrorKind(executionError),
          line: executionError.line,
        }
      : null;
  const declarationCount = containerCount(declarationState.scene);
  const showingDeclarations = !hasCurrentRun && declarationCount > 0;
  const showingLastGood = Boolean(
    currentError && lastGoodRun && !showingDeclarations,
  );

  const displayScene = currentFrame?.scene
    ?? (hasCurrentRun ? lastGoodRun.scene : null)
    ?? (showingDeclarations ? declarationState.scene : null)
    ?? (showingLastGood ? lastGoodRun.scene : null)
    ?? declarationState.scene
    ?? (!isPython ? lastGoodRun?.scene : null)
    ?? { containers: [] };
  const traceWasTruncated = Boolean(
    isPython
    && hasCurrentRun
    && (
      lastGoodRun?.truncated
      || lastGoodRun?.metadata?.truncated
      || lastGoodRun?.traceResult?.truncated
    ),
  );
  const traceWarning = typeof lastGoodRun?.warning === "string"
    ? lastGoodRun.warning
    : `Playback is limited to the first ${currentFrames.length.toLocaleString()} captured frames; the Python result still ran to completion.`;

  const playCurrentSource = useCallback(() => {
    window.clearTimeout(debounceRef.current);

    if (isRunning) {
      stopRun();
      return;
    }
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (!hasCurrentRun || frames.length === 0) {
      executeSource(source, { play: true });
      return;
    }
    if (stepIndex < 0 || isDone) {
      setStepIndex(0);
      setIsPlaying(frames.length > 1);
      return;
    }
    setIsPlaying(true);
  }, [
    executeSource,
    frames.length,
    hasCurrentRun,
    isDone,
    isPlaying,
    isRunning,
    setIsPlaying,
    setStepIndex,
    source,
    stepIndex,
    stopRun,
  ]);

  const runWithoutPlayback = useCallback(() => {
    window.clearTimeout(debounceRef.current);
    executeSource(source);
  }, [executeSource, source]);

  const rewindPlayback = useCallback(() => {
    setIsPlaying(false);
    setStepIndex(currentFrames.length > 0 ? 0 : -1);
  }, [currentFrames.length, setIsPlaying, setStepIndex]);

  const resetExample = useCallback(() => {
    if (isPython) {
      const nextInput = JSON.stringify(DEFAULT_PYTHON_INPUT, null, 2);
      cancelExecution("waiting");
      setExecutionError(null);
      setPythonVariables([]);
      setPythonVariablesStale(true);
      pythonBindingsRef.current = {};
      setPythonBindings({});
      setLastGoodRun(null);
      setPythonSource(DEFAULT_PYTHON_CODE);
      setPythonInputSource(nextInput);
      setPythonEntry("");
      return;
    }
    if (source === DEFAULT_PLAYGROUND_CODE) {
      executeSource(DEFAULT_PLAYGROUND_CODE);
      return;
    }
    updateSource(DEFAULT_PLAYGROUND_CODE);
  }, [cancelExecution, executeSource, isPython, source, updateSource]);

  const updatePythonBindings = useCallback(
    (bindings) => {
      const nextBindings = normalizePythonBindings(bindings, pythonVariables);
      pythonBindingsRef.current = nextBindings;
      setPythonBindings(nextBindings);
      if (
        !hasCurrentRun
        || !lastGoodRun?.traceResult
        || lastGoodRun.mode !== "python"
      ) return;

      const normalized = compilePythonTrace(lastGoodRun.traceResult, nextBindings);
      setLastGoodRun({
        ...lastGoodRun,
        ...normalized,
        bindings: nextBindings,
      });
      setIsPlaying(false);
      setStepIndex((previous) => (
        previous < normalized.frames.length
          ? previous
          : Math.max(-1, normalized.frames.length - 1)
      ));
    },
    [
      hasCurrentRun,
      lastGoodRun,
      pythonVariables,
      setIsPlaying,
      setStepIndex,
    ],
  );

  const suggestVisualBindings = useCallback(async () => {
    if (
      !isPython
      || !hasCurrentRun
      || !lastGoodRun?.traceResult
      || pythonVariables.length === 0
    ) return;

    const suggestionVersion = ++suggestionVersionRef.current;
    setAiVisualState({
      phase: "running",
      message: "Asking the selected AI provider for a visual layout...",
    });

    try {
      const suggestion = await suggestPythonBindings({
        source: pythonSource,
        inputSource: pythonInputSource,
        entry: pythonEntry,
        traceResult: lastGoodRun.traceResult,
        bindings: pythonBindingsRef.current,
      });
      if (suggestionVersion !== suggestionVersionRef.current) return;

      const nextBindings = normalizePythonBindings({
        ...pythonBindingsRef.current,
        ...Object.fromEntries(
          Object.entries(suggestion.bindings).map(([name, binding]) => [
            name,
            { ...pythonBindingsRef.current[name], ...binding },
          ]),
        ),
      }, pythonVariables);
      updatePythonBindings(nextBindings);
      setAiVisualState({
        phase: "success",
        message: `${suggestion.provider}: ${suggestion.summary}`,
      });
    } catch (error) {
      if (suggestionVersion !== suggestionVersionRef.current) return;
      setAiVisualState({
        phase: "error",
        message: `${errorMessage(error)} Check the AI provider in the assistant settings.`,
      });
    }
  }, [
    hasCurrentRun,
    isPython,
    lastGoodRun,
    pythonEntry,
    pythonInputSource,
    pythonSource,
    pythonVariables,
    updatePythonBindings,
  ]);

  const previewStatus = isRunning
    ? "Running"
    : showingDeclarations && currentError
      ? "Declarations only"
    : showingLastGood
      ? "Last good preview"
    : currentError
        ? "Error"
      : traceWasTruncated
        ? "Trace limited"
      : hasCurrentRun
        ? "Live"
      : phase === "stopped"
          ? "Stopped"
          : isPython
            ? "Awaiting run"
            : "Declarations";

  const statusMessage = currentFrame?.message
    ?? (showingLastGood
      ? "The editor has an error, so the last successful preview is preserved."
      : hasCurrentRun
        ? "Ready to play the generated timeline."
        : phase === "waiting"
          ? isPython
            ? "Python changed. The isolated auto-run starts after you pause typing."
            : "Updating the live preview..."
          : phase === "stopped"
            ? "Execution stopped. Edit the code or press Play to run it again."
            : isPython
              ? "Provide inputs, then run the Python solution."
              : "Declare a structure with the viz API to begin.");
  const activeSourceLine = currentFrame?.source?.line ?? currentError?.line ?? null;

  return (
    <div
      className={`runtime-playground runtime-playground--${layoutWidth}`}
      data-layout-width={layoutWidth}
    >
      <header className="runtime-playground__header">
        <div className="runtime-playground__header-main">
          {onBack && (
            <button
              type="button"
              className="runtime-playground__back"
              onClick={onBack}
              aria-label="Back to problems"
            >
              <span aria-hidden="true">&larr;</span>
              Problems
            </button>
          )}
          <div className="runtime-playground__title-group">
            <span className="runtime-playground__eyebrow">Visualizer Playground</span>
            <h1>Build visualizations with code</h1>
          </div>
        </div>

        <div className="runtime-playground__header-actions">
          {onLayoutChange && (
            <div className="runtime-playground__layout" aria-label="Workspace width">
              {["normal", "wide", "full"].map((width) => (
                <button
                  type="button"
                  key={width}
                  className={layoutWidth === width ? "is-active" : ""}
                  onClick={() => onLayoutChange(width)}
                  aria-pressed={layoutWidth === width}
                >
                  {width}
                </button>
              ))}
            </div>
          )}
          {utilityControls && (
            <div className="runtime-playground__utilities">{utilityControls}</div>
          )}
        </div>
      </header>

      <main className="runtime-playground__workspace">
        <LuminoDockPanel
          panels={PLAYGROUND_DOCK_PANELS}
          onPanelReady={setPanelDivs}
        />
        {panelDivs?.editor && createPortal(
        <section className="runtime-playground__panel runtime-playground__editor-panel">
          <div className="runtime-playground__panel-header">
            <div>
              <h2>{isPython ? "Python Trace" : "JavaScript"}</h2>
              <p>
                {isPython
                  ? "Run ordinary Python, then choose which variables become visuals."
                  : <><span>Use </span><code>viz</code><span> to declare structures and emit steps.</span></>}
              </p>
            </div>
            <div className="runtime-playground__editor-actions">
              <div className="runtime-playground__mode-switch" aria-label="Editor mode">
                <button
                  type="button"
                  className={!isPython ? "is-active" : ""}
                  aria-pressed={!isPython}
                  onClick={() => changeMode("script")}
                >
                  Viz script
                </button>
                <button
                  type="button"
                  className={isPython ? "is-active" : ""}
                  aria-pressed={isPython}
                  onClick={() => changeMode("python")}
                >
                  Python
                </button>
              </div>
              <button type="button" className="runtime-playground__button" onClick={resetExample}>
                Reset example
              </button>
              {isRunning ? (
                <button
                  type="button"
                  className="runtime-playground__button runtime-playground__button--danger"
                  onClick={stopRun}
                >
                  Stop
                </button>
              ) : (
                <button
                  type="button"
                  className="runtime-playground__button runtime-playground__button--primary"
                  onClick={runWithoutPlayback}
                  disabled={isPython && Boolean(pythonInputState.error)}
                >
                  {isPython ? "Run Python" : "Run"}
                </button>
              )}
            </div>
          </div>
          <div className="runtime-playground__editor-body">
            <RuntimeCodeEditor
              value={source}
              onChange={updateSource}
              onRun={playCurrentSource}
              isBusy={isRunning}
              language={isPython ? "python" : "javascript"}
              activeLine={activeSourceLine}
            />
          </div>
          {isPython && (
            <PythonTraceControls
              entryValue={pythonEntry}
              onEntryChange={updatePythonEntry}
              inputValue={pythonInputSource}
              onInputChange={updatePythonInput}
              inputError={pythonInputState.error}
              variables={pythonVariables}
              variablesStale={pythonVariablesStale}
              bindings={pythonBindings}
              onBindingsChange={updatePythonBindings}
              onSuggestVisuals={suggestVisualBindings}
              isSuggestingVisuals={aiVisualState.phase === "running"}
              aiFeedback={aiVisualState}
              disabled={isRunning}
            />
          )}
          <div className="runtime-playground__editor-foot">
            <span>{isPython ? "Python · isolated Worker · auto-run" : "JavaScript · viz API"}</span>
            <span><kbd>Ctrl</kbd> + <kbd>Enter</kbd> to run and play</span>
            <span>{source.length.toLocaleString()} / {MAX_SOURCE_LENGTH.toLocaleString()}</span>
          </div>
        </section>,
        panelDivs.editor,
        "runtime-playground-editor",
        )}

        {panelDivs?.preview && createPortal(
        <section className="runtime-playground__panel runtime-playground__preview-panel">
          <div className="runtime-playground__panel-header">
            <div>
              <h2>Live preview</h2>
              <p>{containerCount(displayScene)} visible structure{containerCount(displayScene) === 1 ? "" : "s"}</p>
            </div>
            <span
              className={`runtime-playground__status runtime-playground__status--${currentError ? "error" : traceWasTruncated ? "warning" : phase}`}
              role="status"
              aria-live="polite"
            >
              <span aria-hidden="true" />
              {previewStatus}
            </span>
          </div>
          <div className="runtime-playground__canvas">
            <VisualizationCanvas
              scene={displayScene}
              emptyMessage={
                isPython
                  ? "Run the Python solution, then enable its arrays and variables in Visuals."
                  : "Declare an array, grid, graph, tree, or another structure in the editor."
              }
            />
          </div>
        </section>,
        panelDivs.preview,
        "runtime-playground-preview",
        )}

        {panelDivs?.timeline && createPortal(
        <section className="runtime-playground__panel runtime-playground__timeline-panel">
          <div className="runtime-playground__playback">
            <PlaybackControls
              onReset={rewindPlayback}
              onPrev={stepBack}
              onPlayToggle={playCurrentSource}
              onNext={stepForward}
              resetDisabled={!hasCurrentRun || (stepIndex <= 0 && !isPlaying)}
              prevDisabled={!hasCurrentRun || !canPrev}
              nextDisabled={!hasCurrentRun || !canNext}
              activeStep={stepIndex}
              totalSteps={currentFrames.length}
              isPlaying={isPlaying}
              isDone={
                !isRunning && hasCurrentRun && currentFrames.length > 0
                  ? isDone
                  : false
              }
              playLabel={isRunning ? "Stop" : "Play"}
              pauseLabel="Pause"
              replayLabel="Replay"
              resetLabel="Rewind"
              speed={speed}
              onSpeedChange={(event) => setSpeed(Number(event.target.value))}
              speedMin={100}
              speedMax={1_400}
              speedStep={50}
              speedIndicator={`${(1_000 / speed).toFixed(1)} steps/s`}
            />
            <div className="runtime-playground__scrubber">
              <label htmlFor="runtime-playground-timeline">Timeline</label>
              <input
                id="runtime-playground-timeline"
                type="range"
                min="0"
                max={Math.max(0, currentFrames.length - 1)}
                value={Math.max(0, stepIndex)}
                disabled={!hasCurrentRun || currentFrames.length === 0}
                onChange={(event) => {
                  setIsPlaying(false);
                  setStepIndex(Number(event.target.value));
                }}
                aria-valuetext={
                  stepIndex >= 0
                    ? `Frame ${stepIndex + 1} of ${currentFrames.length}`
                    : "Timeline not started"
                }
              />
              <output>
                {stepIndex >= 0 ? stepIndex + 1 : 0} / {currentFrames.length}
              </output>
            </div>
          </div>

          <div className="runtime-playground__diagnostics" aria-live="polite">
            {currentError ? (
              <div className="runtime-playground__error" role="alert">
                <strong>{currentError.kind} error</strong>
                <span>{currentError.message}</span>
              </div>
            ) : (
              <>
                {traceWasTruncated && (
                  <div className="runtime-playground__warning" role="status">
                    <strong>Trace limit reached</strong>
                    <span>{traceWarning}</span>
                  </div>
                )}
                <div className="runtime-playground__timeline-message">
                  <span className="runtime-playground__operation">
                    {currentFrame?.operation ?? phase}
                  </span>
                  <span>{statusMessage}</span>
                </div>
              </>
            )}
          </div>
        </section>,
        panelDivs.timeline,
        "runtime-playground-timeline",
        )}
      </main>
    </div>
  );
}
