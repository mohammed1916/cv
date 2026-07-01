import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import CodePatternAnnotations from "../../components/CodePatternAnnotations"
import PatternLegend from "../../components/PatternLegend"
import './PermutationSequenceVisualizer.css'

const SOLUTION_CODE = [
    { line: 1, text: 'def getPermutation(n, k):' },
    { line: 2, text: '    factorial = [1]' },
    { line: 3, text: '    for i in range(1, n):' },
    { line: 4, text: '        factorial.append(factorial[-1] * i)' },
    { line: 5, text: '    k -= 1' },
    { line: 6, text: '    nums = list(range(1, n+1))' },
    { line: 7, text: '    result = []' },
    { line: 8, text: '    for i in range(n):' },
    { line: 9, text: '        index = k // factorial[n-1-i]' },
    { line: 10, text: '        result.append(nums[index])' },
    { line: 11, text: '        nums.pop(index)' },
    { line: 12, text: '        k %= factorial[n-1-i]' },
    { line: 13, text: '    return "".join(map(str, result))' },
]

const PERMUTATIONSEQUENCE_PATTERNS = ['adjust-k', 'calc-index', 'done', 'init-factorial', 'init-nums', 'init-result', 'remove-num', 'select-num', 'update-k']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  2: 'init-factorial',
  5: 'adjust-k',
  6: 'init-nums',
  7: 'init-result',
  9: 'calc-index',
  10: 'select-num',
  11: 'remove-num',
  12: 'update-k',
  13: 'done',
}

function generateSteps(n, k) {
    const steps = []

    // Initialize factorial array
    const factorial = [1]
    for (let i = 1; i < n; i++) {
        factorial.push(factorial[factorial.length - 1] * i)
    }
    steps.push({
        phase: 'init-factorial',
        activeLine: 2,
        factorial,
        k,
        nums: Array.from({ length: n }, (_, i) => i + 1),
        result: [],
        index: -1,
        message: `Initialize factorials: [${factorial.join(', ')}]`,
    })

    // Convert k to 0-based index
    let kAdjusted = k - 1
    steps.push({
        phase: 'adjust-k',
        activeLine: 5,
        factorial,
        k: kAdjusted,
        nums: Array.from({ length: n }, (_, i) => i + 1),
        result: [],
        index: -1,
        message: `Convert k to 0-based: k = ${k} - 1 = ${kAdjusted}`,
    })

    // Build numbers array
    const nums = Array.from({ length: n }, (_, i) => i + 1)
    steps.push({
        phase: 'init-nums',
        activeLine: 6,
        factorial,
        k: kAdjusted,
        nums: [...nums],
        result: [],
        index: -1,
        message: `Initialize numbers: [${nums.join(', ')}]`,
    })

    // Initialize result
    steps.push({
        phase: 'init-result',
        activeLine: 7,
        factorial,
        k: kAdjusted,
        nums: [...nums],
        result: [],
        index: -1,
        message: `Initialize result array`,
    })

    // Main loop
    const result = []
    let currentK = kAdjusted
    const currentNums = [...nums]

    for (let i = 0; i < n; i++) {
        const factorialIdx = n - 1 - i
        const index = Math.floor(currentK / factorial[factorialIdx])

        steps.push({
            phase: 'calc-index',
            activeLine: 9,
            factorial,
            k: currentK,
            nums: [...currentNums],
            result: [...result],
            index,
            factorialIdx,
            message: `Position ${i}: index = k / factorial[${factorialIdx}] = ${currentK} / ${factorial[factorialIdx]} = ${index}`,
        })

        const selectedNum = currentNums[index]
        result.push(selectedNum)

        steps.push({
            phase: 'select-num',
            activeLine: 10,
            factorial,
            k: currentK,
            nums: [...currentNums],
            result: [...result],
            index,
            selectedNum,
            message: `Select nums[${index}] = ${selectedNum}, result = [${result.join(', ')}]`,
        })

        currentNums.splice(index, 1)
        steps.push({
            phase: 'remove-num',
            activeLine: 11,
            factorial,
            k: currentK,
            nums: [...currentNums],
            result: [...result],
            index: -1,
            message: `Remove nums[${index}]: nums = [${currentNums.join(', ')}]`,
        })

        currentK %= factorial[factorialIdx]
        steps.push({
            phase: 'update-k',
            activeLine: 12,
            factorial,
            k: currentK,
            nums: [...currentNums],
            result: [...result],
            index: -1,
            message: `Update k: k %= factorial[${factorialIdx}] = ${currentK}`,
        })
    }

    const finalResult = result.join('')
    steps.push({
        phase: 'done',
        activeLine: 13,
        factorial,
        k: currentK,
        nums: [],
        result,
        finalResult,
        index: -1,
        message: `Result: ${finalResult}`,
    })

    return steps
}

