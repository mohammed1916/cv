import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem441Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('arranging-coins')

const PATTERNS = ['add_stair', 'complete', 'init', 'use_coins']
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'add_stair',
  3: 'use_coins',
  4: 'complete'
}


const EXAMPLES = getExamples('arranging-coins')

function generateSteps(n) {
  const steps = []

  if (n < 1) {
    steps.push({
      activeLine: 1,
      phase: 'init',
      n,
      stairs: 0,
      used: 0,
      message: 'No coins',
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    phase: 'init',
    n,
    stairs: 0,
    used: 0,
    message: `Build staircase with ${n} coins`,
  })

  let remaining = n
  let stairs = 0

  while (remaining >= stairs + 1) {
    stairs++

    steps.push({
      activeLine: 2,
      phase: 'add_stair',
      n,
      stairs,
      used: n - remaining,
      coinsNeeded: stairs,
      remaining,
      message: `Add stair ${stairs} (needs ${stairs} coins)`,
    })

    remaining -= stairs

    steps.push({
      activeLine: 3,
      phase: 'use_coins',
      n,
      stairs,
      used: n - remaining,
      coinsNeeded: stairs,
      remaining,
      message: `Remaining: ${remaining} coins`,
    })
  }

  steps.push({
    activeLine: 4,
    phase: 'complete',
    n,
    stairs,
    used: n - remaining,
    remaining,
    isComplete: true,
    message: `Complete! ${stairs} stairs, ${remaining} coins left`,
  })

  return steps
}

function StaircaseVisualization({ stairs, n, used }) {
  const maxStairs = Math.max(10, Math.ceil(Math.sqrt(2 * n)))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Staircase</div>
      <div style={{
        padding: 16,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 150,
        display: 'flex',
        flexDirection: 'column-reverse',
        justifyContent: 'flex-end',
        gap: 4,
      }}>
        {Array.from({ length: maxStairs }, (_, i) => {
          const stairNum = i + 1
          const isActive = stairNum <= stairs

          return (
            <motion.div
              key={i}
              style={{
                display: 'flex',
                gap: 4,
              }}
            >
              {Array.from({ length: stairNum }, (_, j) => (
                <motion.div
                  key={j}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    backgroundColor: isActive ? '#dbeafe' : '#e2e8f0',
                    border: isActive ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 600,
                    color: isActive ? '#0c4a6e' : '#94a3b8',
                  }}
                  animate={{
                    scale: isActive ? 1 : 0.8,
                    opacity: isActive ? 1 : 0.5,
                  }}
                >
                  {isActive && '■'}
                </motion.div>
              ))}
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: isActive ? '#0284c7' : '#cbd5e1',
                minWidth: 20,
                textAlign: 'center',
              }}>
                {stairNum}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function CoinsVisualization({ n, used, remaining, stairs }) {
  const coinsPerRow = 10

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Coins</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
      }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {Array.from({ length: n }, (_, i) => (
            <motion.div
              key={i}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: i < used ? '#10b981' : '#fbbf24',
                border: i < used ? '2px solid #047857' : '2px solid #b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: i < used ? '#047857' : '#b45309',
              }}
              animate={{
                scale: 1,
              }}
              initial={{ scale: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              C
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatsVisualization({ stairs, used, remaining, n }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Statistics</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}>
        <div style={{
          padding: 12,
          backgroundColor: '#dbeafe',
          borderRadius: 6,
          border: '2px solid #0284c7',
        }}>
          <div style={{ fontSize: 11, color: '#0c4a6e', fontWeight: 600 }}>Complete Stairs</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>
            {stairs}
          </div>
        </div>
        <div style={{
          padding: 12,
          backgroundColor: '#fef3c7',
          borderRadius: 6,
          border: '2px solid #f59e0b',
        }}>
          <div style={{ fontSize: 11, color: '#b45309', fontWeight: 600 }}>Leftover Coins</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
            {remaining}
          </div>
        </div>
        <div style={{
          padding: 12,
          backgroundColor: '#ecfdf5',
          borderRadius: 6,
          border: '2px solid #10b981',
          gridColumn: '1 / -1',
        }}>
          <div style={{ fontSize: 11, color: '#047857', fontWeight: 600 }}>Coins Used</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981', marginTop: 4 }}>
            {used} / {n}
          </div>
        </div>
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: 16, overflow: 'auto' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <StaircaseVisualization
        stairs={step?.stairs || 0}
        n={step?.n || 0}
        used={step?.used || 0}
      />

      <CoinsVisualization
        n={step?.n || 0}
        used={step?.used || 0}
        remaining={step?.remaining || 0}
        stairs={step?.stairs || 0}
      />

      <StatsVisualization
        stairs={step?.stairs || 0}
        used={step?.used || 0}
        remaining={step?.remaining || 0}
        n={step?.n || 0}
      />
    </div>
  )
}

export default function Problem441Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [nInput, setNInput] = useState(5);
  const { n, inputError } = useMemo(() => {
    try {
      const parsedN = Number(nInput); if (isNaN(parsedN)) throw new Error('n must be a number');
      return { n: parsedN, inputError: '' };
    } catch (e) {
      return { n: 5, inputError: e.message };
    }
  }, [nInput]);

  const steps = useMemo(
    () =>
      generateSteps(n).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [n]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setNInput(String(e.n)); handleReset(); }, [handleReset]);

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
              <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />
      ),
    },
    {
      id: 'viz',
      title: '📊 Staircase',
      content: (
        <VisualizationPanel
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
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
          onSpeedChange={e => setSpeed(Number(
            <>e.target.value
    </>))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      
    </div>
  )
}
