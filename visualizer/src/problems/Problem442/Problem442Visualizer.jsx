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
import './Problem442Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('find-all-duplicates-in-array')

const PATTERNS = ['check', 'complete', 'found_duplicate', 'init', 'mark_seen']
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'check',
  3: 'found_duplicate',
  4: 'mark_seen',
  5: 'complete'
}


const EXAMPLES = getExamples('find-all-duplicates-in-array')

function generateSteps(nums) {
  const steps = []

  if (!nums || nums.length === 0) {
    steps.push({
      activeLine: 1,
      phase: 'init',
      nums: [],
      seen: new Set(),
      duplicates: [],
      current: null,
      message: 'Empty array',
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    phase: 'init',
    nums: [...nums],
    seen: new Set(),
    duplicates: [],
    current: null,
    message: 'Find all duplicates in array',
  })

  let seen = new Set()
  let duplicates = []

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i]

    steps.push({
      activeLine: 2,
      phase: 'check',
      nums: [...nums],
      seen: new Set(seen),
      duplicates: [...duplicates],
      current: { value: num, index: i },
      message: `Check element ${num} at index ${i}`,
    })

    if (seen.has(num)) {
      duplicates.push(num)

      steps.push({
        activeLine: 3,
        phase: 'found_duplicate',
        nums: [...nums],
        seen: new Set(seen),
        duplicates: [...duplicates],
        current: { value: num, index: i, isDuplicate: true },
        message: `Found duplicate: ${num}`,
      })
    } else {
      seen.add(num)

      steps.push({
        activeLine: 4,
        phase: 'mark_seen',
        nums: [...nums],
        seen: new Set(seen),
        duplicates: [...duplicates],
        current: { value: num, index: i },
        message: `Mark ${num} as seen`,
      })
    }
  }

  steps.push({
    activeLine: 5,
    phase: 'complete',
    nums: [...nums],
    seen: new Set(seen),
    duplicates: [...duplicates],
    current: null,
    isComplete: true,
    message: `Found ${duplicates.length} duplicate(s)`,
  })

  return steps
}

function ArrayVisualization({ nums, current, seen, duplicates }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Array</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 100,
      }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {nums.map((num, idx) => {
            const isCurrent = current && current.index === idx
            const isDuplicate = current && current.isDuplicate && current.value === num
            const isSeen = seen && seen.has(num)

            return (
              <motion.div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  backgroundColor: isDuplicate ? '#fee2e2' : isCurrent ? '#fef2f2' : isSeen ? '#ecfdf5' : '#f8fafc',
                  border: isDuplicate ? '2px solid #ef4444' : isCurrent ? '3px solid #dc2626' : isSeen ? '2px solid #10b981' : '2px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: isDuplicate ? '#dc2626' : isCurrent ? '#dc2626' : isSeen ? '#047857' : '#64748b',
                }}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                }}
                >
                  {num}
                </div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 500, minWidth: 24, textAlign: 'center' }}>
                  {idx}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SeenMapVisualization({ seen }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Seen Map</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 80,
      }}>
        {seen && seen.size > 0 ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Array.from(seen).sort((a, b) => a - b).map((num) => (
              <motion.div
                key={num}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#d1fae5',
                  borderRadius: 4,
                  border: '2px solid #10b981',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#047857',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                {num}
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>Building map...</div>
        )}
      </div>
    </div>
  )
}

function DuplicatesVisualization({ duplicates }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Duplicates Found</div>
      <div style={{
        padding: 12,
        backgroundColor: '#fee2e2',
        borderRadius: 8,
        border: '2px solid #ef4444',
        minHeight: 80,
      }}>
        {duplicates && duplicates.length > 0 ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {duplicates.map((num, idx) => (
              <motion.div
                key={idx}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#fecaca',
                  borderRadius: 4,
                  border: '2px solid #ef4444',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#dc2626',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                {num}
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>No duplicates yet</div>
        )}
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

      <ArrayVisualization
        nums={step?.nums || []}
        current={step?.current}
        seen={step?.seen}
        duplicates={step?.duplicates || []}
      />

      <SeenMapVisualization
        seen={step?.seen}
      />

      <DuplicatesVisualization
        duplicates={step?.duplicates || []}
      />
    </div>
  )
}

export default function Problem442Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [numsInput, setNumsInput] = useState("[4,3,2,7,8,2,3,1]");
  const { nums, inputError } = useMemo(() => {
    try {
      const parsedNums = JSON.parse(numsInput); if (!Array.isArray(parsedNums)) throw new Error('nums must be an array');
      return { nums: parsedNums, inputError: '' };
    } catch (e) {
      return { nums: "[4,3,2,7,8,2,3,1]", inputError: e.message };
    }
  }, [numsInput]);

  const steps = useMemo(
    () =>
      generateSteps(nums).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [nums]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setNumsInput(JSON.stringify(e.nums)); handleReset(); }, [handleReset]);

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
      title: '📋 Duplicates',
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
          onSpeedChange={e => setSpeed(Number(e.target.value
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
