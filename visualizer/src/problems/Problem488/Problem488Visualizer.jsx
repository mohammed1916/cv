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
import './Problem488Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('zuma-game')

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


  3: 'done',


}

const EXAMPLES = getExamplesOr('zuma-game', [
  { label: 'Example 1', board: 'WWWWW', hand: 'W' },
  { label: 'Example 2', board: 'WRRBBW', hand: 'RB' },
  { label: 'Example 3', board: 'WBWBW', hand: 'WB' },
])

function generateSteps(board, hand) {
  const steps = []
  let stepCount = 0

  steps.push({
    activeLine: 1,
    board,
    hand,
    inserted: -1,
    removed: [],
    ballsUsed: 0,
    message: `Start: board="${board}", hand="${hand}"`,
    stepCount: stepCount++
  })

  const colors = ['R', 'G', 'B', 'W', 'Y']
  const groupsByColor = {}
  colors.forEach(c => {
    groupsByColor[c] = []
    for (let i = 0; i < board.length; i++) {
      if (board[i] === c) {
        const group = [i]
        let j = i + 1
        while (j < board.length && board[j] === c) {
          group.push(j)
          j++
        }
        if (group.length > 1) {
          groupsByColor[c].push(group)
          i = j - 1
        }
      }
    }
  })

  steps.push({
    activeLine: 2,
    board,
    hand,
    inserted: -1,
    removed: [],
    ballsUsed: 0,
    groupsByColor,
    message: 'Analyze consecutive same-colored balls',
    stepCount: stepCount++
  })

  steps.push({
    activeLine: 3,
    board,
    hand,
    inserted: -1,
    removed: [],
    ballsUsed: 0,
    done: true,
    message: 'BFS explores all possible insertions',
    stepCount: stepCount++
  })

  return steps
}

function VisualizationPanel({ board, hand, step, applyEx }) {
  const colorMap = { 'W': '#8b5cf6', 'R': '#ef4444', 'G': '#10b981', 'B': '#3b82f6', 'Y': '#f59e0b' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fff7ed', borderRadius: 6, borderLeft: '4px solid #f59e0b' }}>
        <div style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>
          Simulate Zuma: shoot balls to form 3+ consecutive same colors. Use BFS to find minimum shots.
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Game Board (Circular)</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
          {board.split('').map((color, idx) => (
            <motion.div
              key={`board-${idx}`}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: colorMap[color] || 'var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#757575',
                fontSize: 12
              }}
              animate={{ scale: step?.inserted === idx ? 1.3 : 1 }}
            >
              {color}
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Hand</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {hand.split('').map((color, idx) => (
            <motion.div
              key={`hand-${idx}`}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: colorMap[color] || 'var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#757575',
                fontSize: 12,
                border: '2px solid #333'
              }}
            >
              {color}
            </motion.div>
          ))}
        </div>
      </div>

      {step?.groupsByColor && Object.keys(step.groupsByColor).length > 0 && (
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
            Consecutive Groups
          </div>
          <div style={{ fontSize: 11, color: '#047857' }}>
            {Object.entries(step.groupsByColor).map(([color, groups]) => (
              groups.length > 0 && (
                <div key={color}>
                  {color}: {groups.map(g => `[${g.join(',')}]`).join(', ')}
                </div>
              )
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
        <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>Strategy</div>
        <div style={{ fontSize: 12, color: '#a36907' }}>
          {step?.message || 'Finding minimum balls to shoot...'}
        </div>
      </motion.div>
    </div>
  )
}

export default function Problem488Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [boardInput, setBoardInput] = useState("WWWWW");
  const [handInput, setHandInput] = useState("WWWWW");
  const { board, hand, inputError } = useMemo(() => {
    try {
      const parsedBoard = boardInput;
      const parsedHand = handInput;
      return { board: parsedBoard, hand: parsedHand, inputError: '' };
    } catch (e) {
      return { board: "WWWWW", hand: "WWWWW", inputError: e.message };
    }
  }, [boardInput, handInput]);

  const steps = useMemo(
    () =>
      generateSteps(board, hand).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [board, hand]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setBoardInput(String(e.board)); setHandInput(String(e.hand)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🎮 Zuma Game', dockMode: 'split-right' },
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
          board={board}
          hand={hand}
          step={step}
          applyEx={applyEx}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"board","label":"board","type":"string"},{"key":"hand","label":"hand","type":"string"}]}
          values={{ board: boardInput, hand: handInput }}
          onChange={(k, v) => { if (k === 'board') setBoardInput(v); if (k === 'hand') setHandInput(v); handleReset() }}
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