const EXAMPLES = getExamples('permutation-sequence') || [
    { label: 'n=3, k=3', n: 3, k: 3 },
    { label: 'n=4, k=9', n: 4, k: 9 },
    { label: 'n=3, k=1', n: 3, k: 1 },
    { label: 'n=3, k=6', n: 3, k: 6 },
]

function VisualizationPanel({ n, k, step, handleReset, example, applyExample }) {
    const maxPerms = Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a * b, 1)
    const isValidK = k >= 1 && k <= maxPerms

    return (
        <div className="ps-viz-panel">
            <div className="ps-top">
                <section className="ps-panel main">
                    <header className="ps-head">
                        <span>Kth Permutation Finder</span>
                        {!isValidK && <span className="ps-error">k must be 1 to {maxPerms}</span>}
                    </header>
                    <div className="ps-body">
                        <div className="ps-examples">
                            {EXAMPLES.map((ex) => (
                                <button
                                    key={ex.label}
                                    className={`ps-chip ${example?.label === ex.label ? 'active' : ''}`}
                                    onClick={() => applyExample(ex)}
                                >
                                    {ex.label}
                                </button>
                            ))}
                        </div>

                        <div className="ps-inputs">
                            <div className="ps-input-group">
                                <label>n</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="8"
                                    value={n}
                                    onChange={(e) => handleReset()}
                                    disabled
                                />
                            </div>
                            <div className="ps-input-group">
                                <label>k</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={maxPerms}
                                    value={k}
                                    onChange={(e) => handleReset()}
                                    disabled
                                />
                            </div>
                            <div className="ps-info">
                                Total permutations: <strong>{maxPerms}</strong>
                            </div>
                        </div>

                        <div className="ps-section-label">Available Numbers</div>
                        <div className="ps-nums-row">
                            {(step?.nums ?? Array.from({ length: n }, (_, i) => i + 1)).map((v, i) => (
                                <div key={i} className={`ps-num-cell ${step?.index === i ? 'selected' : ''}`}>
                                    {v}
                                </div>
                            ))}
                        </div>

                        <div className="ps-section-label">Result</div>
                        <div className="ps-result-row">
                            {(step?.result ?? []).map((v, i) => (
                                <motion.div
                                    key={i}
                                    className="ps-result-cell"
                                    initial={{ opacity: 0, y: -14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                                >
                                    {v}
                                </motion.div>
                            ))}
                        </div>

                        {step?.finalResult && (
                            <div className="ps-final-result">
                                Final: <span>{step.finalResult}</span>
                            </div>
                        )}
                    </div>
                </section>

                <section className="ps-panel side">
                    <header className="ps-head"><span>Factorials</span></header>
                    <div className="ps-body">
                        <div className="ps-factorial-list">
                            {(step?.factorial ?? []).map((f, i) => (
                                <div key={i} className="ps-factorial-item">
                                    <span className="ps-fact-label">{i}!</span>
                                    <span className="ps-fact-val">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            <div className="ps-section-label">k value</div>
            <div className="ps-k-display">
                <span className="ps-k-val">{step?.k ?? k - 1}</span>
            </div>

            <div className="ps-status">{step?.message || 'Press Play to begin.'}</div>
        </div>
    )
}

export default function PermutationSequenceVisualizer() {
    const [example, setExample] = useState(EXAMPLES[0])
    const { n, k } = example

    const maxPerms = Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a * b, 1)
    const isValidK = k >= 1 && k <= maxPerms

    const steps = useMemo(
        () => (isValidK ? generateSteps(n, k) : []),
        [n, k, isValidK]
    )

    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length)

    const step = stepIndex >= 0 ? steps[stepIndex] : null
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const applyExample = useCallback((ex) => {
        setExample(ex)
        handleReset()
    }, [handleReset])

    const dockPanels = useMemo(
        () => [
            {
                id: 'viz',
                title: 'Visualization',
                content: (
                    <VisualizationPanel
                        n={n}
                        k={k}
                        step={step}
                        handleReset={handleReset}
                        example={example}
                        applyExample={applyExample}
                    />
                ),
            },
            {
                id: 'code',
                title: 'Code',
                content: (
                                        <div style={{ position: "relative" }}>
                      <CodeTracePanel
                        step={step}
                        codeLines={SOLUTION_CODE}
                        onActiveLineDomChange={setActiveLineDom}
                        autoScroll={autoScrollCode}
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
        ],
        [n, k, step, example, handleReset, applyExample, autoScrollCode, setActiveLineDom]
    )

    return (
        <div className="problem-shell">
            <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['viz', 'code']], minimized: [] }} />
            <FloatingPanel title="Playback Controls">
                {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PERMUTATIONSEQUENCE_PATTERNS} />
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
                    autoScroll={autoScrollCode}
                    onAutoScrollChange={setAutoScrollCode}
                    showAutoScroll
                    showPatternOverlay={showPatternOverlay}
                    onShowPatternOverlayChange={setShowPatternOverlay}
                    patternOverlayLabel="Show pattern overlay"
                    showPatternOverlayToggle
                />
            </FloatingPanel>
        </div>
    )
}
