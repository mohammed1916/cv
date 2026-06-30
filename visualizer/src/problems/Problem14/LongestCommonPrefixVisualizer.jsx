import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { getExamples } from '../../config/examplesRegistry'
import './LongestCommonPrefixVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def longestCommonPrefix(self, strs: List[str]) -> str:' },
  { line: 3, text: '        if not strs:' },
  { line: 4, text: '            return ""' },
  { line: 5, text: '        for col in range(len(strs[0])):' },
  { line: 6, text: '            for row in range(1, len(strs)):' },
  { line: 7, text: '                if col >= len(strs[row]) or strs[row][col] != strs[0][col]:' },
  { line: 8, text: '                    return strs[0][:col]' },
  { line: 9, text: '        return strs[0]' },
  { line: 10, text: '' },
]

const LCP_PATTERNS = ['done', 'init', 'check_col', 'check_row', 'out_of_bounds', 'compare_char', 'mismatch', 'col_complete']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  4: 'done',           // return ""
  5: 'init',           // for col in range(len(strs[0])):
  5: 'check_col',      // Compare column
  6: 'check_row',      // for row in range(1, len(strs)):
  7: 'out_of_bounds',  // Check out of bounds
  7: 'compare_char',   // Compare characters
  8: 'mismatch',       // Mismatch found
  5: 'col_complete',   // Column complete
  9: 'done',           // return strs[0]
}

function generateSteps(strs) {
  const steps = []

  if (!strs || strs.length === 0) {
    steps.push({
      phase: 'done',
      col: null,
      row: null,
      prefix: '',
      activeLine: 4,
      message: 'Empty array. Return empty string.',
    })
    return steps
  }

  steps.push({
    phase: 'init',
    col: null,
    row: null,
    prefix: '',
    activeLine: 5,
    message: `Initialize column pointer. Array has ${strs.length} string(s).`,
  })

  for (let col = 0; col < strs[0].length; col++) {
    const baseChar = strs[0][col]

    steps.push({
      phase: 'check_col',
      col,
      row: null,
      prefix: strs[0].substring(0, col),
      activeLine: 5,
      message: `Compare column ${col}: character '${baseChar}' from strs[0].`,
    })

    let mismatchFound = false

    for (let row = 1; row < strs.length; row++) {
      steps.push({
        phase: 'check_row',
        col,
        row,
        prefix: strs[0].substring(0, col),
        activeLine: 6,
        message: `Check strs[${row}] = "${strs[row]}" at column ${col}.`,
      })

      if (col >= strs[row].length) {
        steps.push({
          phase: 'out_of_bounds',
          col,
          row,
          prefix: strs[0].substring(0, col),
          activeLine: 7,
          message: `Column ${col} is out of bounds for strs[${row}] (length=${strs[row].length}).`,
        })
        mismatchFound = true
        break
      }

      const rowChar = strs[row][col]

      steps.push({
        phase: 'compare_char',
        col,
        row,
        prefix: strs[0].substring(0, col),
        baseChar,
        rowChar,
        activeLine: 7,
        message: `Compare: '${baseChar}' (strs[0][${col}]) vs '${rowChar}' (strs[${row}][${col}]).`,
      })

      if (rowChar !== baseChar) {
        steps.push({
          phase: 'mismatch',
          col,
          row,
          prefix: strs[0].substring(0, col),
          activeLine: 8,
          message: `Mismatch found! Common prefix is "${strs[0].substring(0, col)}".`,
        })
        mismatchFound = true
        break
      }
    }

    if (mismatchFound) {
      return steps
    }

    steps.push({
      phase: 'col_complete',
      col,
      row: null,
      prefix: strs[0].substring(0, col + 1),
      activeLine: 5,
      message: `Column ${col} matched across all strings. Prefix: "${strs[0].substring(0, col + 1)}".`,
    })
  }

  steps.push({
    phase: 'done',
    col: null,
    row: null,
    prefix: strs[0],
    activeLine: 9,
    message: `All characters matched. Common prefix is "${strs[0]}".`,
  })

  return steps
}

const EXAMPLES = getExamples('longest-common-prefix')

