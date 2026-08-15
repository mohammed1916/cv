import { useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import FloatingPanel from '../../components/shared/FloatingPanel'
import GridRayOverlay from '../../components/shared/GridRayOverlay'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import VisualizationControls from '../../components/VisualizationControls'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useVisualizationFeatures } from '../../hooks/useVisualizationFeatures'
import { useGridRayOverlay } from '../../hooks/useGridRayOverlay'
import { getVisualizationFeatures } from '../../config/visualizationRegistry'
import { getExamplesOr } from '../../config/examplesRegistry'
import './RegularExpressionMatchingVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
const SOLUTION_CODE = [
  { line: 1, text: 'def isMatch(s, p):' },
  { line: 2, text: '    m, n = len(s), len(p)' },
  { line: 3, text: '    dp = [[False] * (n + 1) for _ in range(m + 1)]' },
  { line: 4, text: '    dp[0][0] = True' },
  { line: 5, text: "    for j in range(1, n + 1):" },
  { line: 6, text: "        if p[j - 1] == '*': dp[0][j] = dp[0][j - 2]" },
  { line: 7, text: '    for i in range(1, m + 1):' },
  { line: 8, text: '        for j in range(1, n + 1):' },
  { line: 9, text: "            if p[j - 1] != '*':" },
  { line: 10, text: "                matches = p[j - 1] == '.' or s[i - 1] == p[j - 1]" },
  { line: 11, text: '                if matches: dp[i][j] = dp[i - 1][j - 1]' },
  { line: 12, text: '                # dp[i][j] now holds the character/dot result' },
  { line: 13, text: '            else:' },
  { line: 14, text: "                # '*' can match 0 or more of the preceding element" },
  { line: 15, text: '                dp[i][j] = dp[i][j - 2]  # Case 1: zero occurrences' },
  { line: 16, text: "                prev_matches = p[j - 2] == '.' or s[i - 1] == p[j - 2]" },
  { line: 17, text: '                if prev_matches and dp[i - 1][j]: dp[i][j] = True' },
  { line: 18, text: '                # else dp[i][j] keeps the zero-occurrence result' },
  { line: 19, text: '' },
  { line: 20, text: '    return dp[m][n]' },
]

const REGEX_PATTERNS = ['init', 'check', 'char_or_dot', 'char_result', 'star_check', 'star_zero', 'star_multi', 'star_result']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  6: 'init',         // Initialize DP table and base cases
  8: 'check',        // Check each cell
  10: 'char_or_dot', // Handle . and character match
  11: 'char_or_dot', // dp[i][j] = dp[i-1][j-1]
  12: 'char_result', // Result for character/dot case
  14: 'star_check',  // Handle * case
  15: 'star_zero',   // Zero occurrences of *
  16: 'star_multi',  // Multiple occurrences
  17: 'star_result', // Result for * case
}

