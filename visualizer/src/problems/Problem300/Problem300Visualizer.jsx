import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem300Visualizer.css'


// ─── Solution code ────────────────────────────────────────────────────────
const SOLUTION_CODE = [
    { line: 1, text: 'def lengthOfLIS(nums):' },
    { line: 2, text: '    tails = []' },
    { line: 3, text: '    for value in nums:' },
    { line: 4, text: '        index = bisect_left(tails, value)' },
    { line: 5, text: '        if index == len(tails): tails.append(value)' },
    { line: 6, text: '        else: tails[index] = value' },
    { line: 7, text: '    return len(tails)' },
]

function generateSteps(input) {
    const nums = Array.isArray(input) ? input.map(Number) : [], tails = []
    const steps = [{ phase: 'init', activeLine: 2, message: 'Maintain the smallest possible tail for every subsequence length.', state: { nums, tails: [], index: null, output: null } }]
    nums.forEach((value, index) => { let low = 0, high = tails.length; while (low < high) { const middle = Math.floor((low + high) / 2); if (tails[middle] < value) low = middle + 1; else high = middle } if (low === tails.length) tails.push(value); else tails[low] = value; steps.push({ phase: 'process', activeLine: low === tails.length - 1 ? 5 : 6, message: `Place ${value} at tail position ${low}.`, state: { nums, tails: [...tails], index, output: null } }) })
    steps.push({ phase: 'done', activeLine: 7, message: `LIS length is ${tails.length}.`, state: { nums, tails, index: null, output: tails.length } }); return steps
}

export default function Problem300Visualizer() {
    const examples = useMemo(() => getExamplesOr('300', []), [])
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
                    <div className="problem300-visualizer-tails">tails: {(step.state.tails || []).join(', ') || 'empty'}</div>
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
