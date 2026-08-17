import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../../components/CodeTracePanel'
import PlaybackControls from '../../../components/PlaybackControls'
import PatternOverlay from '../../../components/PatternOverlay'
import { usePlaybackState } from '../../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../../hooks/usePatternOverlay'
import { getExamples } from '../../../config/examplesRegistry'
import './FindDisappearedNumbersVisualizer.css'
import FloatingPanel from '../../../components/shared/FloatingPanel'
import ManualInputPanel from '../../../components/shared/ManualInputPanel'
import LuminoDockPanel from '../../../components/LuminoDockPanel'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
    { line: 1, text: 'def findDisappearedNumbers(nums):' },
    { line: 2, text: '    for num in nums:' },
    { line: 3, text: '        idx = abs(num) - 1' },
    { line: 4, text: '        nums[idx] = -abs(nums[idx])' },
    { line: 5, text: '    result = []' },
    { line: 6, text: '    for i in range(len(nums)):' },
    { line: 7, text: '        if nums[i] > 0:' },
    { line: 8, text: '            result.append(i + 1)' },
    { line: 9, text: '    return result' },
]

const EXAMPLES = getExamples('find-disappeared-numbers')

function generateSteps(input) {
    const steps = []
    const nums = [...input]
    const n = nums.length

    steps.push({
        activeLine: 1,
        message: `Start: nums = [${nums.join(', ')}]`,
        nums: [...nums],
        phase: 'init',
        currentIdx: -1,
        targetIdx: -1,
        result: [],
    })

    // Phase 1: Mark visited indices
    for (let i = 0; i < n; i++) {
        const val = nums[i]
        const idx = Math.abs(val) - 1

        steps.push({
            activeLine: 2,
            message: `Process nums[${i}] = ${val}`,
            nums: [...nums],
            phase: 'mark-start',
            currentIdx: i,
            targetIdx: -1,
            result: [],
        })

        steps.push({
            activeLine: 3,
            message: `idx = abs(${val}) - 1 = ${idx}`,
            nums: [...nums],
            phase: 'mark-calc',
            currentIdx: i,
            targetIdx: idx,
            result: [],
        })

        steps.push({
            activeLine: 4,
            message: `Negate nums[${idx}]: ${nums[idx]} → ${-Math.abs(nums[idx])}`,
            nums: [...nums],
            phase: 'mark-negate',
            currentIdx: i,
            targetIdx: idx,
            result: [],
        })

        nums[idx] = -Math.abs(nums[idx])

        steps.push({
            activeLine: 4,
            message: `Marked: nums = [${nums.map((x) => (x < 0 ? x : x)).join(', ')}]`,
            nums: [...nums],
            phase: 'mark-done',
            currentIdx: i,
            targetIdx: idx,
            result: [],
        })
    }

    // Phase 2: Find positives
    const result = []

    steps.push({
        activeLine: 5,
        message: 'Phase 2: Scan for positive values',
        nums: [...nums],
        phase: 'scan-init',
        currentIdx: -1,
        targetIdx: -1,
        result: [],
    })

    for (let i = 0; i < n; i++) {
        steps.push({
            activeLine: 6,
            message: `Check nums[${i}] = ${nums[i]}`,
            nums: [...nums],
            phase: 'scan-check',
            currentIdx: i,
            targetIdx: -1,
            result: [...result],
        })

        if (nums[i] > 0) {
            result.push(i + 1)
            steps.push({
                activeLine: 8,
                message: `nums[${i}] > 0: Missing number ${i + 1}`,
                nums: [...nums],
                phase: 'scan-found',
                currentIdx: i,
                targetIdx: -1,
                result: [...result],
            })
        }
    }

    steps.push({
        activeLine: 9,
        message: `Result: [${result.join(', ')}]`,
        nums: [...nums],
        phase: 'done',
        currentIdx: -1,
        targetIdx: -1,
        result,
    })

    return steps
}

const EXAMPLES_OBJ = [
    { label: '[4,3,2,7,8,2,3,1]', input: [4, 3, 2, 7, 8, 2, 3, 1] },
    { label: '[1,1]', input: [1, 1] },
]