function InputPanel({ strsInput, setStrsInput, handleReset, applyExample, inputError }) {
  return (
    <div className="lcp-panel-body">
      <div className="lcp-examples">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            className="lcp-example-btn"
            onClick={() => applyExample(ex)}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="lcp-input-section">
        <label htmlFor="strs-input" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#64748b', minWidth: 60 }}>strs =</span>
          <input
            id="strs-input"
            value={strsInput}
            onChange={(e) => {
              setStrsInput(e.target.value)
              handleReset()
            }}
            placeholder='["flower", "flow", "flight"]'
            className="lcp-input"
          />
        </label>
        {inputError && (
          <div style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>
            {inputError}
          </div>
        )}
      </div>

      <div className="lcp-format-help">
        <div className="lcp-help-title">Format</div>
        <div className="lcp-help-text">Enter as JSON array: ["str1", "str2", "str3"]</div>
      </div>
    </div>
  )
}

function StringsVisualizationPanel({ step, strs }) {
  return (
    <div className="lcp-panel-body">
      <div className="lcp-viz-section">
        <h3 className="lcp-section-title">Strings Grid</h3>
        <div className="lcp-strings-grid">
          {strs.map((str, rowIdx) => (
            <div key={rowIdx} className={`lcp-string-row ${rowIdx === 0 ? 'base' : ''}`}>
              <div className="lcp-row-label">strs[{rowIdx}]:</div>
              <div className="lcp-chars-container">
                {str.split('').map((char, colIdx) => {
                  const isActive = step?.col === colIdx && step?.row === rowIdx
                  const isBaseActive = step?.col === colIdx && rowIdx === 0 && step?.phase !== 'done'
                  const isInPrefix = colIdx < (step?.prefix?.length ?? 0)
                  const isBoundaryViolation = step?.phase === 'out_of_bounds' && colIdx === step?.col && rowIdx === step?.row

                  return (
                    <div key={colIdx} className="lcp-char-wrapper">
                      <div className="lcp-col-index">{colIdx}</div>
                      <motion.div
                        className={`lcp-char-cell ${isActive ? 'active' : ''} ${isBaseActive ? 'base-active' : ''} ${isInPrefix ? 'in-prefix' : ''} ${isBoundaryViolation ? 'boundary' : ''}`}
                        animate={isActive ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      >
                        {char}
                      </motion.div>
                    </div>
                  )
                })}
                {str.length === 0 && <div className="lcp-empty-string">empty</div>}
              </div>
            </div>
          ))}
          {strs.length === 0 && (
            <div className="lcp-empty-array">Empty array</div>
          )}
        </div>
      </div>
    </div>
  )
}

function PrefixPanel({ step, strs }) {
  return (
    <div className="lcp-panel-body">
      <div className="lcp-viz-section">
        <h3 className="lcp-section-title">Common Prefix</h3>
        <div className="lcp-prefix-display">
          {step && step.prefix ? (
            <motion.div
              className="lcp-prefix-value"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={step.prefix}
            >
              "{step.prefix}"
            </motion.div>
          ) : (
            <div className="lcp-prefix-empty">—</div>
          )}
          <div className="lcp-prefix-length">
            Length: <span className="lcp-length-value">{step?.prefix?.length ?? 0}</span>
          </div>
        </div>

        <div className="lcp-comparison-info">
          <div className="lcp-info-title">Current Position</div>
          {step && (
            <div className="lcp-position-details">
              {step.phase === 'done' ? (
                <div className="lcp-position-row">Final result computed</div>
              ) : step.col !== null ? (
                <>
                  <div className="lcp-position-row">
                    <span className="lcp-label">Column:</span> {step.col}
                  </div>
                  {step.row !== null && (
                    <div className="lcp-position-row">
                      <span className="lcp-label">Row:</span> {step.row}
                    </div>
                  )}
                </>
              ) : (
                <div className="lcp-position-row">Press play to start</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusPanel({ step }) {
  return (
    <div className="lcp-panel-body">
      <div className="lcp-status-content">
        <div className="lcp-step-info">
          {step?.message ?? 'Press Play to begin.'}
        </div>
        {step?.phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lcp-result-badge"
          >
            ✓ Complete: "{step?.prefix ?? ''}"
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function LongestCommonPrefixVisualizer() {
  const [strsInput, setStrsInput] = useState('["flower", "flow", "flight"]')
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const { strs, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(strsInput)
      if (!Array.isArray(parsed) || !parsed.every(item => typeof item === 'string')) {
        return { strs: [], inputError: 'Input must be an array of strings' }
      }
      return { strs: parsed, inputError: '' }
    } catch {
      return { strs: [], inputError: 'Invalid JSON format' }
    }
  }, [strsInput])

  const steps = useMemo(() => generateSteps(strs), [strs])

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
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback(
    (ex) => {
      setStrsInput(JSON.stringify(ex.strs))
      handleReset()
    },
    [handleReset],
  )

  const dockPanels = useMemo(() => [
    {
      id: 'input',
      title: 'Input & Format',
      subtitle: strsInput ? `${strs.length} string(s)` : 'Enter array of strings',
      defaultZone: 'left',
      content: (
        <InputPanel
          strsInput={strsInput}
          setStrsInput={setStrsInput}
          handleReset={handleReset}
          applyExample={applyExample}
          inputError={inputError}
        />
      ),
    },
    {
      id: 'strings-viz',
      title: 'Strings Grid',
      subtitle: step ? `Step ${stepIndex + 1} of ${steps.length}` : 'Column-by-column comparison',
      defaultZone: 'left',
      content: <StringsVisualizationPanel step={step} strs={strs} />,
    },
    {
      id: 'prefix-viz',
      title: 'Common Prefix',
      subtitle: `Length: ${step?.prefix?.length ?? 0}`,
      defaultZone: 'right',
      content: <PrefixPanel step={step} strs={strs} />,
    },
    {
      id: 'code',
      title: 'Code Trace',
      subtitle: step ? `Active line ${step.activeLine}` : 'Line-by-line solution view',
      defaultZone: 'full',
      content: (
        <div style={{ position: 'relative' }}>
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            autoScroll={autoScrollCode}
            onActiveLineDomChange={setActiveLineDom}
          />
          {showPatternOverlay && (
            <CodePatternAnnotations
              linePatterns={LINE_PATTERN_MAP}
              currentPhase={step?.phase}
              activeLineDom={activeLineDom}
            />
          )}
        </div>
      ),
    },
    {
      id: 'status',
      title: 'Status',
      subtitle: step?.phase === 'done' ? 'Complete' : 'Current step message',
      defaultZone: 'right',
      content: <StatusPanel step={step} />,
    },
  ], [strsInput, step, stepIndex, steps.length, strs, applyExample, inputError, autoScrollCode, setActiveLineDom, handleReset])

  const summaryCards = [
    { label: 'Algorithm', value: 'Horizontal Scanning' },
    { label: 'Time Complexity', value: 'O(n·m)' },
    { label: 'Space Complexity', value: 'O(1)' },
    { label: 'Strings Count', value: strs.length || '—' },
  ]

  return (
    <div className="lcp-shell">
      <section className="lcp-hero">
        <div className="lcp-hero-copy">
          <span className="lcp-kicker">Longest Common Prefix • LeetCode #14</span>
          <h2>Find the Longest Common Prefix String</h2>
          <p>
            This visualization demonstrates a horizontal scanning algorithm that compares characters
            column-by-column across all strings to find the longest common prefix. The algorithm
            stops as soon as a mismatch is found or a string ends.
          </p>
        </div>

        <div className="lcp-summary-grid">
          {summaryCards.map((card) => (
            <div key={card.label} className="lcp-summary-card">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <DockableWorkspace
        title="Longest Common Prefix Workspace"
        panels={dockPanels}
        initialLayout={{
          rows: [
            ['input', 'strings-viz', 'prefix-viz'],
            ['code'],
            ['status'],
          ],
          minimized: [],
        }}
      />

      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={LCP_PATTERNS} />
        )}
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
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
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
      </FloatingPanel>

      {showPatternOverlay && step && (
        <PatternOverlay step={step} activeLineDom={activeLineDom} />
      )}
    </div>
  )
}
