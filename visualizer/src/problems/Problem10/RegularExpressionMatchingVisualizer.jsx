import { useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'

import FloatingPanel from '../../components/shared/FloatingPanel'
import GridRayOverlay from '../../components/shared/GridRayOverlay'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
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

const SOLUTION_CODE = [
  { line: 1, text: 'def isMatch(s, p):' },
  { line: 2, text: '    m, n = len(s), len(p)' },
  { line: 3, text: '    dp = [[False] * (n + 1) for _ in range(m + 1)]' },
  { line: 4, text: '    dp[0][0] = True' },
  { line: 5, text: '    for j in range(1, n + 1):' },
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

const REGEX_PATTERNS = [
  'init',
  'check',
  'char_or_dot',
  'char_result',
  'star_check',
  'star_zero',
  'star_multi',
  'star_result',
]

const LINE_PATTERN_MAP = {
  6: 'init',
  8: 'check',
  10: 'char_or_dot',
  11: 'char_or_dot',
  12: 'char_result',
  14: 'star_check',
  15: 'star_zero',
  16: 'star_multi',
  17: 'star_result',
}

function generateSteps(s, p) {
  const steps = []
  const m = s.length
  const n = p.length

  // Initialize DP table.
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(false))

  dp[0][0] = true

  // Handle patterns like a*, a*b*, etc. that can match an empty string.
  for (let j = 1; j <= n; j++) {
    if (p[j - 1] === '*' && j >= 2) {
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
    dpTable: dp.map((row) => [...row]),
  })

  // Fill the DP table.
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
        dpTable: dp.map((row) => [...row]),
      })

      if (p_char !== '*') {
        // Character or '.' case.
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
          message:
            p_char === '.'
              ? "'.' matches any char. Match = true"
              : `s[${i - 1}]='${s_char}' ${matches ? '===' : '!=='
              } p[${j - 1}]='${p_char}'. Match = ${matches}`,
          dpTable: dp.map((row) => [...row]),
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
          dpTable: dp.map((row) => [...row]),
        })
      } else {
        // '*' case: '*' can match zero or more of the previous character.
        steps.push({
          phase: 'star_check',
          i,
          j,
          char_s: s_char,
          char_p: p_char,
          char_p_next: null,
          match: null,
          activeLine: 14,
          message: "'*' can match 0 or more characters. Check two cases:",
          dpTable: dp.map((row) => [...row]),
        })

        // Guard against an invalid pattern that starts with '*'.
        if (j < 2) {
          steps.push({
            phase: 'star_result',
            i,
            j,
            char_s: s_char,
            char_p: p_char,
            char_p_next: null,
            match: false,
            activeLine: 18,
            message: `Invalid '*' position at p[${j - 1}]. '*' requires a preceding element.`,
            dpTable: dp.map((row) => [...row]),
          })

          continue
        }

        // Case 1:
        // Match zero occurrences by skipping the preceding element and '*'.
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
          dpTable: dp.map((row) => [...row]),
        })

        dp[i][j] = dp[i][j - 2]

        // Case 2:
        // Match one or more occurrences if the preceding pattern character
        // matches the current string character.
        const prevCharMatches =
          p[j - 2] === '.' || s_char === p[j - 2]

        steps.push({
          phase: 'star_multi',
          i,
          j,
          char_s: s_char,
          char_p: p[j - 2],
          char_p_next: null,
          match: prevCharMatches,
          activeLine: 16,
          message: `Case 2 (match x+): p[${j - 2}]='${p[j - 2]}' ${prevCharMatches ? 'matches' : 'does not match'
            } s[${i - 1}]='${s_char}'`,
          dpTable: dp.map((row) => [...row]),
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
            message: `Match found! dp[${i}][${j}] = true (dp[${i - 1
              }][${j}] was true)`,
            dpTable: dp.map((row) => [...row]),
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
            dpTable: dp.map((row) => [...row]),
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
    message: `Result: dp[${m}][${n}] = ${dp[m][n]}. Pattern ${dp[m][n] ? 'matches' : 'does not match'
      } string.`,
    dpTable: dp.map((row) => [...row]),
  })

  return steps
}

