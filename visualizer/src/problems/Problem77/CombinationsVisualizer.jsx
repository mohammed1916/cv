import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import CodePatternAnnotations from "../../components/CodePatternAnnotations"
import PatternLegend from "../../components/PatternLegend"
import './CombinationsVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SOLUTION_CODE = [
    { line: 1, text: 'def combine(n, k):' },
    { line: 2, text: '    res = []' },
    { line: 3, text: '    def backtrack(start, path):' },
    { line: 4, text: '        if len(path) == k:' },
    { line: 5, text: '            res.append(path[:])' },
    { line: 6, text: '            return' },
    { line: 7, text: '        for i in range(start, n + 1):' },
    { line: 8, text: '            path.append(i)' },
    { line: 9, text: '            backtrack(i + 1, path)' },
    { line: 10, text: '            path.pop()' },
    { line: 11, text: '    backtrack(1, [])' },
    { line: 12, text: '    return res' },
]

const COMBINATIONS_PATTERNS = ['choose', 'done', 'init', 'record', 'recurse', 'unchoose']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  5: 'record',
  8: 'choose',
  9: 'recurse',
  10: 'unchoose',
  11: 'init',
  12: 'done',
}

function generateSteps(n, k) {
    const steps = []
    const res = []

    function backtrack(start, path) {
        if (path.length === k) {
            res.push([...path])
            steps.push({
                phase: 'record', activeLine: 5,
                start, path: [...path], res: res.map(r => [...r]),
                message: `Complete combination: [${path.join(', ')}]`,
            })
            return
        }

        for (let i = start; i <= n; i++) {
            path.push(i)
            steps.push({
                phase: 'choose', activeLine: 8,
                start: i, path: [...path], res: res.map(r => [...r]),
                message: `Choose ${i}, path=[${path.join(', ')}]`,
            })

            steps.push({
                phase: 'recurse', activeLine: 9,
                start: i + 1, path: [...path], res: res.map(r => [...r]),
                message: `Recurse with start=${i + 1}`,
            })

            backtrack(i + 1, path)

            path.pop()
            steps.push({
                phase: 'unchoose', activeLine: 10,
                start: i, path: [...path], res: res.map(r => [...r]),
                message: `Unchoose ${i}, path=[${path.join(', ')}]`,
            })
        }
    }

    steps.push({
        phase: 'init', activeLine: 11,
        start: 1, path: [], res: [],
        message: `Start combining: n=${n}, k=${k}`,
    })
    backtrack(1, [])
    steps.push({
        phase: 'done', activeLine: 12,
        start: n + 1, path: [], res,
        message: `Done. ${res.length} combinations found.`,
    })
    return steps
}

const EXAMPLES = getExamples('combinations')

