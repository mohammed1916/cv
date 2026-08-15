import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import './Problem403Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('frog-jump')

const PATTERNS = []
const LINE_PATTERN_MAP = {}

const EXAMPLES = [
  { label: 'Ex1', stones: [0, 1, 3, 5, 6, 8, 12, 17], expected: true },
  { label: 'Ex2', stones: [0, 1, 2, 3, 4, 8, 9, 11], expected: false },
  { label: 'Simple', stones: [0, 1, 2], expected: true },
]

function generateSteps(stones) {
  const steps = []

  if (!stones || stones.length === 0) {
    steps.push({
      activeLine: 1,
      message: 'No stones provided.',
      phase: 'init',
      lastIdx: -1,
      currentPos: -1,
      k: null,
      memo: new Set(),
    })
    return steps
  }

  const target = stones[stones.length - 1]
  const memo = new Set()

  steps.push({
    activeLine: 1,
    message: `Initialize: target stone index = ${stones.length - 1}, target position = ${target}`,
    phase: 'init',
    lastIdx: stones.length - 1,
    currentPos: 0,
    k: null,
    memo: new Set(memo),
    path: [],
    reachable: new Set([0]),
  })

  // Simulate DFS with memoization - explore reachability
  const queue = [{ pos: 0, k: 0, path: [0] }]
  const visited = new Map()
  visited.set('0:0', true)
  const allPaths = []

  let stepCount = 0
  while (queue.length > 0 && stepCount < 30) {
    stepCount++
    const { pos, k, path } = queue.shift()

    steps.push({
      activeLine: 3,
      message: `Explore from position ${pos} with last jump k=${k}. Path: [${path.join(' → ')}]`,
      phase: 'explore',
      currentPos: pos,
      k,
      memo: new Set(memo),
      path,
      lastIdx: stones.length - 1,
      reachable: new Set(visited.keys().map(k => parseInt(k.split(':')[0]))),
    })

    if (pos === target) {
      steps.push({
        activeLine: 5,
        message: `Found target at position ${target}! Return true.`,
        phase: 'found',
        currentPos: pos,
        k,
        memo: new Set(memo),
        path,
        lastIdx: stones.length - 1,
        reachable: new Set(visited.keys().map(k => parseInt(k.split(':')[0]))),
        success: true,
      })
      allPaths.push({ path, success: true })
      break
    }

    for (let nextK of [k - 1, k, k + 1]) {
      if (nextK <= 0) continue
      const nextPos = pos + nextK
      const key = `${nextPos}:${nextK}`

      if (nextPos > target || visited.has(key)) continue

      visited.set(key, true)

      steps.push({
        activeLine: 7,
        message: `Try jump of k=${nextK}: next position ${nextPos}`,
        phase: 'jump_option',
        currentPos: pos,
        k: nextK,
        memo: new Set(memo),
        path: [...path, nextPos],
        lastIdx: stones.length - 1,
        nextPos,
        reachable: new Set(visited.keys().map(k => parseInt(k.split(':')[0]))),
      })

      if (stones.includes(nextPos)) {
        queue.push({ pos: nextPos, k: nextK, path: [...path, nextPos] })

        steps.push({
          activeLine: 8,
          message: `Position ${nextPos} is a valid stone. Add to queue.`,
          phase: 'add_queue',
          currentPos: pos,
          k: nextK,
          memo: new Set(memo),
          path: [...path, nextPos],
          lastIdx: stones.length - 1,
          nextPos,
          reachable: new Set(visited.keys().map(k => parseInt(k.split(':')[0]))),
        })
      }
    }
  }

  if (!allPaths.some(p => p.success)) {
    steps.push({
      activeLine: 10,
      message: 'No path found to last stone. Return false.',
      phase: 'not_found',
      currentPos: -1,
      k: null,
      memo: new Set(memo),
      path: [],
      lastIdx: stones.length - 1,
      reachable: new Set(visited.keys().map(k => parseInt(k.split(':')[0]))),
      success: false,
    })
  }

  return steps
}

