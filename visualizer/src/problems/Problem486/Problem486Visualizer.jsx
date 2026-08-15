import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem486Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('predict-the-winner')

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#048196' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#1b6df5' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#1b6df5' },
  'found': { icon: '✓', label: 'Match Found', color: '#0c865d' },
  'done': { icon: '✓', label: 'Complete', color: '#0c865d' },
}

const LINE_PATTERN_MAP = {


  1: 'init',


  2: 'loop',


  3: 'loop',


  4: 'loop',


  5: 'loop',


  6: 'done',


}

const EXAMPLES = getExamplesOr('predict-the-winner', [
  { label: 'Example 1', nums: [1, 5, 233, 7] },
  { label: 'Example 2', nums: [12, 3, 1, 5, 6, 4] },
])

function generateSteps(nums) {
  const steps = []
  const memo = {}
  let stepCounter = 0

  function canWin(left, right, player) {
    if (left > right) return false
    if (left === right) return player === 1

    const key = `${left},${right}`
    if (memo[key] !== undefined) return memo[key]

    const leftChoice = nums[left]
    const rightChoice = nums[right]

    stepCounter++
    steps.push({
      activeLine: 2,
      left,
      right,
      player,
      memo,
      canWin: null,
      stepCounter,
      message: `Player ${player} chooses between nums[${left}]=${leftChoice} or nums[${right}]=${rightChoice}`
    })

    const canWinIfChooseLeft = !canWin(left + 1, right, 3 - player)
    stepCounter++
    steps.push({
      activeLine: 3,
      left,
      right,
      player,
      memo,
      canWin: canWinIfChooseLeft,
      stepCounter,
      message: `If choose left (${leftChoice}), opponent can win? ${canWin(left + 1, right, 3 - player)}`
    })

    const canWinIfChooseRight = !canWin(left, right - 1, 3 - player)
    stepCounter++
    steps.push({
      activeLine: 4,
      left,
      right,
      player,
      memo,
      canWin: canWinIfChooseRight,
      stepCounter,
      message: `If choose right (${rightChoice}), opponent can win? ${canWin(left, right - 1, 3 - player)}`
    })

    const result = canWinIfChooseLeft || canWinIfChooseRight
    memo[key] = result
    stepCounter++
    steps.push({
      activeLine: 5,
      left,
      right,
      player,
      memo,
      canWin: result,
      stepCounter,
      message: `Player ${player} can win from [${left},${right}]? ${result}`
    })

    return result
  }

  steps.push({
    activeLine: 1,
    left: 0,
    right: nums.length - 1,
    player: 1,
    memo: {},
    canWin: null,
    message: 'Start game: Player 1 vs Player 2',
    stepCounter: 0
  })

  const result = canWin(0, nums.length - 1, 1)

  steps.push({
    activeLine: 6,
    left: 0,
    right: nums.length - 1,
    player: 1,
    memo,
    canWin: result,
    done: true,
    message: `Player 1 can win? ${result}`,
    stepCounter: stepCounter
  })

  return steps
}

function VisualizationPanel({ nums, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#eff6ff', borderRadius: 6, borderLeft: '4px solid #3b82f6' }}>
        <div style={{ fontSize: 12, color: '#1e40af', fontStyle: 'italic' }}>
          Two players take turns picking numbers from either end of an array. Player 1 goes first. Determine if Player 1 can win using optimal play.
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Game Array</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {nums.map((num, idx) => {
            const inWindow = step && idx >= step.left && idx <= step.right
            const isEndpoint = step && (idx === step.left || idx === step.right)
            return (
              <motion.div
                key={`num-${idx}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 700,
                  backgroundColor: isEndpoint ? '#dbeafe' : inWindow ? '#e0f2fe' : 'var(--surface2)',
                  borderColor: isEndpoint ? '#0284c7' : inWindow ? '#0ea5e9' : 'var(--border)',
                  color: isEndpoint ? '#0c4a6e' : inWindow ? '#164e63' : 'var(--border)'
                }}
                animate={{ scale: isEndpoint ? 1.15 : inWindow ? 1.05 : 1 }}
              >
                {num}
              </motion.div>
            )
          })}
        </div>
      </div>

      {step && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#dbeafe',
            borderRadius: 6,
            border: '2px solid #0284c7'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 12 }}>
            Game State
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: '#0c4a6e', marginBottom: 4 }}>Current Player</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#027bba' }}>P{step.player}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#0c4a6e', marginBottom: 4 }}>Left Index</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#027bba' }}>{step.left}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#0c4a6e', marginBottom: 4 }}>Right Index</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#027bba' }}>{step.right}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#0c4a6e', marginBottom: 4 }}>Can Win</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#027bba' }}>
                {step.canWin !== null ? (step.canWin ? '✓' : '✗') : '?'}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {step?.memo && Object.keys(step.memo).length > 0 && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            border: '1px solid #10b981'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Memoization Cache ({Object.keys(step.memo).length} entries)
          </div>
          <div style={{ fontSize: 11, color: '#047857', fontFamily: 'monospace', overflow: 'auto', maxHeight: 100 }}>
            {Object.entries(step.memo).slice(-5).map(([key, val]) => (
              <div key={key}>[{key}] → {val ? '✓' : '✗'}</div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#fef3c7',
          borderRadius: 6,
          border: '2px solid #f59e0b',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>Winner</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#a36907' }}>
          {step?.canWin === true ? 'Player 1 Wins' : step?.canWin === false ? 'Player 2 Wins' : '...'}
        </div>
        <div style={{ fontSize: 12, color: '#a36907', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function Problem486Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [numsInput, setNumsInput] = useState("[1,5,233,7]");
  const { nums, inputError } = useMemo(() => {
    try {
      const parsedNums = JSON.parse(numsInput); if (!Array.isArray(parsedNums)) throw new Error('nums must be an array');
      return { nums: parsedNums, inputError: '' };
    } catch (e) {
      return { nums: "[1,5,233,7]", inputError: e.message };
    }
  }, [numsInput]);

  const steps = useMemo(
    () =>
      generateSteps(nums).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [nums]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setNumsInput(JSON.stringify(e.nums)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🎮 Predict the Winner', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<VisualizationPanel
          nums={nums}
          step={step}
          applyEx={applyEx}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"nums","label":"nums","type":"array"}]}
          values={{ nums: numsInput }}
          onChange={(k, v) => { if (k === 'nums') setNumsInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
          inputError={inputError}
        />
      
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={Object.keys(PATTERNS)} />}
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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
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