function generateSteps(s, p) {
  const steps = []
  const m = s.length
  const n = p.length

  // Initialize DP table
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(false))
  dp[0][0] = true

  // Handle patterns like a*, a*b*, etc. that can match empty string
  for (let j = 1; j <= n; j++) {
    if (p[j - 1] === '*') {
      dp[0][j] = dp[0][j - 2]
    }
  }

  steps.push({
    phase: 'init',
    i: null,
    j: null,
    char_s: null,
    char_p: null,
    char_p_next: null,
    match: null,
    activeLine: 6,
    message: `Initialize DP table (${m + 1}x${n + 1}). dp[0][0] = true.`,
    dpTable: dp.map(row => [...row]),
  })

  // Fill the DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const s_char = s[i - 1]
      const p_char = p[j - 1]

      steps.push({
        phase: 'check',
        i,
        j,
        char_s: s_char,
        char_p: p_char,
        char_p_next: j < n ? p[j] : null,
        match: null,
        activeLine: 8,
        message: `Check dp[${i}][${j}]: s[${i - 1}]='${s_char}', p[${j - 1}]='${p_char}'`,
        dpTable: dp.map(row => [...row]),
      })

      if (p_char !== '*') {
        // Character or '.' case
        const matches = p_char === '.' || s_char === p_char

        steps.push({
          phase: 'char_or_dot',
          i,
          j,
          char_s: s_char,
          char_p: p_char,
          char_p_next: null,
          match: matches,
          activeLine: p_char === '.' ? 10 : 11,
          message: p_char === '.'
            ? `'.' matches any char. Match = true`
            : `s[${i - 1}]='${s_char}' ${matches ? '===' : '!=='} p[${j - 1}]='${p_char}'. Match = ${matches}`,
          dpTable: dp.map(row => [...row]),
        })

        if (matches) {
          dp[i][j] = dp[i - 1][j - 1]
        }

        steps.push({
          phase: 'char_result',
          i,
          j,
          char_s: s_char,
          char_p: p_char,
          char_p_next: null,
          match: matches,
          activeLine: 12,
          message: `dp[${i}][${j}] = ${dp[i][j]}`,
          dpTable: dp.map(row => [...row]),
        })
      } else {
        // '*' case: can match 0 or more of previous character
        steps.push({
          phase: 'star_check',
          i,
          j,
          char_s: s_char,
          char_p: p_char,
          char_p_next: null,
          match: null,
          activeLine: 14,
          message: `'*' can match 0 or more characters. Check two cases:`,
          dpTable: dp.map(row => [...row]),
        })

        // Case 1: Match 0 occurrences (skip p[j-2:j])
        steps.push({
          phase: 'star_zero',
          i,
          j,
          char_s: s_char,
          char_p: p_char,
          char_p_next: null,
          match: null,
          activeLine: 15,
          message: `Case 1 (skip x*): dp[${i}][${j - 2}] = ${dp[i][j - 2]}`,
          dpTable: dp.map(row => [...row]),
        })

        dp[i][j] = dp[i][j - 2]

        // Case 2: Match 1+ occurrences (p[j-1] matches s[i-1])
        const prevCharMatches = p[j - 2] === '.' || s_char === p[j - 2]

        steps.push({
          phase: 'star_multi',
          i,
          j,
          char_s: s_char,
          char_p: p[j - 2],
          char_p_next: null,
          match: prevCharMatches,
          activeLine: 16,
          message: `Case 2 (match x+): p[${j - 2}]='${p[j - 2]}' ${prevCharMatches ? 'matches' : 'does not match'} s[${i - 1}]='${s_char}'`,
          dpTable: dp.map(row => [...row]),
        })

        if (prevCharMatches && dp[i - 1][j]) {
          dp[i][j] = true

          steps.push({
            phase: 'star_result',
            i,
            j,
            char_s: s_char,
            char_p: p_char,
            char_p_next: null,
            match: true,
            activeLine: 17,
            message: `Match found! dp[${i}][${j}] = true (dp[${i - 1}][${j}] was true)`,
            dpTable: dp.map(row => [...row]),
          })
        } else {
          steps.push({
            phase: 'star_result',
            i,
            j,
            char_s: s_char,
            char_p: p_char,
            char_p_next: null,
            match: false,
            activeLine: 18,
            message: `dp[${i}][${j}] = ${dp[i][j]}`,
            dpTable: dp.map(row => [...row]),
          })
        }
      }
    }
  }

  steps.push({
    phase: 'done',
    i: null,
    j: null,
    char_s: null,
    char_p: null,
    char_p_next: null,
    match: null,
    activeLine: 20,
    message: `Result: dp[${m}][${n}] = ${dp[m][n]}. Pattern ${dp[m][n] ? 'matches' : 'does not match'} string.`,
    dpTable: dp.map(row => [...row]),
  })

  return steps
}