function StoneVisualization({ stones, step, selectedStones }) {
  const maxStone = stones[stones.length - 1] || 17
  const scale = 400 / maxStone

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Stone Layout</div>

      <div style={{ position: 'relative', height: 60, backgroundColor: '#f1f5f9', borderRadius: 8, overflow: 'hidden', border: '2px solid #cbd5e1' }}>
        <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end' }}>
          {stones.map((stone, idx) => {
            const isStart = stone === 0
            const isEnd = stone === stones[stones.length - 1]
            const isCurrent = stone === step?.currentPos
            const isReachable = step?.reachable?.has(stone)

            return (
              <motion.div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${(stone / maxStone) * 100}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <motion.div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: '2px solid',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: 'pointer',
                    borderColor: isCurrent ? '#dc2626' : isEnd ? '#10b981' : isStart ? '#0284c7' : isReachable ? '#f59e0b' : '#cbd5e1',
                    backgroundColor: isCurrent ? '#fee2e2' : isEnd ? '#d1fae5' : isStart ? '#dbeafe' : isReachable ? '#fef3c7' : '#f1f5f9',
                    color: isCurrent ? '#7f1d1d' : isEnd ? '#065f46' : isStart ? '#0c4a6e' : isReachable ? '#92400e' : '#64748b',
                  }}
                  animate={{ scale: isCurrent ? 1.3 : 1 }}
                >
                  {stone}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 4, textAlign: 'center', fontSize: 11 }}>
          <div style={{ color: '#1e40af', fontWeight: 600 }}>Start</div>
          <div style={{ color: '#0c4a6e', fontSize: 12, fontWeight: 'bold' }}>0</div>
        </div>
        <div style={{ padding: 8, backgroundColor: '#d1fae5', borderRadius: 4, textAlign: 'center', fontSize: 11 }}>
          <div style={{ color: '#065f46', fontWeight: 600 }}>End</div>
          <div style={{ color: '#047857', fontSize: 12, fontWeight: 'bold' }}>{stones[stones.length - 1]}</div>
        </div>
        <div style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 4, textAlign: 'center', fontSize: 11 }}>
          <div style={{ color: '#92400e', fontWeight: 600 }}>Reachable</div>
          <div style={{ color: '#78350f', fontSize: 12, fontWeight: 'bold' }}>{step?.reachable?.size ?? 1}</div>
        </div>
        <div style={{ padding: 8, backgroundColor: '#fee2e2', borderRadius: 4, textAlign: 'center', fontSize: 11 }}>
          <div style={{ color: '#7f1d1d', fontWeight: 600 }}>Current</div>
          <div style={{ color: '#991b1b', fontSize: 12, fontWeight: 'bold' }}>{step?.currentPos ?? '—'}</div>
        </div>
      </div>

      {step?.path && step.path.length > 0 && (
        <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #10b981' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>Current Path</div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#047857' }}>
            {step.path.join(' → ')}
          </div>
        </div>
      )}

      {step?.k !== null && step?.k !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>Last Jump Distance</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#78350f' }}>k = {step.k}</div>
          <div style={{ fontSize: 11, color: '#92400e', marginTop: 4 }}>Can jump k-1={step.k-1}, k={step.k}, or k+1={step.k+1}</div>
        </div>
      )}

      <div style={{ fontSize: 12, color: '#475569', fontStyle: 'italic' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem403Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [stonesInput, setStonesInput] = useState(JSON.stringify(EXAMPLES[0]?.stones ?? []));
  const { stones, inputError } = useMemo(() => {
    try {
      const parsedStones = JSON.parse(stonesInput); if (!Array.isArray(parsedStones)) throw new Error('stones must be an array');
      return { stones: parsedStones, inputError: '' };
    } catch (e) {
      return { stones: EXAMPLES[exIdx]?.stones ?? '', inputError: e.message };
    }
  }, [stonesInput]);
  const example = EXAMPLES[exIdx]

  const steps = useMemo(
    () =>
      generateSteps(stones).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [example]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((i) => { setExIdx(i); setStonesInput(JSON.stringify(EXAMPLES[i].stones)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <div style={{ position: "relative" }}>
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />

        {showPatternOverlay && (
          <CodePatternAnnotations
            linePatterns={LINE_PATTERN_MAP}
            currentPhase={step?.phase}
            activeLineDom={activeLineDom}
            activeLine={step?.activeLine}
          />
        )}
      </div>
      ),
    },
    {
      id: 'viz',
      title: '🦗 Frog Jump',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, height: '100%' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, idx) => (
                <button
                  key={e.label}
                  onClick={() => applyEx(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: exIdx === idx ? '2px solid #ef4444' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#fee2e2' : '#f1f5f9',
                    color: exIdx === idx ? '#7f1d1d' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label} {e.expected ? '✓' : '✗'}
                </button>
              ))}
            </div>
          </div>
          <StoneVisualization stones={stones} step={step} />
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, example, exIdx, applyEx])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"stones","label":"stones","type":"array"}]}
          values={{ stones: stonesInput }}
          onChange={(k, v) => { if (k === 'stones') setStonesInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={EXAMPLES[exIdx]?.label}
          applyExample={(e) => applyEx(EXAMPLES.indexOf(e))}
          inputError={inputError}
        />
      
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
    </div>
  )
}
