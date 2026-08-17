import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
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
    const [inputInput, setInputInput] = useState(JSON.stringify(examples[0]?.input ?? []))
    const { input, inputError } = useMemo(() => {
        try {
            const parsed = JSON.parse(inputInput)
            if (!Array.isArray(parsed)) throw new Error('Enter a JSON array of numbers.')
            return { input: parsed, inputError: '' }
        } catch (error) {
            return { input: examples[0]?.input ?? [], inputError: error.message }
        }
    }, [inputInput, examples])

    const steps = useMemo(() => generateSteps(input), [input])
    const { stepIndex, isPlaying, speed, setSpeed, stepForward, stepBack, togglePlay, handleReset, isDone } = usePlaybackState(steps.length)
    const step = steps[Math.max(0, stepIndex)] || steps[0]

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

    const inputPanel = (
        <ManualInputPanel
            fields={[{ key: 'nums', label: 'Numbers (JSON)', type: 'string' }]}
            values={{ nums: inputInput }}
            onChange={(_, value) => { setInputInput(value); handleReset() }}
            examples={examples}
            activeLabel={null}
            applyExample={(example) => { setInputInput(JSON.stringify(example.input)); handleReset() }}
            inputError={inputError}
        />
    )

    const codePanel = (
        <div style={{ position: 'relative', height: '100%' }}>
            <CodeTracePanel
                codeLines={SOLUTION_CODE}
                step={step}
            />
        </div>
    )

    // Step 4: Add state + config
    const [panelDivs, setPanelDivs] = useState(null)
    const panelConfigs = useMemo(
        () => [
            { id: 'input', title: 'Input' },
            { id: 'primary', title: 'Visualization', dockMode: 'split-bottom' },
            { id: 'code', title: 'Code Trace', dockMode: 'split-right' },
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
                    {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
                    {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
                    {panelDivs.code && createPortal(codePanel, panelDivs.code)}
                </>
            )}
            {createPortal(<FloatingPanel title="Playback Controls"><PlaybackControls
                onReset={handleReset}
                onNext={stepForward}
                onPrev={stepBack}
                onPlayToggle={togglePlay}
                isPlaying={isPlaying}
                isDone={isDone}
                prevDisabled={stepIndex < 0}
                nextDisabled={isDone}
                resetDisabled={stepIndex < 0}
                speed={speed}
                onSpeedChange={(event) => setSpeed(Number(event.target.value))}
              /></FloatingPanel>, document.body)}
        </div>
    )
}
