import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import CodePatternAnnotations from "../../components/CodePatternAnnotations"
import PatternLegend from "../../components/PatternLegend"
import './GrayCodeVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SOLUTION_CODE_INLINE = [
    { line: 1, text: 'def grayCode(n):' },
    { line: 2, text: '    result = []' },
    { line: 3, text: '    for i in range(1 << n):' },
    { line: 4, text: '        result.append(i ^ (i >> 1))' },
    { line: 5, text: '    return result' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

const GRAYCODE_PATTERNS = ['add', 'compute', 'done', 'init']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  2: 'init',
  4: 'compute',
  5: 'done',
}

function toBinary(num, bits) {
    return (num >>> 0).toString(2).padStart(bits, '0')
}

function generateSteps(n) {
    const steps = []
    const max = 1 << n
    const result = []

    steps.push({
        phase: 'init',
        activeLine: 2,
        i: -1,
        result: [],
        grayValue: null,
        message: `Initialize: generating ${max} Gray codes for n=${n}`,
    })

    for (let i = 0; i < max; i++) {
        const shifted = i >> 1
        const grayValue = i ^ shifted

        steps.push({
            phase: 'compute',
            activeLine: 4,
            i,
            shifted,
            grayValue,
            result: [...result],
            binary: toBinary(i, n),
            shiftedBinary: toBinary(shifted, n),
            grayBinary: toBinary(grayValue, n),
            message: `i=${i} (${toBinary(i, n)}_2), i>>1=${shifted} (${toBinary(shifted, n)}_2), gray=${grayValue} (${toBinary(grayValue, n)}_2)`,
        })

        result.push(grayValue)

        steps.push({
            phase: 'add',
            activeLine: 4,
            i,
            grayValue,
            result: [...result],
            message: `Add ${grayValue} to result`,
        })
    }

    steps.push({
        phase: 'done',
        activeLine: 5,
        i: -1,
        result,
        grayValue: null,
        message: `Done. Generated ${result.length} Gray codes: [${result.join(', ')}]`,
    })

    return steps
}

const EXAMPLES = getExamples('gray-code')

export default function GrayCodeVisualizer() {
    const [nInput, setNInput] = useState('3')
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const { n, inputError } = useMemo(() => {
        const v = parseInt(nInput, 10)
        if (Number.isNaN(v) || v < 0 || v > 8) return { n: 3, inputError: 'n must be 0-8' }
        return { n: v, inputError: '' }
    }, [nInput])

    const steps = useMemo(() => generateSteps(n), [n])
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null
    const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

    const applyExample = useCallback((ex) => {
        setNInput(String(ex.n))
        handleReset()
    }, [handleReset])

    const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"n","label":"n","type":"string"}]}
        values={{ n: nInput }}
        onChange={(k, v) => { if (k === 'n') setNInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

        <div className="gc-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {EXAMPLES && EXAMPLES.length > 0 && EXAMPLES.map(ex => <button key={ex.label} onClick={() => applyExample(ex)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}>
                    {ex.label}
                </button>)}
                <label style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>n = <input type="number" min="0" max="8" value={nInput} onChange={e => { setNInput(e.target.value); handleReset() }} style={{ width: 50, padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1' }} /></label>
            </div>
            {inputError && <div style={{ color: '#991b1b', fontSize: 11 }}>{inputError}</div>}

            {step?.phase === 'compute' && (
                <div
                    style={{
                        padding: 12,
                        backgroundColor: '#f8fafc',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        fontSize: 11,
                        fontFamily: 'monospace',
                    }}
                >
                    <div style={{ marginBottom: 8 }}>
                        <b>i</b> = {step.i} ({step.binary}_2)
                    </div>

                    <div style={{ marginBottom: 8 }}>
                        <b>{step.i} {'>>'} 1</b> = {step.shifted} ({step.shiftedBinary}_2)
                    </div>

                    <div>
                        <b>{step.binary}</b> XOR <b>{step.shiftedBinary}</b>
                        {' = '}
                        <span style={{ color: '#0c4a6e' }}>
                            {step.grayBinary}_2 ({step.grayValue})
                        </span>
                    </div>
                </div>
            )}

            <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Result Sequence</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1, overflow: 'auto', alignItems: 'flex-start' }}>
                <AnimatePresence mode="popLayout">
                    {(step?.result ?? []).map((val, idx) => {
                        const isActive = step?.phase === 'add' && idx === (step?.result?.length - 1)
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: isActive ? 1.1 : 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                style={{
                                    minWidth: 56,
                                    padding: '8px 6px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isActive ? '#fbbf24' : '#f0fdf4',
                                    border: isActive ? '2px solid #f59e0b' : '1px solid #86efac',
                                    borderRadius: 4,
                                    fontSize: 11,
                                    fontWeight: 'bold',
                                    color: '#15803d',
                                }}
                            >
                                <span>{val}</span>
                                <span style={{ fontSize: 9, color: '#65a30d' }}>{toBinary(val, n)}</span>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {step?.phase === 'done' && (
                <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #86efac', fontSize: 11, fontWeight: 'bold', color: '#15803d' }}>
                    Generated {step.result.length} Gray codes
                </div>
            )}
        </div>
    
    </>)

    const codePanel = (
        <div style={{ position: 'relative', height: '100%' }}>
            <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} disableResizer />

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
        <div className="gc-status" style={{ padding: 8, fontSize: 12, color: '#1e293b', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {step?.message || 'Ready'}
        </div>
    )

    const playbackPanel = (
      <>
            {showPatternOverlay && (
                <PatternLegend currentPhase={step?.phase} usedPatterns={GRAYCODE_PATTERNS} />
            )}
            <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
        </>
    )

    const [panelDivs, setPanelDivs] = useState(null)
    const panelConfigs = useMemo(
        () => [
            { id: 'primary', title: 'Gray Code', dockMode: 'split-right' },
            { id: 'code', title: 'Code', dockMode: 'split-bottom' },
            { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
        ],
        []
    )
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    return (
        <div className="gc-shell">
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
