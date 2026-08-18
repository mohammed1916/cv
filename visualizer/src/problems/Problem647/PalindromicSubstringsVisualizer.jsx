import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './PalindromicSubstringsVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'

const SOLUTION_CODE = [
    { line: 1, text: 'def countSubstrings(s):' },
    { line: 2, text: '    count = 0' },
    { line: 3, text: '    for center in range(len(s)):' },
    { line: 4, text: '        # odd length' },
    { line: 5, text: '        l, r = center, center' },
    { line: 6, text: '        while l >= 0 and r < len(s) and s[l] == s[r]:' },
    { line: 7, text: '            count += 1; l -= 1; r += 1' },
    { line: 8, text: '        # even length' },
    { line: 9, text: '        l, r = center, center + 1' },
    { line: 10, text: '        while l >= 0 and r < len(s) and s[l] == s[r]:' },
    { line: 11, text: '            count += 1; l -= 1; r += 1' },
    { line: 12, text: '    return count' },
]

function generateSteps(s) {
    const n = s.length
    const steps = []
    let count = 0
    const found = [] // list of [l,r] palindrome ranges found so far

    steps.push({
        phase: 'init', activeLine: 2, center: -1, l: -1, r: -1,
        count, found: [], activeL: -1, activeR: -1, isEven: false,
        message: 'Start expand-around-center',
    })

    for (let center = 0; center < n; center++) {
        // Odd
        let l = center, r = center
        steps.push({
            phase: 'center-odd', activeLine: 5, center, l, r,
            count, found: [...found], activeL: l, activeR: r, isEven: false,
            message: `Center ${center} ('${s[center]}'): odd expansion`,
        })

        while (l >= 0 && r < n && s[l] === s[r]) {
            count++
            found.push([l, r])
            steps.push({
                phase: 'expand-odd', activeLine: 7, center, l, r,
                count, found: [...found], activeL: l, activeR: r, isEven: false,
                message: `Odd palindrome "${s.slice(l, r + 1)}" (${l},${r}) → count=${count}`,
            })
            l--
            r++
        }

        // Even
        l = center
        r = center + 1
        steps.push({
            phase: 'center-even', activeLine: 9, center, l, r,
            count, found: [...found], activeL: l, activeR: r, isEven: true,
            message: `Center ${center}/${center + 1}: even expansion`,
        })

        while (l >= 0 && r < n && s[l] === s[r]) {
            count++
            found.push([l, r])
            steps.push({
                phase: 'expand-even', activeLine: 11, center, l, r,
                count, found: [...found], activeL: l, activeR: r, isEven: true,
                message: `Even palindrome "${s.slice(l, r + 1)}" (${l},${r}) → count=${count}`,
            })
            l--
            r++
        }
    }

    steps.push({
        phase: 'done', activeLine: 12, center: -1, l: -1, r: -1,
        count, found: [...found], activeL: -1, activeR: -1, isEven: false,
        message: `Total palindromic substrings = ${count}`,
    })

    return steps
}

const EXAMPLES = getExamples('palindromic-substrings')