function VisualizationPanel({ EXAMPLES, applyExample, nInput, setNInput, kInput, setKInput, n, k, inputError, handleReset, step }) {
    return (
        <div className="comb-viz-panel">
            <div className="comb-top">
                <section className="comb-panel main">
                    <header className="comb-head">
                        <span>Backtracking Combinations</span>
                        {inputError && <span className="comb-error">{inputError}</span>}
                    </header>
                    <div className="comb-body">
                        <div className="comb-examples">
                            {EXAMPLES.map((ex) => (
                                <button key={ex.label} className="comb-chip" onClick={() => applyExample(ex)}>{ex.label}</button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>n</label>
                                <input
                                    className="comb-input"
                                    value={nInput}
                                    onChange={(e) => { setNInput(e.target.value);

 handleReset() }}
                                    placeholder="4"
                                    type="number"
                                    min="1"
                                    max="20"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>k</label>
                                <input
                                    className="comb-input"
                                    value={kInput}
                                    onChange={(e) => { setKInput(e.target.value); handleReset() }}
                                    placeholder="2"
                                    type="number"
                                    min="1"
                                    max="20"
                                />
                            </div>
                        </div>

                        <div className="comb-section-label">Available numbers</div>
                        <div className="comb-nums-row">
                            {Array.from({ length: n }, (_, i) => i + 1).map((num) => (
                                <div key={num} className={`comb-num-cell ${(step?.path ?? []).includes(num) ? 'selected' : step?.start && num < step.start ? 'used' : ''}`}>
                                    {num}
                                </div>
                            ))}
                        </div>

                        <div className="comb-section-label">Current path</div>
                        <div className="comb-path-row">
                            <span className="comb-bracket">[</span>
                            <AnimatePresence mode="popLayout">
                                {(step?.path ?? []).map((v, i) => (
                                    <motion.div key={`${i}-${v}`} className="comb-path-cell"
                                        initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 22 }}>
                                        {v}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <span className="comb-bracket">]</span>
                            <span className="comb-path-progress">({(step?.path ?? []).length}/{k})</span>
                        </div>
                    </div>
                </section>

                <section className="comb-panel side">
                    <header className="comb-head"><span>Results ({step?.res?.length ?? 0})</span></header>
                    <div className="comb-body">
                        <div className="comb-res-list">
                            <AnimatePresence mode="popLayout">
                                {(step?.res ?? []).map((comb, i) => (
                                    <motion.div key={i} className={`comb-res-item ${i === (step?.res?.length ?? 0) - 1 && step?.phase === 'record' ? 'latest' : ''}`}
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}>
                                        [{comb.join(', ')}]
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>
            </div>
            <div className="comb-status">{step?.message || 'Press Play to begin.'}</div>
        </div>
    )
}

export default function CombinationsVisualizer() {
    const [nInput, setNInput] = useState('4')
    const [kInput, setKInput] = useState('2')

    const { n, k, inputError } = useMemo(() => {
        try {
            const numN = parseInt(nInput)
            const numK = parseInt(kInput)
            if (isNaN(numN) || numN < 1 || numN > 20) throw new Error('n must be 1-20')
            if (isNaN(numK) || numK < 1 || numK > numN) throw new Error('k must be 1 to n')
            return { n: numN, k: numK, inputError: '' }
        } catch (e) {
            return { n: 4, k: 2, inputError: e.message }
        }
    }, [nInput, kInput])

    const steps = useMemo(() => generateSteps(n, k), [n, k])
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const applyExample = useCallback((ex) => { setNInput(String(ex.n)); setKInput(String(ex.k)); handleReset() }, [handleReset])

    // Step 2: Extract panels into consts
    const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"n","label":"n","type":"string"},{"key":"k","label":"k","type":"string"}]}
        values={{ n: nInput, k: kInput }}
        onChange={(k, v) => { if (k === 'n') setNInput(v); if (k === 'k') setKInput(v); handleReset(); }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
        showExamples={false}
      />

        <div className="comb-panel-wrapper">
            <VisualizationPanel EXAMPLES={EXAMPLES} applyExample={applyExample} nInput={nInput} setNInput={setNInput} kInput={kInput} setKInput={setKInput} n={n} k={k} inputError={inputError} handleReset={handleReset} step={step} />
        </div>
    
    </>)

    const codePanel = (
        <div style={{ position: 'relative', height: '100%' }}>
            <CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} autoScroll={autoScrollCode} disableResizer />
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

    const statusPanel = (
        <div className="comb-status">
            {step?.message || 'Press Play to begin.'}
        </div>
    )

    const playbackPanel = (
      <>
            {showPatternOverlay && (
                <PatternLegend currentPhase={step?.phase} usedPatterns={COMBINATIONS_PATTERNS} />
            )}
            <PlaybackControls
                isPlaying={isPlaying} isDone={isDone} speed={speed}
                onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset}
                prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0}
                onSpeedChange={(e) => setSpeed(Number(e.target.value))}
                autoScroll={autoScrollCode}
                onAutoScrollChange={setAutoScrollCode}
                showAutoScroll
                showPatternOverlay={showPatternOverlay}
                onShowPatternOverlayChange={setShowPatternOverlay}
                patternOverlayLabel="Show pattern overlay"
                showPatternOverlayToggle
            />
        </>
    )

    // Step 3: Add state + config
    const [panelDivs, setPanelDivs] = useState(null)
    const panelConfigs = useMemo(
        () => [
            { id: 'primary', title: 'Visualization', dockMode: 'split-right' },
            { id: 'code', title: 'Code', dockMode: 'split-bottom' },
            { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
        ],
        []
    )
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    // Step 4: Replace return with portals
    return (
        <div className="comb-shell">
            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && (
              <>
                    {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
                    {panelDivs.code && createPortal(codePanel, panelDivs.code)}
                    {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
                </>
            )}
            {createPortal(
                <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
                document.body
            )}
        </div>
    )
}

