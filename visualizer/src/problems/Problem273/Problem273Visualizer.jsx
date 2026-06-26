import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../../components/CodeTracePanel'
import PlaybackControls from '../../../components/PlaybackControls'
import PatternOverlay from '../../../components/PatternOverlay'
import DockableWorkspace from '../../../components/shared/DockableWorkspace'
import FloatingPanel from '../../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../../from '../../$1//usePlaybackState'
import { usePatternOverlay } from '../../../from '../../$1//usePatternOverlay'
import { useAutoScroll } from '../../../from '../../$1//useAutoScroll'
import { getExamples } from '../../../from '../../$1//examplesRegistry'
import './Problem273Visualizer.css'

const SOLUTION_CODE = [
    { line: 1, text: '# Integer to English Words Solution' },
    { line: 2, text: '# Convert integer to English words.' },
    { line: 3, text: 'def solve(input):' },
    { line: 4, text: '    # Implementation details' },
    { line: 5, text: '    return result' },
]

function generateSteps(input) {
    const steps = []

    steps.push({
        phase: 'init',
        activeLine: 1,
        message: 'Start: Convert integer to English words.',
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

export default function Problem273Visualizer() {
    const examples = useMemo(() => getExamples('273') || [], [])
    const [currentExample, setCurrentExample] = useState(0)
    const [currentStep, setCurrentStep] = useState(0)

    const example = examples[currentExample] || { input: [], output: [] }
    const steps = useMemo(() => generateSteps(example.input), [example])
    const step = steps[currentStep] || steps[0]

    const { isPlaying, setIsPlaying, canNext, canPrev } = usePlaybackState(steps, currentStep, setCurrentStep)
    const { pattern, togglePattern } = usePatternOverlay(false)

    return (
        <DockableWorkspace
            title="Integer to English Words"
            subtitle="integer-to-english-words"
            accentColor="#a855f7"
        >
            <FloatingPanel title="Visualization" position="main">
                <div className="problem273-visualizer-viz-panel">
                    <div className="problem273-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem273-visualizer-content"
                        >
                            <p>{step.message}</p>
                        </motion.div>
                    </div>
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
            </FloatingPanel>
            <FloatingPanel title="Code Trace" position="bottom">
                <CodeTracePanel
                    code={SOLUTION_CODE}
                    activeLine={step.activeLine}
                    onTogglePattern={togglePattern}
                    patternActive={pattern}
                />
            </FloatingPanel>
        </DockableWorkspace>
    )
}
