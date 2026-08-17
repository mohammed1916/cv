import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './MinCostClimbingStairsVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
    { line: 1, text: 'def minCostClimbingStairs(cost):' },
    { line: 2, text: '    n = len(cost)' },
    { line: 3, text: '    dp = [0] * (n + 1)' },
    { line: 4, text: '    for i in range(2, n + 1):' },
    { line: 5, text: '        dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])' },
    { line: 6, text: '    return min(dp[n-1], dp[n])' },
]

const EXAMPLES = getExamples('min-cost-climbing-stairs')

function generateSteps(cost) {
      const steps = []
    const n = cost.length
    const dp = new Array(n + 1).fill(null)
    dp[0] = 0
    dp[1] = 0

    steps.push({
        activeLine: 1,
        message: `Start: cost = [${cost.join(', ')}], n = ${n}`,
        cost,
        dp: [...dp],
        currentI: -1,
        oneStep: null,
        twoStep: null,
        phase: 'init',
    })

    for (let i = 2; i <= n; i++) {
        steps.push({
            activeLine: 4,
            message: `Iteration i = ${i}`,
            cost,
            dp: dp.map((v, idx) => (idx < i ? v : null)),
            currentI: i,
            oneStep: null,
            twoStep: null,
            phase: 'loop',
        })

        const oneStep = dp[i - 1] + cost[i - 1]
        steps.push({
            activeLine: 5,
            message: `dp[${i-1}] + cost[${i-1}] = ${dp[i-1]} + ${cost[i-1]} = ${oneStep}`,
            cost,
            dp: dp.map((v, idx) => (idx < i ? v : null)),
            currentI: i,
            oneStep,
            twoStep: null,
            phase: 'compute-one',
        })

        const twoStep = dp[i - 2] + cost[i - 2]
        steps.push({
            activeLine: 5,
            message: `dp[${i-2}] + cost[${i-2}] = ${dp[i-2]} + ${cost[i-2]} = ${twoStep}`,
            cost,
            dp: dp.map((v, idx) => (idx < i ? v : null)),
            currentI: i,
            oneStep,
            twoStep,
            phase: 'compute-two',
        })

        const chosen = Math.min(oneStep, twoStep)
        dp[i] = chosen

        steps.push({
            activeLine: 5,
            message: `dp[${i}] = min(${oneStep}, ${twoStep}) = ${chosen}`,
            cost,
            dp: dp.map((v, idx) => (idx <= i ? v : null)),
            currentI: i,
            oneStep,
            twoStep,
            phase: 'assign',
        })
    }

    const answer = Math.min(dp[n - 1], dp[n])
    steps.push({
        activeLine: 6,
        message: `Return min(dp[${n-1}], dp[${n}]) = min(${dp[n-1]}, ${dp[n]}) = ${answer}`,
        cost,
        dp,
        currentI: -1,
        oneStep: null,
        twoStep: null,
        phase: 'done',
        answer,
    })

    return steps
}

export default function MinCostClimbingStairsVisualizer() {
  const [costInput, setCostInput] = useState('[10,15,20]');
  const { cost, inputError } = useMemo(() => {
    try {
      const parsedCost = JSON.parse(costInput);
      if (!Array.isArray(parsedCost) || parsedCost.length < 2 || parsedCost.some((value) => !Number.isFinite(Number(value)))) throw new Error('Enter a JSON array with at least two numeric costs.');
      const normalizedCost = parsedCost.map(Number);
      return { cost: normalizedCost, inputError: '' };
    } catch (e) {
      return { cost: [10, 15, 20], inputError: e.message };
    }
  }, [costInput]);    const steps = useMemo(() => generateSteps(cost), [cost])
    const { currentStep, isPlaying, setCurrentStep, setIsPlaying } = usePlaybackState(steps.length)
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const handleExample = useCallback((ex) => {
        setCostInput(JSON.stringify(ex.input))
        setCurrentStep(0)
    }, [setCurrentStep])

    if (steps.length === 0) return null

    const step = steps[currentStep]

    const panelConfigs = useMemo(() => [
      { id: 'input', title: 'Input', dockMode: 'split-top' },
      { id: 'visualization', title: 'Visualization' },
      { id: 'code', title: 'Code Trace', dockMode: 'split-right' },
    ], [])
    const [panelDivs, setPanelDivs] = useState(null)
    const inputPanel = <ManualInputPanel
          fields={[{"key":"cost","label":"cost","type":"string"}]}
          values={{ cost: costInput }}
          onChange={(k, v) => { if (k === 'cost') setCostInput(v) }}
          examples={EXAMPLES}
          applyExample={handleExample}
          inputError={inputError}
    />
    const visualizationPanel = <div className="mcs-shell">
            <div className="mcs-top">
                <div className="mcs-panel mcs-panel-stats">
                    <div className="mcs-head">Info</div>
                    <div className="mcs-body">
                        <div className="mcs-metric">
                            <span className="mcs-label">Array Size</span>
                            <span className="mcs-val">{step.cost.length}</span>
                        </div>
                        <div className="mcs-metric">
                            <span className="mcs-label">Current dp[i]</span>
                            <span className="mcs-val">{step.currentI >= 0 && step.dp[step.currentI] !== null ? step.dp[step.currentI] : '—'}</span>
                        </div>
                        <div className="mcs-legend">
                            <div className="mcs-legend-item">
                                <span className="mcs-dot uncomputed"></span> Uncomputed
                            </div>
                            <div className="mcs-legend-item">
                                <span className="mcs-dot computed"></span> Computed
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mcs-panel mcs-panel-main">
                <div className="mcs-head">DP Array Visualization</div>
                <div className="mcs-array-container">
                    <div className="mcs-array-row">
                        {step.dp.map((val, idx) => (
                            <motion.div
                                key={idx}
                                className={`mcs-cell ${step.currentI === idx ? 'current' : ''} ${val !== null ? 'computed' : 'uncomputed'}`}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.03 }}
                            >
                                <div className="mcs-cell-label">dp[{idx}]</div>
                                <div className="mcs-cell-value">{val !== null ? val : '?'}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mcs-panel mcs-panel-cost">
                <div className="mcs-head">Cost Array</div>
                <div className="mcs-array-container">
                    <div className="mcs-array-row">
                        {step.cost.map((val, idx) => (
                            <motion.div key={idx} className="mcs-cost-cell" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: idx * 0.03 }}>
                                <div className="mcs-cell-label">cost[{idx}]</div>
                                <div className="mcs-cell-value">{val}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

    </div>
    const codePanel = <><div className="mcs-panel"><div className="mcs-head">Status</div><div className="mcs-status">{step.message}</div></div><CodeTracePanel code={SOLUTION_CODE} activeLine={step.activeLine} onActiveLineDomChange={setActiveLineDom} /></>
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
                currentStep={currentStep}
                totalSteps={steps.length}
                onStepChange={setCurrentStep}
                isPlaying={isPlaying}
                onPlayingChange={setIsPlaying}
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
