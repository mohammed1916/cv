import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PlaybackControls from "../components/PlaybackControls";
import { usePlaybackState } from "../hooks/usePlaybackState";
import {
  DEFAULT_PLAYGROUND_CODE,
  buildDeclarationPreview,
  runVisualizationSource,
} from "./runtime";
import VisualizationCanvas from "./renderers/VisualizationCanvas";
import RuntimeCodeEditor from "./RuntimeCodeEditor";
import "./RuntimePlayground.css";

const SOURCE_STORAGE_KEY = "cpviz.runtime-playground.source.v1";
const AUTO_RUN_DELAY_MS = 600;
const MAX_SOURCE_LENGTH = 50_000;
const RUN_LIMITS = Object.freeze({
  timeoutMs: 1_500,
  maxFrames: 240,
  maxOperations: 4_000,
});

function readInitialSource() {
  try {
    const stored = window.localStorage.getItem(SOURCE_STORAGE_KEY);
    return stored ?? DEFAULT_PLAYGROUND_CODE;
  } catch {
    return DEFAULT_PLAYGROUND_CODE;
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

export default function RuntimePlayground({
  onBack,
  utilityControls = null,
  layoutWidth = "full",
  onLayoutChange,
}) {
  const [source, setSource] = useState(readInitialSource);
  const [lastGoodRun, setLastGoodRun] = useState(null);
  const [executionError, setExecutionError] = useState(null);
  const [phase, setPhase] = useState(() =>
    source.trim() ? "waiting" : "idle",
  );
  const [isRunning, setIsRunning] = useState(false);
  const requestVersionRef = useRef(0);
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  const declarationState = useMemo(() => {
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
  }, [source]);

  const frames = lastGoodRun?.frames ?? [];
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

  const executeSource = useCallback(
    async (runSource, { play = false } = {}) => {
      if (!runSource.trim()) {
        setPhase("idle");
        setExecutionError(null);
        handleReset();
        return;
      }

      if (runSource.length > MAX_SOURCE_LENGTH) {
        setExecutionError({
          source: runSource,
          message: `Source is limited to ${MAX_SOURCE_LENGTH.toLocaleString()} characters.`,
        });
        setPhase("error");
        return;
      }

      const requestVersion = ++requestVersionRef.current;
      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      setIsRunning(true);
      setPhase("running");
      setExecutionError(null);
      handleReset();

      try {
        const result = await runVisualizationSource(runSource, {
          ...RUN_LIMITS,
          signal: abortController.signal,
        });
        if (requestVersion !== requestVersionRef.current) return;

        const normalized = normalizeRunResult(
          result,
          buildDeclarationPreview(runSource),
        );
        setLastGoodRun({ ...normalized, source: runSource });
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
        setExecutionError({ source: runSource, message: errorMessage(error) });
      }
    },
    [handleReset, setIsPlaying, setStepIndex],
  );

  const stopRun = useCallback(() => {
    requestVersionRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    window.clearTimeout(debounceRef.current);
    setIsRunning(false);
    setIsPlaying(false);
    setPhase("stopped");
  }, [setIsPlaying]);

  const updateSource = useCallback(
    (nextSource) => {
      requestVersionRef.current += 1;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      window.clearTimeout(debounceRef.current);
      setIsRunning(false);
      setIsPlaying(false);
      handleReset();
      setExecutionError(null);
      setPhase(nextSource.trim() ? "waiting" : "idle");
      setSource(nextSource);
    },
    [handleReset, setIsPlaying],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(SOURCE_STORAGE_KEY, source);
    } catch {
      // The playground still works when storage is disabled.
    }
  }, [source]);

  useEffect(() => {
    window.clearTimeout(debounceRef.current);
    if (!source.trim() || declarationState.error) return undefined;

    debounceRef.current = window.setTimeout(() => {
      executeSource(source);
    }, AUTO_RUN_DELAY_MS);

    return () => window.clearTimeout(debounceRef.current);
  }, [declarationState.error, executeSource, source]);

  useEffect(
    () => () => {
      requestVersionRef.current += 1;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      window.clearTimeout(debounceRef.current);
    },
    [],
  );

  const hasCurrentRun = lastGoodRun?.source === source;
  const currentFrames = hasCurrentRun ? frames : [];
  const currentFrame =
    stepIndex >= 0 ? currentFrames[stepIndex] ?? null : null;
  const currentError = declarationState.error
    ? { message: declarationState.error, kind: "Declaration" }
    : executionError?.source === source
      ? { message: executionError.message, kind: "Runtime" }
      : null;
  const showingLastGood = Boolean(currentError && lastGoodRun);

  const displayScene = currentFrame?.scene
    ?? (hasCurrentRun ? lastGoodRun.scene : null)
    ?? (showingLastGood ? lastGoodRun.scene : null)
    ?? declarationState.scene
    ?? lastGoodRun?.scene
    ?? { containers: [] };

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
    if (source === DEFAULT_PLAYGROUND_CODE) {
      executeSource(DEFAULT_PLAYGROUND_CODE);
      return;
    }
    updateSource(DEFAULT_PLAYGROUND_CODE);
  }, [executeSource, source, updateSource]);

  const previewStatus = isRunning
    ? "Running"
    : showingLastGood
      ? "Last good preview"
      : currentError
        ? "Error"
      : hasCurrentRun
        ? "Live"
        : phase === "stopped"
          ? "Stopped"
          : "Declarations";

  const statusMessage = currentFrame?.message
    ?? (showingLastGood
      ? "The editor has an error, so the last successful preview is preserved."
      : hasCurrentRun
        ? "Ready to play the generated timeline."
        : phase === "waiting"
          ? "Updating the live preview..."
          : phase === "stopped"
            ? "Execution stopped. Edit the code or press Play to run it again."
            : "Declare a structure with the viz API to begin.");

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
        <section className="runtime-playground__panel runtime-playground__editor-panel">
          <div className="runtime-playground__panel-header">
            <div>
              <h2>JavaScript</h2>
              <p>Use <code>viz</code> to declare structures and emit steps.</p>
            </div>
            <div className="runtime-playground__editor-actions">
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
                >
                  Run
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
            />
          </div>
          <div className="runtime-playground__editor-foot">
            <span>JavaScript only</span>
            <span><kbd>Ctrl</kbd> + <kbd>Enter</kbd> to run and play</span>
            <span>{source.length.toLocaleString()} / {MAX_SOURCE_LENGTH.toLocaleString()}</span>
          </div>
        </section>

        <section className="runtime-playground__panel runtime-playground__preview-panel">
          <div className="runtime-playground__panel-header">
            <div>
              <h2>Live preview</h2>
              <p>{containerCount(displayScene)} visible structure{containerCount(displayScene) === 1 ? "" : "s"}</p>
            </div>
            <span
              className={`runtime-playground__status runtime-playground__status--${currentError ? "error" : phase}`}
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
              emptyMessage="Declare an array, grid, graph, tree, or another structure in the editor."
            />
          </div>
        </section>

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
              <div className="runtime-playground__timeline-message">
                <span className="runtime-playground__operation">
                  {currentFrame?.operation ?? phase}
                </span>
                <span>{statusMessage}</span>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