function VisualizationPanel({ s, step, getCharClass, found, applyExample }) {
    const cellSize = 48
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', overflow: 'auto', padding: 16 }}>
            <section className="ps-panel main">
                <header className="ps-head"><span>Expand around center</span></header>
                <div className="ps-body">
                    <div className="ps-examples">{EXAMPLES.map((example) => <button key={example.label} className="ps-chip" onClick={() => applyExample(example)}>{example.label}</button>)}</div>
                    <div className="ps-chars">{s.split('').map((character, index) => <motion.div key={index} className={`ps-char ${getCharClass(index)}`} animate={{ scale: step?.activeL <= index && index <= step?.activeR && step?.activeL !== -1 ? 1.1 : 1 }} transition={{ type: 'spring', stiffness: 350, damping: 22 }}><span className="ps-char-val">{character}</span><span className="ps-char-idx">{index}</span></motion.div>)}</div>
                    <div className="ps-pointers" style={{ width: s.length * (cellSize + 6) }}>{s.split('').map((_, index) => <div key={index} className="ps-ptr-slot">{step?.activeL === index && <span className="ps-ptr l-ptr">L</span>}{step?.activeR === index && <span className="ps-ptr r-ptr">R</span>}{step?.center === index && step?.activeL !== index && step?.activeR !== index && <span className="ps-ptr c-ptr">C</span>}</div>)}</div>
                    <div className="ps-sub-head">Found palindromes ({found.length})</div>
                    <div className="ps-found-list">{found.slice(-8).map(([left, right], index) => <span key={`${left}-${right}-${index}`} className="ps-found-chip">{s.slice(left, right + 1)}</span>)}{found.length > 8 && <span className="ps-found-chip more">+{found.length - 8}</span>}</div>
                </div>
            </section>
            <section className="ps-panel side">
                <header className="ps-head"><span>State</span></header>
                <div className="ps-body">
                    <div className="ps-metric"><span className="ps-label">center</span><strong className="ps-val">{step?.center >= 0 ? `${step.center}${step.isEven ? '/' + (step.center + 1) : ''}` : '-'}</strong></div>
                    <div className="ps-metric"><span className="ps-label">L</span><strong className="ps-val l-color">{step?.activeL >= 0 ? step.activeL : '-'}</strong></div>
                    <div className="ps-metric"><span className="ps-label">R</span><strong className="ps-val r-color">{step?.activeR >= 0 ? step.activeR : '-'}</strong></div>
                    <div className="ps-metric"><span className="ps-label">count</span><strong className="ps-val accent">{step?.count ?? 0}</strong></div>
                    <div className={`ps-result ${step?.phase === 'done' ? 'done' : ''}`}>{step?.phase === 'done' ? `Count = ${step.count}` : 'Expanding...'}</div>
                </div>
            </section>
            <div className="ps-status">{step?.message || 'Press Play to begin.'}</div>
        </div>
    )
}

export default function PalindromicSubstringsVisualizer() {
    const [sInput, setSInput] = useState('abc')

    const s = sInput.slice(0, 12)

    const steps = useMemo(() => generateSteps(s), [s])
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const applyExample = useCallback((ex) => {
        setSInput(ex.s)
        handleReset()
    }, [handleReset])

    // Color each character based on role
    const getCharClass = (i) => {
        if (!step) return ''
        const { activeL, activeR, center } = step
        if (activeL !== -1 && i >= activeL && i <= activeR) return 'active-range'
        if (i === center) return 'center'
        return ''
    }

    // All found palindrome ranges for overlay
    const found = step?.found ?? []

    const panelConfigs = useMemo(() => [
        { id: 'input', title: 'Input' },
        { id: 'viz', title: 'Palindromic Substrings', dockMode: 'split-bottom' },
        { id: 'code', title: 'Code', dockMode: 'split-right' },
    ], [])
    const [panelDivs, setPanelDivs] = useState(null)
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    return (
        <div className="ps-shell">
            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && <>
                {panelDivs.input && createPortal(<ManualInputPanel fields={[{ key: 's', label: 'String', type: 'string' }]} values={{ s: sInput }} onChange={(key, value) => { if (key === 's') setSInput(value); handleReset() }} examples={EXAMPLES} applyExample={applyExample} />, panelDivs.input)}
                {panelDivs.viz && createPortal(<VisualizationPanel s={s} step={step} getCharClass={getCharClass} found={found} applyExample={applyExample} />, panelDivs.viz)}
                {panelDivs.code && createPortal(<CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} />, panelDivs.code)}
            </>}
            <FloatingPanel title="Playback Controls">
                <PlaybackControls
                    isPlaying={isPlaying} isDone={isDone} speed={speed}
                    onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset}
                    prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0}
                    onSpeedChange={(e) => setSpeed(Number(e.target.value))}
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