const EXAMPLES = getExamplesOr('regular-expression-matching', [
  { label: '"a", "a"', s: 'a', p: 'a' },
  { label: '"aa", "a"', s: 'aa', p: 'a' },
  { label: '"aa", "."', s: 'aa', p: '.' },
  { label: '"aa", "a*"', s: 'aa', p: 'a*' },
  { label: '"ab", ".*"', s: 'ab', p: '.*' },
  { label: '"aab", "c*a*b"', s: 'aab', p: 'c*a*b' },
  { label: '"mississippi", "mis*is*p*."', s: 'mississippi', p: 'mis*is*p*.' },
])

function VariablesPanel({ step, s, p }) {
  return (
    <div className="rem-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="rem-panel-head">Variables</div>
      <div className="rem-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {step && step.i !== null && (
          <>
            <div className="rem-var-card">
              <span className="rem-var-name">i (string index)</span>
              <span className="rem-var-val">{step.i}</span>
              <span className="rem-var-desc">Current position in string "{s}"</span>
            </div>

            <div className="rem-var-card">
              <span className="rem-var-name">j (pattern index)</span>
              <span className="rem-var-val">{step.j}</span>
              <span className="rem-var-desc">Current position in pattern "{p}"</span>
            </div>

            {step.char_s !== null && (
              <div className="rem-var-card highlight">
                <span className="rem-var-name">char_s</span>
                <span className="rem-var-val">'{step.char_s}'</span>
                <span className="rem-var-desc">s[{step.i - 1}]</span>
              </div>
            )}

            {step.char_p !== null && (
              <div className="rem-var-card highlight">
                <span className="rem-var-name">char_p</span>
                <span className="rem-var-val">'{step.char_p}'</span>
                <span className="rem-var-desc">p[{step.j - 1}]</span>
              </div>
            )}

            {step.match !== null && (
              <div className={`rem-result-card ${step.match ? 'match' : 'no-match'}`}>
                <span className="rem-result-label">Match</span>
                <span className="rem-result-val">{step.match ? 'YES' : 'NO'}</span>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

function VisualizationPanel({
  sInput,
  setSInput,
  pInput,
  setPInput,
  s,
  p,
  inputError,
  handleReset,
  step,
  applyExample,
}) {
  const m = s.length
  const n = p.length
  const { gridRef, gridSize, getCellCenter } = useGridRayOverlay()

  const raySourceCoords = useMemo(() => {
    if (!step || step.i == null || step.j == null) return []
    if (step.phase === 'char_or_dot' || step.phase === 'char_result') {
      return [[step.i - 1, step.j - 1]]
    }
    if (step.phase === 'star_check' || step.phase === 'star_zero' || step.phase === 'star_multi' || step.phase === 'star_result') {
      return [[step.i, step.j - 2], [step.i - 1, step.j]]
    }
    return []
  }, [step])

  const raySources = useMemo(
    () => new Set(raySourceCoords.map(([r, c]) => `${r}-${c}`)),
    [raySourceCoords]
  )

  const rays = useMemo(() => {
    if (!step || step.i == null || step.j == null) return []
    const target = getCellCenter(step.i, step.j)
    if (!target) return []

    if (step.phase === 'char_or_dot' || step.phase === 'char_result') {
      const from = getCellCenter(step.i - 1, step.j - 1)
      if (!from) return []
      return [{
        key: `diag-${step.i}-${step.j}`,
        from, to: target,
        color: step.match ? 'var(--success-color, #22c55e)' : 'var(--error-color, #ef4444)',
      }]
    }

    if (step.phase === 'star_check' || step.phase === 'star_zero' || step.phase === 'star_multi' || step.phase === 'star_result') {
      const zeroFrom = getCellCenter(step.i, step.j - 2)
      const multiFrom = getCellCenter(step.i - 1, step.j)
      const out = []
      if (zeroFrom) {
        out.push({
          key: `zero-${step.i}-${step.j}`,
          from: zeroFrom, to: target,
          color: 'var(--active-border, #3b82f6)',
        })
      }
      if (multiFrom) {
        const multiKnown = step.phase === 'star_multi' || step.phase === 'star_result'
        out.push({
          key: `multi-${step.i}-${step.j}`,
          from: multiFrom, to: target,
          color: multiKnown
            ? (step.match ? 'var(--success-color, #22c55e)' : 'var(--error-color, #ef4444)')
            : 'var(--active-border, #3b82f6)',
        })
      }
      return out
    }

    return []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, gridSize])

  return (
    <div className="rem-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="rem-panel-head">
        DP Table & Strings
        {inputError && <span style={{ color: '#ea0c0c', marginLeft: 8 }}>{inputError}</span>}
      </div>
      <div className="rem-panel-body" style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => applyExample(ex)}
              className="rem-example-btn"
            >
              {ex.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#64748b', fontSize: 13, fontFamily: 'monospace' }}>s =</span>
          <input
            value={sInput}
            onChange={(e) => { setSInput(e.target.value); handleReset() }}
            placeholder='"a"'
            className="rem-input"
            style={{ flex: 1, minWidth: '120px', margin: 0 }}
          />
          <span style={{ color: '#64748b', fontSize: 13, fontFamily: 'monospace' }}>p =</span>
          <input
            value={pInput}
            onChange={(e) => { setPInput(e.target.value); handleReset() }}
            placeholder='"a"'
            className="rem-input"
            style={{ flex: 1, minWidth: '120px', margin: 0 }}
          />
        </div>

        <div className="rem-strings-display">
          <div className="rem-string-row">
            <span className="rem-string-label">String:</span>
            <div className="rem-string-chars">
              {s.split('').map((char, idx) => {
                const isActive = step && step.i === idx + 1 && step.phase !== 'done'
                const isProcessed = step && step.i > idx + 1
                return (
                  <div
                    key={`s-${idx}`}
                    className={`rem-char-box ${isActive ? 'active' : ''} ${isProcessed ? 'processed' : ''}`}
                  >
                    {char}
                  </div>
                )
              })}
              {s.length === 0 && <span className="rem-empty-label">empty</span>}
            </div>
          </div>

          <div className="rem-string-row">
            <span className="rem-string-label">Pattern:</span>
            <div className="rem-string-chars">
              {p.split('').map((char, idx) => {
                const isActive = step && step.j === idx + 1 && step.phase !== 'done'
                const isProcessed = step && step.j > idx + 1
                return (
                  <div
                    key={`p-${idx}`}
                    className={`rem-char-box ${isActive ? 'active' : ''} ${isProcessed ? 'processed' : ''}`}
                  >
                    {char}
                  </div>
                )
              })}
              {p.length === 0 && <span className="rem-empty-label">empty</span>}
            </div>
          </div>
        </div>

        <div className="rem-dp-table-container">
          <span className="rem-section-title">DP Table (m={m}, n={n})</span>
          <div className="rem-dp-table-wrap">
            <div className="rem-dp-table" ref={gridRef}>
              {/* Header row with pattern characters */}
              <div className="rem-dp-row">
                <div className="rem-dp-cell header empty"></div>
                <div className="rem-dp-cell header empty">ε</div>
                {p.split('').map((char, j) => (
                  <div key={`ph-${j}`} className="rem-dp-cell header">
                    {char}
                  </div>
                ))}
              </div>

              {/* Data rows */}
              {step?.dpTable && step.dpTable.map((row, i) => (
                <div key={`row-${i}`} className="rem-dp-row">
                  <div className="rem-dp-cell header empty">
                    {i === 0 ? 'ε' : s[i - 1]}
                  </div>
                  {row.map((val, j) => {
                    const isCurrent = step && step.i === i && step.j === j && step.phase !== 'done'
                    const isTarget = step && step.phase === 'done' && i === m && j === n
                    const isSource = raySources.has(`${i}-${j}`)

                    return (
                      <motion.div
                        key={`cell-${i}-${j}`}
                        data-cell={`${i}-${j}`}
                        className={`rem-dp-cell ${val ? 'true' : 'false'} ${isCurrent ? 'current' : ''} ${isTarget ? 'target' : ''} ${isSource ? 'ray-source' : ''}`}
                        animate={isCurrent || isTarget ? { scale: 1.05 } : { scale: 1 }}
                      >
                        {val ? 'T' : 'F'}
                      </motion.div>
                    )
                  })}
                </div>
              ))}
            </div>

            <GridRayOverlay gridSize={gridSize} rays={rays} />
          </div>
        </div>

      </div>
    </div>
  )
}

export default function RegularExpressionMatchingVisualizer() {
  const [sInput, setSInput] = useState('"a"')
  const [pInput, setPInput] = useState('"a"')
  const [panelDivs, setPanelDivs] = useState(null)

  // Load solution code from registry

  const { s, p, inputError } = useMemo(() => {
    try {
      // Remove quotes if present
      let s_val = sInput.startsWith('"') ? sInput.slice(1, -1) : sInput
      let p_val = pInput.startsWith('"') ? pInput.slice(1, -1) : pInput

      if (s_val.length > 30 || p_val.length > 30) {
        return { s: '', p: '', inputError: 'Input strings must be <= 30 characters' }
      }
      return { s: s_val, p: p_val, inputError: '' }
    } catch (e) {
      return { s: '', p: '', inputError: e.message || 'Invalid input' }
    }
  }, [sInput, pInput])

  const steps = useMemo(
    () => generateSteps(s, p).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [s, p],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  // Use modular visualization features system
  const vizFeatureDefs = getVisualizationFeatures('regular-expression-matching')
  const { items: vizFeatures, toggle: toggleVizFeature, enabledIds: enabledVizIds } = useVisualizationFeatures(vizFeatureDefs)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setSInput(`"${ex.s}"`)
    setPInput(`"${ex.p}"`)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const panelConfigs = useMemo(
    () => [
      { id: 'main', title: 'Visualization', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )

  const handlePanelReady = useCallback((divs) => {
    setPanelDivs(divs)
  }, [])

  const codePanel = (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        autoScroll={autoScrollCode}
        disableResizer
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
  )

  const mainPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"s","label":"s","type":"string"},{"key":"p","label":"p","type":"string"}]}
        values={{ s: sInput, p: pInput }}
        onChange={(k, v) => { if (k === 's') setSInput(v); if (k === 'p') setPInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />
      <VisualizationPanel
      sInput={sInput}
      setSInput={setSInput}
      pInput={pInput}
      setPInput={setPInput}
      s={s}
      p={p}
      inputError={inputError}
      handleReset={handleReset}
      step={step}
      applyExample={applyExample}
    />
    </>
  )

  const statusPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '12px 16px', minHeight: 0 }}>
      <div style={{ fontSize: 13, color: '#475569' }}>
        {step ? (step.phase === 'done' ? `Match: ${step.dpTable[s.length][p.length] ? 'Yes' : 'No'}` : step.message) : 'Press Play or Step to begin.'}
      </div>
    </div>
  )

  return (
    <div className="rem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.main && createPortal(mainPanel, panelDivs.main)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}

      {createPortal(
        <FloatingPanel title="Playback Controls">
          {showPatternOverlay && (
            <PatternLegend currentPhase={step?.phase} usedPatterns={REGEX_PATTERNS} />
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
            onSpeedChange={(e) => setSpeed(Number(e.target.value))}
            showPatternOverlay={showPatternOverlay}
            onShowPatternOverlayChange={setShowPatternOverlay}
            patternOverlayLabel="Show pattern overlay"
            showPatternOverlayToggle
            autoScroll={autoScrollCode}
            onAutoScrollChange={setAutoScrollCode}
            showAutoScroll
          />
          {vizFeatures.length > 0 && (
            <VisualizationControls features={vizFeatures} onToggle={toggleVizFeature} />
          )}
        </FloatingPanel>,
        document.body
      )}
    </div>
  )
}
