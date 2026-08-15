import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import './Problem367Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'

const PATTERNS = ['compute-mid', 'compute-square', 'done', 'edge-case', 'found', 'init', 'search-left', 'search-right', 'setup']
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'edge-case',
  4: 'setup',
  5: 'compute-mid',
  7: 'compute-square',
  9: 'found',
  11: 'search-right',
  13: 'search-left',
  14: 'done'
}


const SOLUTION_CODE_INLINE = [
    { line: 1, text: 'def isPerfectSquare(num):' },
    { line: 2, text: '    if num == 1:' },
    { line: 3, text: '        return True' },
    { line: 4, text: '    left, right = 1, num' },
    { line: 5, text: '    while left <= right:' },
    { line: 6, text: '        mid = (left + right) // 2' },
    { line: 7, text: '        square = mid * mid' },
    { line: 8, text: '        if square == num:' },
    { line: 9, text: '            return True' },
    { line: 10, text: '        elif square < num:' },
    { line: 11, text: '            left = mid + 1' },
    { line: 12, text: '        else:' },
    { line: 13, text: '            right = mid - 1' },
    { line: 14, text: '    return False' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(num) {
    const steps = []
    num = Math.max(1, Math.floor(num))

    // Step 1: Initialize
    steps.push({
        phase: 'init',
        activeLine: 1,
        num,
        left: null,
        right: null,
        mid: null,
        square: null,
        message: `Initialize: Check if ${num} is a perfect square.`,
        searchSpace: { left: null, right: null },
        foundAtStep: -1,
        isFound: false,
    })

    // Step 2: Edge case check
    if (num === 1) {
        steps.push({
            phase: 'edge-case',
            activeLine: 2,
            num,
            left: null,
            right: null,
            mid: null,
            square: null,
            message: `num === 1 is edge case. Return True immediately.`,
            searchSpace: { left: null, right: null },
            foundAtStep: steps.length,
            isFound: true,
        })
        return steps
    }

    // Step 3: Initialize left and right
    steps.push({
        phase: 'setup',
        activeLine: 4,
        num,
        left: 1,
        right: num,
        mid: null,
        square: null,
        message: `Initialize binary search. left = 1, right = ${num}`,
        searchSpace: { left: 1, right: num },
        foundAtStep: -1,
        isFound: false,
    })

    let left = 1
    let right = num
    let stepCount = 0

    // Step 4+: Binary search loop
    while (left <= right) {
        const mid = Math.floor((left + right) / 2)
        const square = mid * mid

        steps.push({
            phase: 'compute-mid',
            activeLine: 5,
            num,
            left,
            right,
            mid,
            square: null,
            message: `Loop iteration: left=${left}, right=${right}. Compute mid.`,
            searchSpace: { left, right },
            foundAtStep: -1,
            isFound: false,
        })

        steps.push({
            phase: 'compute-square',
            activeLine: 7,
            num,
            left,
            right,
            mid,
            square,
            message: `Compute mid² = ${mid} × ${mid} = ${square}`,
            searchSpace: { left, right },
            foundAtStep: -1,
            isFound: false,
        })

        if (square === num) {
            steps.push({
                phase: 'found',
                activeLine: 9,
                num,
                left,
                right,
                mid,
                square,
                message: `✓ Found! ${mid}² = ${num}. Return True.`,
                searchSpace: { left, right },
                foundAtStep: steps.length,
                isFound: true,
            })
            return steps
        } else if (square < num) {
            steps.push({
                phase: 'search-right',
                activeLine: 11,
                num,
                left: left,
                right: right,
                mid,
                square,
                message: `${square} < ${num}. Narrow search to right. left = ${mid + 1}`,
                searchSpace: { left: mid + 1, right },
                foundAtStep: -1,
                isFound: false,
            })
            left = mid + 1
        } else {
            steps.push({
                phase: 'search-left',
                activeLine: 13,
                num,
                left: left,
                right: right,
                mid,
                square,
                message: `${square} > ${num}. Narrow search to left. right = ${mid - 1}`,
                searchSpace: { left, right: mid - 1 },
                foundAtStep: -1,
                isFound: false,
            })
            right = mid - 1
        }

        stepCount++
    }

    // Step final: Not found
    steps.push({
        phase: 'done',
        activeLine: 14,
        num,
        left,
        right,
        mid: null,
        square: null,
        message: `✗ Not found. ${num} is not a perfect square. Return False.`,
        searchSpace: { left, right },
        foundAtStep: -1,
        isFound: false,
    })

    return steps
}

const EXAMPLES = [
    { label: 'Perfect Square (16)', value: 16 },
    { label: 'Not Square (17)', value: 17 },
    { label: 'Edge Case (1)', value: 1 },
    { label: 'Large Perfect (10000)', value: 10000 },
    { label: 'Not Perfect (99)', value: 99 },
]

function SearchVisualizationPanel({ step, numInput, setNumInput, applyExample, handleReset }) {
    const numVal = Math.max(1, Math.floor(Number(numInput) || 1))

    return (
        <div className="p367-viz-panel">
            <div className="p367-examples">
                {EXAMPLES.map((ex) => (
                    <button
                        key={ex.label}
                        className="p367-chip"
                        onClick={() => {
                            setNumInput(String(ex.value))
                            handleReset()
                        }}
                    >
                        {ex.label}
                    </button>
                ))}
            </div>

            <div className="p367-input-row">
                <label>Find perfect square:</label>
                <input
                    className="p367-input"
                    type="number"
                    value={numInput}
                    onChange={(e) => {
                        setNumInput(e.target.value)
                        handleReset()
                    }}
                    placeholder="Enter number (1-10000)"
                    min="1"
                    max="10000"
                />
            </div>

            {/* Number Line Visualization */}
            <div className="p367-canvas">
                <div className="p367-number-line-label">Search Range:</div>
                <div className="p367-number-line">
                    {/* Gradient background for search space */}
                    {step?.searchSpace && (
                        <div
                            className="p367-search-space"
                            style={{
                                left: `${((step.searchSpace.left || 1) / numVal) * 100}%`,
                                right: `${(1 - (step.searchSpace.right || numVal) / numVal) * 100}%`,
                            }}
                        />
                    )}

                    {/* Main number line */}
                    <svg width="100%" height="50" style={{ position: 'absolute', top: 0, left: 0 }}>
                        {/* Line track */}
                        <line
                            x1="20"
                            y1="25"
                            x2="100%"
                            y2="25"
                            stroke="#313244"
                            strokeWidth="3"
                        />

                        {/* Left marker */}
                        {step?.left !== null && (
                            <motion.g
                                key="left-marker"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <circle
                                    cx={`${20 + ((step.left) / numVal) * (window.innerWidth - 40 - 40)}px`}
                                    cy="25"
                                    r="8"
                                    fill="#a6e3a1"
                                    stroke="#a6e3a1"
                                    strokeWidth="2"
                                />
                                <text
                                    x={`${20 + ((step.left) / numVal) * (window.innerWidth - 40 - 40) - 20}px`}
                                    y="45"
                                    fontSize="11"
                                    fill="#a6e3a1"
                                    fontWeight="600"
                                >
                                    L:{step.left}
                                </text>
                            </motion.g>
                        )}

                        {/* Mid marker */}
                        {step?.mid !== null && (
                            <motion.g
                                key="mid-marker"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <circle
                                    cx={`${20 + ((step.mid) / numVal) * (window.innerWidth - 40 - 40)}px`}
                                    cy="25"
                                    r="10"
                                    fill="none"
                                    stroke="#f9e2af"
                                    strokeWidth="3"
                                />
                                <text
                                    x={`${20 + ((step.mid) / numVal) * (window.innerWidth - 40 - 40) - 15}px`}
                                    y="45"
                                    fontSize="12"
                                    fill="#f9e2af"
                                    fontWeight="700"
                                >
                                    M:{step.mid}
                                </text>
                            </motion.g>
                        )}

                        {/* Right marker */}
                        {step?.right !== null && (
                            <motion.g
                                key="right-marker"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <circle
                                    cx={`${20 + ((step.right) / numVal) * (window.innerWidth - 40 - 40)}px`}
                                    cy="25"
                                    r="8"
                                    fill="#89b4fa"
                                    stroke="#89b4fa"
                                    strokeWidth="2"
                                />
                                <text
                                    x={`${20 + ((step.right) / numVal) * (window.innerWidth - 40 - 40) - 15}px`}
                                    y="45"
                                    fontSize="11"
                                    fill="#89b4fa"
                                    fontWeight="600"
                                >
                                    R:{step.right}
                                </text>
                            </motion.g>
                        )}
                    </svg>
                </div>

                <div className="p367-range-info">
                    {step?.left !== null && step?.right !== null && (
                        <motion.div
                            className="p367-info-item"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span className="p367-range-label">Range:</span>
                            <span className="p367-range-value">[{step.left}, {step.right}]</span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Comparison Display */}
            {step?.mid !== null && (
                <motion.div
                    className="p367-comparison"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="p367-comp-title">Comparison:</div>
                    <div className="p367-comp-row">
                        <div className="p367-comp-item">
                            <span className="p367-comp-label">mid² = {step.mid}²</span>
                            <span className="p367-comp-val p367-val-square">{step.square}</span>
                        </div>
                        <div className="p367-comp-symbol">vs</div>
                        <div className="p367-comp-item">
                            <span className="p367-comp-label">target</span>
                            <span className="p367-comp-val p367-val-target">{step.num}</span>
                        </div>
                    </div>
                    <div className="p367-comp-result">
                        {step.square === step.num && <span className="p367-result-equal">EQUAL ✓</span>}
                        {step.square < step.num && <span className="p367-result-less">mid² &lt; target</span>}
                        {step.square > step.num && <span className="p367-result-greater">mid² &gt; target</span>}
                    </div>
                </motion.div>
            )}
        </div>
    )
}

function ResultPanel({ step }) {
    return (
        <div className="p367-result-panel">
            <div className="p367-result-state">
                {step?.phase === 'found' && (
                    <motion.div
                        className="p367-found-box"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, type: 'spring' }}
                    >
                        <div className="p367-found-icon">✓</div>
                        <div className="p367-found-text">Perfect Square!</div>
                        <div className="p367-found-detail">
                            {step.mid}² = {step.num}
                        </div>
                    </motion.div>
                )}
                {step?.phase === 'done' && !step?.isFound && (
                    <motion.div
                        className="p367-not-found-box"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="p367-not-found-icon">✗</div>
                        <div className="p367-not-found-text">Not a Perfect Square</div>
                        <div className="p367-not-found-detail">
                            No integer root found for {step.num}
                        </div>
                    </motion.div>
                )}
                {step?.phase !== 'found' && step?.phase !== 'done' && (
                    <div className="p367-searching-box">
                        <div className="p367-searching-text">Searching...</div>
                        <div className="p367-searching-detail">
                            {step?.left !== null && step?.right !== null
                                ? `Range: [${step.left}, ${step.right}]`
                                : 'Initializing...'}
                        </div>
                    </div>
                )}
            </div>

            <div className="p367-separator"></div>

            <div className="p367-search-summary">
                <div className="p367-summary-title">Search Summary:</div>
                <div className="p367-summary-content">
                    {step?.left !== null && step?.right !== null && (
                        <>
                            <div className="p367-summary-row">
                                <span className="p367-summary-key">Current Range:</span>
                                <span className="p367-summary-val">[{step.left}, {step.right}]</span>
                            </div>
                            <div className="p367-summary-row">
                                <span className="p367-summary-key">Midpoint:</span>
                                <span className="p367-summary-val">{step.mid !== null ? step.mid : '—'}</span>
                            </div>
                            <div className="p367-summary-row">
                                <span className="p367-summary-key">mid²:</span>
                                <span className="p367-summary-val">{step.square !== null ? step.square : '—'}</span>
                            </div>
                            <div className="p367-summary-row">
                                <span className="p367-summary-key">Target:</span>
                                <span className="p367-summary-val">{step.num}</span>
                            </div>
                        </>
                    )}
                    {step?.left === null && (
                        <div className="p367-empty">Waiting to start...</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function Problem367Visualizer() {
    const [numInput, setNumInput] = useState('16')
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const num = useMemo(() => Math.max(1, Math.floor(Number(numInput) || 1)), [numInput])
    const steps = useMemo(() => generateSteps(num), [num])
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null

    const panelConfigs = useMemo(() => [
      { id: 'viz', title: 'Search Visualization' },
      { id: 'result', title: 'Result Panel', dockMode: 'split-right' },
      { id: 'code', title: 'Code Trace', dockMode: 'split-bottom' },
    ], [])
    const panelContents = useMemo(() => ({
      viz: (<SearchVisualizationPanel
                    step={step}
                    numInput={numInput}
                    setNumInput={setNumInput}
                    applyExample={(ex) => {
                        setNumInput(String(ex.value))
                        handleReset()
                    }}
                    handleReset={handleReset}
                />),
      result: (<ResultPanel step={step} />),
      code: (<div style={{ position: 'relative' }}>
                    <CodeTracePanel
                        step={step}
                        codeLines={SOLUTION_CODE}
                        onActiveLineDomChange={setActiveLineDom}
                        autoScroll={autoScrollCode}
                    />
                    {step && (
                        <CodePatternAnnotations
                            linePatterns={LINE_PATTERN_MAP}
                            currentPhase={step.phase}
                            activeLineDom={activeLineDom}
                            activeLine={step.activeLine}
                        />
                    )}
                </div>),
    }), [numInput, setNumInput, step, handleReset, setActiveLineDom, autoScrollCode])
    const [panelDivs, setPanelDivs] = useState(null)
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    return (
        <div className="p367-shell">
              <ManualInputPanel
                fields={[{"key":"num","label":"num","type":"string"}]}
                values={{ num: numInput }}
                onChange={(k, v) => { if (k === 'num') setNumInput(v); handleReset() }}
                showExamples={false}
              />
            <div className="p367-header">
                <h2>Valid Perfect Square</h2>
                <p className={`p367-message ${step?.isFound ? 'found' : step?.phase === 'done' ? 'not-found' : ''}`}>
                    {step?.message || 'Press Play to begin the binary search.'}
                </p>
            </div>

            <>
              <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
              {panelDivs && (
                <>
                  {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
                  {panelDivs.result && createPortal(panelContents.result, panelDivs.result)}
                  {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
                </>
              )}
            </>

            <FloatingPanel title="Playback Controls">
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
            </FloatingPanel>

            {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
        </div>
    )
}