export default function FindDisappearedNumbersVisualizer() {
    const [inputText, setInputText] = useState(JSON.stringify([4, 3, 2, 7, 8, 2, 3, 1]))
    const { input, inputError } = useMemo(() => { try { const values = JSON.parse(inputText); if (!Array.isArray(values) || !values.length || values.some(value => !Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > values.length)) throw new Error('Enter a JSON array where every value is from 1 to n.'); return { input: values.map(Number), inputError: '' } } catch (error) { return { input: [4, 3, 2, 7, 8, 2, 3, 1], inputError: error.message } } }, [inputText])
    const steps = useMemo(() => generateSteps(input), [input])
    const { stepIndex, isPlaying, speed, setSpeed, stepForward, stepBack, togglePlay, handleReset, isDone } = usePlaybackState(steps.length)
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const handleExample = useCallback((ex) => {
        setInputText(JSON.stringify(ex.input))
        handleReset()
    }, [handleReset])

    if (steps.length === 0) return null

    const step = steps[Math.max(0, stepIndex)] || steps[0]

    const panelConfigs = useMemo(() => [
      { id: 'input', title: 'Input', dockMode: 'split-top' },
      { id: 'visualization', title: 'Visualization' },
      { id: 'code', title: 'Code Trace', dockMode: 'split-right' },
    ], [])
    const [panelDivs, setPanelDivs] = useState(null)
    const inputPanel = <ManualInputPanel fields={[{ key: 'nums', label: 'Numbers (JSON)', type: 'array' }]} values={{ nums: inputText }} onChange={(_, value) => { setInputText(value); handleReset() }} examples={EXAMPLES_OBJ} activeLabel={null} applyExample={handleExample} inputError={inputError} />
    const visualizationPanel = <div className="fdn-shell">
            <div className="fdn-top">
                <div className="fdn-panel fdn-panel-stats">
                    <div className="fdn-head">Info</div>
                    <div className="fdn-body">
                        <div className="fdn-metric">
                            <span className="fdn-label">Array Size</span>
                            <span className="fdn-val">{step.nums.length}</span>
                        </div>
                        <div className="fdn-metric">
                            <span className="fdn-label">Missing Count</span>
                            <span className="fdn-val">{step.result.length}</span>
                        </div>
                        <div className="fdn-legend">
                            <div className="fdn-legend-item">
                                <span className="fdn-dot positive"></span> Positive
                            </div>
                            <div className="fdn-legend-item">
                                <span className="fdn-dot negative"></span> Negative
                            </div>
                            <div className="fdn-legend-item">
                                <span className="fdn-dot marked"></span> Marked
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fdn-panel fdn-panel-main">
                <div className="fdn-head">Array Cells</div>
                <div className="fdn-array-container">
                    <div className="fdn-array">
                        {step.nums.map((val, idx) => {
                            const isTarget = idx === step.targetIdx
                            const isCurrent = idx === step.currentIdx
                            const isNegative = val < 0
                            const isPositive = val > 0

                            return (
                                <motion.div
                                    key={idx}
                                    className={`fdn-cell ${isNegative ? 'negative' : ''} ${isTarget ? 'target' : ''} ${isCurrent ? 'current' : ''}`}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <div className="fdn-cell-val">{val}</div>
                                    <div className="fdn-cell-idx">{idx}</div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="fdn-panel fdn-panel-result">
                <div className="fdn-head">Missing Numbers</div>
                <div className="fdn-body">
                    <div className="fdn-result-display">
                        {step.result.length === 0 ? (
                            <span className="fdn-result-empty">[ ]</span>
                        ) : (
                            step.result.map((num) => (
                                <motion.div
                                    key={num}
                                    className="fdn-result-chip"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                >
                                    {num}
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>

    </div>
    const codePanel = <>
      <div className="fdn-panel"><div className="fdn-head">Status</div><div className="fdn-status">{step.message}</div></div>
      <CodeTracePanel code={SOLUTION_CODE} activeLine={step.activeLine} onActiveLineDomChange={setActiveLineDom} />
    </>
    return (
        <>
          <LuminoDockPanel panels={panelConfigs} onPanelReady={setPanelDivs} />
          {panelDivs && <>
            {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
            {panelDivs.visualization && createPortal(visualizationPanel, panelDivs.visualization)}
            {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          </>}

            <FloatingPanel title="Playback Controls">
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
              onSpeedChange={(event) => setSpeed(Number(event.target.value))}
              showPatternOverlay={showPatternOverlay}
              onShowPatternOverlayChange={setShowPatternOverlay}
              patternOverlayLabel="Show pattern overlay"
              showPatternOverlayToggle
            />
      </FloatingPanel>

            {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
        </>
    )
}