const EXAMPLES = getExamplesOr('regular-expression-matching', [
  {
    label: '"a", "a"',
    s: 'a',
    p: 'a',
  },
  {
    label: '"aa", "a"',
    s: 'aa',
    p: 'a',
  },
  {
    label: '"aa", "."',
    s: 'aa',
    p: '.',
  },
  {
    label: '"aa", "a*"',
    s: 'aa',
    p: 'a*',
  },
  {
    label: '"ab", ".*"',
    s: 'ab',
    p: '.*',
  },
  {
    label: '"aab", "c*a*b"',
    s: 'aab',
    p: 'c*a*b',
  },
  {
    label: '"mississippi", "mis*is*p*."',
    s: 'mississippi',
    p: 'mis*is*p*.',
  },
])

function VisualizationPanel({ s, p, step }) {
  const m = s.length
  const n = p.length

  const {
    gridRef,
    gridSize,
    getCellCenter,
  } = useGridRayOverlay()

  const raySourceCoords = useMemo(() => {
    if (!step || step.i == null || step.j == null) {
      return []
    }

    if (
      step.phase === 'char_or_dot' ||
      step.phase === 'char_result'
    ) {
      return [[step.i - 1, step.j - 1]]
    }

    if (
      step.phase === 'star_check' ||
      step.phase === 'star_zero' ||
      step.phase === 'star_multi' ||
      step.phase === 'star_result'
    ) {
      const sources = []

      if (step.j >= 2) {
        sources.push([step.i, step.j - 2])
      }

      if (step.i >= 1) {
        sources.push([step.i - 1, step.j])
      }

      return sources
    }

    return []
  }, [step])

  const raySources = useMemo(
    () =>
      new Set(
        raySourceCoords.map(([row, column]) => `${row}-${column}`)
      ),
    [raySourceCoords]
  )

  const rays = useMemo(() => {
    if (!step || step.i == null || step.j == null) {
      return []
    }

    const target = getCellCenter(step.i, step.j)

    if (!target) {
      return []
    }

    if (
      step.phase === 'char_or_dot' ||
      step.phase === 'char_result'
    ) {
      const from = getCellCenter(
        step.i - 1,
        step.j - 1
      )

      if (!from) {
        return []
      }

      return [
        {
          key: `diag-${step.i}-${step.j}`,
          from,
          to: target,
          color: step.match
            ? 'var(--success-color, #22c55e)'
            : 'var(--error-color, #ef4444)',
        },
      ]
    }

    if (
      step.phase === 'star_check' ||
      step.phase === 'star_zero' ||
      step.phase === 'star_multi' ||
      step.phase === 'star_result'
    ) {
      const out = []

      if (step.j >= 2) {
        const zeroFrom = getCellCenter(
          step.i,
          step.j - 2
        )

        if (zeroFrom) {
          out.push({
            key: `zero-${step.i}-${step.j}`,
            from: zeroFrom,
            to: target,
            color: 'var(--active-border, #3b82f6)',
          })
        }
      }

      if (step.i >= 1) {
        const multiFrom = getCellCenter(
          step.i - 1,
          step.j
        )

        if (multiFrom) {
          const multiKnown =
            step.phase === 'star_multi' ||
            step.phase === 'star_result'

          out.push({
            key: `multi-${step.i}-${step.j}`,
            from: multiFrom,
            to: target,
            color: multiKnown
              ? step.match
                ? 'var(--success-color, #22c55e)'
                : 'var(--error-color, #ef4444)'
              : 'var(--active-border, #3b82f6)',
          })
        }
      }

      return out
    }

    return []
    // getCellCenter changes when the measured grid changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, gridSize])

  return (
    <div
      className="rem-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      <div className="rem-panel-head">
        DP Table &amp; Strings
      </div>

      <div
        className="rem-panel-body"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
        }}
      >
        <div className="rem-strings-display">
          <div className="rem-string-row">
            <span className="rem-string-label">
              String:
            </span>

            <div className="rem-string-chars">
              {s.split('').map((char, idx) => {
                const isActive =
                  step &&
                  step.i === idx + 1 &&
                  step.phase !== 'done'

                const isProcessed =
                  step &&
                  step.i != null &&
                  step.i > idx + 1

                return (
                  <div
                    key={`s-${idx}`}
                    className={[
                      'rem-char-box',
                      isActive ? 'active' : '',
                      isProcessed ? 'processed' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {char}
                  </div>
                )
              })}

              {s.length === 0 && (
                <span className="rem-empty-label">
                  empty
                </span>
              )}
            </div>
          </div>

          <div className="rem-string-row">
            <span className="rem-string-label">
              Pattern:
            </span>

            <div className="rem-string-chars">
              {p.split('').map((char, idx) => {
                const isActive =
                  step &&
                  step.j === idx + 1 &&
                  step.phase !== 'done'

                const isProcessed =
                  step &&
                  step.j != null &&
                  step.j > idx + 1

                return (
                  <div
                    key={`p-${idx}`}
                    className={[
                      'rem-char-box',
                      isActive ? 'active' : '',
                      isProcessed ? 'processed' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {char}
                  </div>
                )
              })}

              {p.length === 0 && (
                <span className="rem-empty-label">
                  empty
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="rem-dp-table-container">
          <span className="rem-section-title">
            DP Table (m={m}, n={n})
          </span>

          <div className="rem-dp-table-wrap">
            <div
              className="rem-dp-table"
              ref={gridRef}
            >
              {/* Header row with pattern characters. */}
              <div className="rem-dp-row">
                <div className="rem-dp-cell header empty" />

                <div className="rem-dp-cell header empty">
                  ε
                </div>

                {p.split('').map((char, j) => (
                  <div
                    key={`ph-${j}`}
                    className="rem-dp-cell header"
                  >
                    {char}
                  </div>
                ))}
              </div>

              {/* DP data rows. */}
              {step?.dpTable &&
                step.dpTable.map((row, i) => (
                  <div
                    key={`row-${i}`}
                    className="rem-dp-row"
                  >
                    <div className="rem-dp-cell header empty">
                      {i === 0 ? 'ε' : s[i - 1]}
                    </div>

                    {row.map((val, j) => {
                      const isCurrent =
                        step.i === i &&
                        step.j === j &&
                        step.phase !== 'done'

                      const isTarget =
                        step.phase === 'done' &&
                        i === m &&
                        j === n

                      const isSource =
                        raySources.has(`${i}-${j}`)

                      const cellClassName = [
                        'rem-dp-cell',
                        val ? 'true' : 'false',
                        isCurrent ? 'current' : '',
                        isTarget ? 'target' : '',
                        isSource ? 'ray-source' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')

                      return (
                        <motion.div
                          key={`cell-${i}-${j}`}
                          data-cell={`${i}-${j}`}
                          className={cellClassName}
                          animate={
                            isCurrent || isTarget
                              ? { scale: 1.05 }
                              : { scale: 1 }
                          }
                        >
                          {val ? 'T' : 'F'}
                        </motion.div>
                      )
                    })}
                  </div>
                ))}
            </div>

            <GridRayOverlay
              gridSize={gridSize}
              rays={rays}
            />
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

  const { s, p, inputError } = useMemo(() => {
    try {
      // Remove matching surrounding double quotes when present.
      const sValue =
        sInput.startsWith('"') && sInput.endsWith('"')
          ? sInput.slice(1, -1)
          : sInput

      const pValue =
        pInput.startsWith('"') && pInput.endsWith('"')
          ? pInput.slice(1, -1)
          : pInput

      if (
        sValue.length > 30 ||
        pValue.length > 30
      ) {
        return {
          s: '',
          p: '',
          inputError:
            'Input strings must be <= 30 characters',
        }
      }

      return {
        s: sValue,
        p: pValue,
        inputError: '',
      }
    } catch (error) {
      return {
        s: '',
        p: '',
        inputError:
          error instanceof Error
            ? error.message
            : 'Invalid input',
      }
    }
  }, [sInput, pInput])

  const steps = useMemo(
    () =>
      generateSteps(s, p).map((current) => ({
        ...current,
        relatedLines:
          current.relatedLines ??
          (current.activeLine != null
            ? [current.activeLine]
            : []),
      })),
    [s, p]
  )

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay()

  const [
    autoScrollCode,
    setAutoScrollCode,
  ] = useAutoScroll()

  const vizFeatureDefs =
    getVisualizationFeatures(
      'regular-expression-matching'
    )

  const {
    items: vizFeatures,
    toggle: toggleVizFeature,
  } = useVisualizationFeatures(vizFeatureDefs)

  const step =
    stepIndex >= 0
      ? steps[stepIndex]
      : null

  const applyExample = useCallback(
    (example) => {
      setSInput(`"${example.s}"`)
      setPInput(`"${example.p}"`)
      handleReset()
    },
    [handleReset]
  )

  const handleInputChange = useCallback(
    (key, value) => {
      if (key === 's') {
        setSInput(value)
      }

      if (key === 'p') {
        setPInput(value)
      }

      handleReset()
    },
    [handleReset]
  )

  const connectivity =
    useCodeVisualConnectivity({
      steps,
      stepIndex,
      onStepJump: setStepIndex,
    })

  const panelConfigs = useMemo(
    () => [
      {
        id: 'main',
        title: 'Visualization',
        dockMode: 'split-right',
      },
      {
        id: 'code',
        title: 'Code',
        dockMode: 'split-bottom',
      },
      {
        id: 'status',
        title: 'Status',
        dockMode: 'split-bottom',
        ratio: 0.08,
      },
    ],
    []
  )

  const handlePanelReady = useCallback(
    (divs) => {
      setPanelDivs(divs)
    },
    []
  )

  const codePanel = (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={
          connectivity.highlightedLines
        }
        onLineSelect={
          connectivity.handleLineSelect
        }
        onActiveLineDomChange={
          setActiveLineDom
        }
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      {/*
        ManualInputPanel is the ONLY place that renders:
        - example buttons
        - s input
        - p input
        - input error

        These controls are intentionally not rendered
        inside VisualizationPanel.
      */}
      <ManualInputPanel
        fields={[
          {
            key: 's',
            label: 's',
            type: 'string',
          },
          {
            key: 'p',
            label: 'p',
            type: 'string',
          },
        ]}
        values={{
          s: sInput,
          p: pInput,
        }}
        onChange={handleInputChange}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

      <div
        style={{
          flex: 1,
          minHeight: 0,
        }}
      >
        <VisualizationPanel
          s={s}
          p={p}
          step={step}
        />
      </div>
    </div>
  )

  const statusPanel = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '12px 16px',
        minHeight: 0,
        height: '100%',
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: 'var(--text-muted)',
        }}
      >
        {step
          ? step.phase === 'done'
            ? `Match: ${step.dpTable[s.length][p.length]
              ? 'Yes'
              : 'No'
            }`
            : step.message
          : 'Press Play or Step to begin.'}
      </div>
    </div>
  )

  return (
    <div className="rem-shell">
      <LuminoDockPanel
        panels={panelConfigs}
        onPanelReady={handlePanelReady}
      />

      {panelDivs && (
        <>
          {panelDivs.main &&
            createPortal(
              mainPanel,
              panelDivs.main
            )}

          {panelDivs.code &&
            createPortal(
              codePanel,
              panelDivs.code
            )}

          {panelDivs.status &&
            createPortal(
              statusPanel,
              panelDivs.status
            )}
        </>
      )}

      {createPortal(
        <FloatingPanel title="Playback Controls">
          {showPatternOverlay && (
            <PatternLegend
              currentPhase={step?.phase}
              usedPatterns={REGEX_PATTERNS}
            />
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
            onSpeedChange={(event) =>
              setSpeed(
                Number(event.target.value)
              )
            }
            showPatternOverlay={
              showPatternOverlay
            }
            onShowPatternOverlayChange={
              setShowPatternOverlay
            }
            patternOverlayLabel="Show pattern overlay"
            showPatternOverlayToggle
            autoScroll={autoScrollCode}
            onAutoScrollChange={
              setAutoScrollCode
            }
            showAutoScroll
          />

          {vizFeatures.length > 0 && (
            <VisualizationControls
              features={vizFeatures}
              onToggle={toggleVizFeature}
            />
          )}
        </FloatingPanel>,
        document.body
      )}
    </div>
  )
}