import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem300Visualizer.css'


// ─── Solution code ────────────────────────────────────────────────────────
const SOLUTION_CODE = [
    { line: 1, text: '# Longest Increasing Subsequence Solution' },
    { line: 2, text: '# Find length of longest increasing subsequence.' },
    { line: 3, text: 'def solve(input):' },
    { line: 4, text: '    # Implementation details' },
    { line: 5, text: '    return result' },
]

function generateSteps(input) {
    const steps = []

    steps.push({
        phase: 'init',
        activeLine: 1,
        message: 'Start: Find length of longest increasing subsequence.',
        state: { input, processing: false, output: null },
    })

    steps.push({
        phase: 'process',
        activeLine: 3,
        message: 'Processing input...',
        state: { input, processing: true, output: null },
    })

    steps.push({
        phase: 'work',
        activeLine: 4,
        message: 'Working on solution...',
        state: { input, processing: true, output: null },
    })

    steps.push({
        phase: 'done',
        activeLine: 5,
        message: 'Complete: Result obtained',
        state: { input, processing: false, output: 'Result' },
    })

    return steps
}

export default function Problem300Visualizer() {
    const examples = useMemo(() => getExamples('300') || [], [])
    const [currentStep, setCurrentStep] = useState(0)

    const example = examples[0] || { input: [], output: [] }
    const steps = useMemo(() => generateSteps(example.input), [example])
    const step = steps[currentStep] || steps[0]

    const { isPlaying, setIsPlaying, canNext, canPrev } = usePlaybackState(steps, currentStep, setCurrentStep)
    const { pattern, togglePattern } = usePatternOverlay(false)

    // Step 3: Extract panels into consts
    const primaryPanel = (
        <div className="problem300-visualizer-viz-panel">
            <div className="problem300-visualizer-canvas">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="problem300-visualizer-content"
                >
                    <p>{step.message}</p>
                </motion.div>
            </div>
        </div>
    )

    const codePanel = (
        <div style={{ position: 'relative', height: '100%' }}>
            <CodeTracePanel
                code={SOLUTION_CODE}
                activeLine={step.activeLine}
                onTogglePattern={togglePattern}
                patternActive={pattern}
                disableResizer
            />
        </div>
    )

    const statusPanel = (
        <div className="problem300-visualizer-status">
            <PlaybackControls
                currentStep={currentStep}
                totalSteps={steps.length}
                onNext={() => setCurrentStep(c => c + 1)}
                onPrev={() => setCurrentStep(c => c - 1)}
                onPlayToggle={() => setIsPlaying(!isPlaying)}
                isPlaying={isPlaying}
                canNext={canNext}
                canPrev={canPrev}
            />
        </div>
    )

    // Step 4: Add state + config
    const [panelDivs, setPanelDivs] = useState(null)
    const panelConfigs = useMemo(
        () => [
            { id: 'primary', title: 'Visualization', dockMode: 'split-right' },
            { id: 'code', title: 'Code Trace', dockMode: 'split-bottom' },
            { id: 'status', title: 'Playback', dockMode: 'split-bottom', ratio: 0.08 },
        ],
        []
    )
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    // Step 5: Replace return block
    return (
        <div className="problem300-visualizer-shell">
            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && (
                <>
                    {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
                    {panelDivs.code && createPortal(codePanel, panelDivs.code)}
                    {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
                </>
            )}
        </div>
    )
}

