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
import './Problem443Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('string-compression')

const PATTERNS = ['complete', 'count_chars', 'init', 'start_group', 'write_char', 'write_count']
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'start_group',
  3: 'count_chars',
  4: 'write_char',
  5: 'write_count',
  6: 'complete'
}


const EXAMPLES = getExamples('string-compression')

function generateSteps(chars) {
  const steps = []

  if (!chars || chars.length === 0) {
    steps.push({
      activeLine: 1,
      phase: 'init',
      chars: [],
      write: 0,
      result: [],
      current: null,
      message: 'Empty string',
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    phase: 'init',
    chars: [...chars],
    write: 0,
    result: [],
    current: null,
    message: `Compress: [${chars.join(', ')}]`,
  })

  let write = 0
  let read = 0
  let result = []

  while (read < chars.length) {
    const char = chars[read]
    let count = 1

    steps.push({
      activeLine: 2,
      phase: 'start_group',
      chars: [...chars],
      write,
      result: [...result],
      current: { readIdx: read, char, count: 1 },
      message: `Start group: '${char}'`,
    })

    while (read + count < chars.length && chars[read + count] === char) {
      count++

      steps.push({
        activeLine: 3,
        phase: 'count_chars',
        chars: [...chars],
        write,
        result: [...result],
        current: { readIdx: read, char, count },
        message: `Found ${count} consecutive '${char}'`,
      })
    }

    result.push(char)
    write++

    steps.push({
      activeLine: 4,
      phase: 'write_char',
      chars: [...chars],
      write,
      result: [...result],
      current: { readIdx: read, char, count },
      message: `Write character: '${char}'`,
    })

    if (count > 1) {
      const countStr = String(count)
      for (const digit of countStr) {
        result.push(digit)
        write++

        steps.push({
          activeLine: 5,
          phase: 'write_count',
          chars: [...chars],
          write,
          result: [...result],
          current: { readIdx: read, char, count },
          message: `Write count digit: '${digit}'`,
        })
      }
    }

    read += count
  }

  steps.push({
    activeLine: 6,
    phase: 'complete',
    chars: [...chars],
    write,
    result: [...result],
    current: null,
    isComplete: true,
    message: `Compressed: [${result.join(', ')}] (length: ${write})`,
  })

  return steps
}

function OriginalStringVisualization({ chars, readIdx, current }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Original String</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 100,
      }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {chars.map((char, idx) => {
            const inGroup = current && idx >= current.readIdx && idx < current.readIdx + current.count
            const isStart = idx === current?.readIdx

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
                  backgroundColor: inGroup ? '#dbeafe' : '#f8fafc',
                  border: isStart ? '3px solid #dc2626' : inGroup ? '2px solid #0284c7' : '2px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: inGroup ? '#0c4a6e' : '#64748b',
                }}
                animate={{
                  scale: isStart ? 1.15 : 1,
                }}
                >
                  {char}
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

function CompressedStringVisualization({ result }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Compressed Result</div>
      <div style={{
        padding: 12,
        backgroundColor: '#ecfdf5',
        borderRadius: 8,
        border: '2px solid #10b981',
        minHeight: 100,
      }}>
        {result && result.length > 0 ? (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {result.map((char, idx) => (
              <motion.div
                key={idx}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  backgroundColor: '#d1fae5',
                  border: '2px solid #10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#047857',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                {char}
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>Compressing...</div>
        )}
      </div>
    </div>
  )
}

function StatsVisualization({ chars, result, write }) {
  const originalLen = chars ? chars.length : 0

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
          backgroundColor: '#fee2e2',
          borderRadius: 6,
          border: '2px solid #ef4444',
        }}>
          <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>Original Length</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444', marginTop: 4 }}>
            {originalLen}
          </div>
        </div>
        <div style={{
          padding: 12,
          backgroundColor: '#ecfdf5',
          borderRadius: 6,
          border: '2px solid #10b981',
        }}>
          <div style={{ fontSize: 11, color: '#047857', fontWeight: 600 }}>Compressed Length</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981', marginTop: 4 }}>
            {write}
          </div>
        </div>
        <div style={{
          padding: 12,
          backgroundColor: '#dbeafe',
          borderRadius: 6,
          border: '2px solid #0284c7',
          gridColumn: '1 / -1',
        }}>
          <div style={{ fontSize: 11, color: '#0c4a6e', fontWeight: 600 }}>Reduction</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>
            {originalLen - write} chars
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

      <OriginalStringVisualization
        chars={step?.chars || []}
        readIdx={step?.current?.readIdx}
        current={step?.current}
      />

      <CompressedStringVisualization
        result={step?.result}
      />

      <StatsVisualization
        chars={step?.chars}
        result={step?.result}
        write={step?.write || 0}
      />
    </div>
  )
}

export default function Problem443Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [charsInput, setCharsInput] = useState("[\"a\",\"a\",\"b\",\"b\",\"c\",\"c\",\"c\"]");
  const { chars, inputError } = useMemo(() => {
    try {
      const parsedChars = JSON.parse(charsInput); if (!Array.isArray(parsedChars)) throw new Error('chars must be an array');
      return { chars: parsedChars, inputError: '' };
    } catch (e) {
      return { chars: "[\"a\",\"a\",\"b\",\"b\",\"c\",\"c\",\"c\"]", inputError: e.message };
    }
  }, [charsInput]);

  const steps = useMemo(
    () =>
      generateSteps(chars).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [chars]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setCharsInput(JSON.stringify(e.chars)); handleReset(); }, [handleReset]);

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
      title: '📦 Compression',
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
