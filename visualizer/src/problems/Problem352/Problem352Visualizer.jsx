import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem352Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import PatternOverlay from "../../components/PatternOverlay";
import { createPortal } from 'react-dom'

const PATTERNS = ['collision-self', 'collision-wall', 'direction', 'eat-food', 'idle', 'init', 'move-forward', 'state-update']
const LINE_PATTERN_MAP = {
  0: 'idle',
  4: 'init',
  8: 'direction',
  10: 'collision-wall',
  12: 'eat-food',
  14: 'move-forward',
  15: 'state-update'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'from collections import deque' },

  { line: 2, text: 'class SnakeGame:' },
  { line: 3, text: '    def __init__(self, h, w, food):' },
  { line: 4, text: '        self.body = deque([(0,0)])' },
  { line: 5, text: '        self.food = deque(food)' },
  { line: 6, text: '    def move(self, direction):' },
  { line: 7, text: '        r, c = self.body[0]' },
  { line: 8, text: '        dr, dc = {U:(−1,0), D:(1,0), L:(0,−1), R:(0,1)}[direction]' },
  { line: 9, text: '        nr, nc = r + dr, c + dc' },
  { line: 10, text: '        if (nr,nc) in self.body[1:] or out_of_bounds: return −1' },
  { line: 11, text: '        self.body.appendleft((nr, nc))' },
  { line: 12, text: '        if (nr,nc) == food[0]:' },
  { line: 13, text: '            self.food.popleft()' },
  { line: 14, text: '        else: self.body.pop()' },
  { line: 15, text: '        return len(self.body)' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE
const solutionCode = SOLUTION_CODE

const GRID_SIZE = 10
const CELL_SIZE = 40

function generateSteps(movements) {
  const steps = []
  const food = [[5, 5], [3, 3], [7, 2]]
  const body = [[0, 0]]
  const directionMap = {
    U: [-1, 0],
    D: [1, 0],
    L: [0, -1],
    R: [0, 1],
  }

  steps.push({
    phase: 'init',
    activeLine: 4,
    body: [[0, 0]],
    head: [0, 0],
    nextHead: null,
    tail: [0, 0],
    foodRemaining: [...food],
    score: 1,
    message: 'Snake initialized at (0, 0). Waiting for first move.',
    relatedLines: [4],
  })

  let currentBody = [[0, 0]]
  let currentFood = [...food]
  let gameOver = false

  movements.forEach((direction, moveIndex) => {
    if (gameOver) return

    const head = currentBody[0]
    const [dr, dc] = directionMap[direction] || [0, 0]
    const nextHeadR = head[0] + dr
    const nextHeadC = head[1] + dc
    const nextHead = [nextHeadR, nextHeadC]

    // Check if next head is out of bounds
    steps.push({
      phase: 'direction',
      activeLine: 8,
      body: currentBody,
      head,
      nextHead,
      tail: currentBody[currentBody.length - 1],
      direction,
      foodRemaining: currentFood,
      score: currentBody.length,
      message: `Move ${moveIndex + 1}: Direction ${direction} → calculate new head (${nextHeadR}, ${nextHeadC}).`,
      relatedLines: [8],
    })

    const outOfBounds = nextHeadR < 0 || nextHeadR >= GRID_SIZE || nextHeadC < 0 || nextHeadC >= GRID_SIZE
    if (outOfBounds) {
      steps.push({
        phase: 'collision-wall',
        activeLine: 10,
        body: currentBody,
        head,
        nextHead,
        tail: currentBody[currentBody.length - 1],
        direction,
        foodRemaining: currentFood,
        score: currentBody.length,
        message: `Head hits wall at (${nextHeadR}, ${nextHeadC}). Game Over!`,
        relatedLines: [10],
      })
      gameOver = true
      return
    }

    // Check if next head collides with body (excluding tail since tail will move)
    const bodyWithoutTail = currentBody.slice(0, -1)
    const collidesSelf = bodyWithoutTail.some((seg) => seg[0] === nextHeadR && seg[1] === nextHeadC)
    if (collidesSelf) {
      steps.push({
        phase: 'collision-self',
        activeLine: 10,
        body: currentBody,
        head,
        nextHead,
        tail: currentBody[currentBody.length - 1],
        direction,
        foodRemaining: currentFood,
        score: currentBody.length,
        message: `Head collides with body at (${nextHeadR}, ${nextHeadC}). Game Over!`,
        relatedLines: [10],
      })
      gameOver = true
      return
    }

    // Move head forward
    const newBody = [[nextHeadR, nextHeadC], ...currentBody]
    const foundFood = currentFood.some((f) => f[0] === nextHeadR && f[1] === nextHeadC)

    if (foundFood) {
      steps.push({
        phase: 'eat-food',
        activeLine: 12,
        body: newBody,
        head: nextHead,
        nextHead: null,
        tail: currentBody[currentBody.length - 1],
        direction,
        foodRemaining: currentFood,
        score: newBody.length,
        message: `Food eaten at (${nextHeadR}, ${nextHeadC})! Snake grows to length ${newBody.length}.`,
        relatedLines: [12, 13],
      })
      currentFood = currentFood.filter((f) => !(f[0] === nextHeadR && f[1] === nextHeadC))
    } else {
      steps.push({
        phase: 'move-forward',
        activeLine: 14,
        body: newBody,
        head: nextHead,
        nextHead: null,
        tail: currentBody[currentBody.length - 1],
        direction,
        foodRemaining: currentFood,
        score: newBody.length,
        message: `Moved forward. Tail removed at (${currentBody[currentBody.length - 1][0]}, ${currentBody[currentBody.length - 1][1]}). Length stays ${newBody.length - 1}.`,
        relatedLines: [14],
      })
      newBody.pop()
    }

    currentBody = newBody

    steps.push({
      phase: 'state-update',
      activeLine: 15,
      body: currentBody,
      head: currentBody[0],
      nextHead: null,
      tail: currentBody[currentBody.length - 1],
      direction,
      foodRemaining: currentFood,
      score: currentBody.length,
      message: `Return score ${currentBody.length}.`,
      relatedLines: [15],
    })
  })

  if (steps.length === 1) {
    steps.push({
      phase: 'idle',
      activeLine: 0,
      body: currentBody,
      head: currentBody[0],
      nextHead: null,
      tail: currentBody[currentBody.length - 1],
      direction: '',
      foodRemaining: currentFood,
      score: currentBody.length,
      message: 'Enter movements to simulate the game.',
      relatedLines: [],
    })
  }

  return steps
}

function GridVisualization({ step, gridSize = GRID_SIZE, cellSize = CELL_SIZE }) {
  const body = step?.body || [[0, 0]]
  const nextHead = step?.nextHead
  const foodRemaining = step?.foodRemaining || []
  const isCollision = step?.phase?.includes('collision')
  const isFoodEaten = step?.phase === 'eat-food'

  return (
    <div className="dsg-grid-wrapper">
      <div
        className={`dsg-grid ${isCollision ? 'collision' : ''} ${isFoodEaten ? 'food-eaten' : ''}`}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gap: '1px',
          padding: '12px',
          backgroundColor: '#0f172a',
          borderRadius: '8px',
          border: '2px solid #334155',
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
          const row = Math.floor(idx / gridSize)
          const col = idx % gridSize
          const isHead = body.length > 0 && body[0][0] === row && body[0][1] === col
          const isBody = body.slice(1).some((seg) => seg[0] === row && seg[1] === col)
          const isFood = foodRemaining.some((f) => f[0] === row && f[1] === col)
          const isNextHead = nextHead && nextHead[0] === row && nextHead[1] === col

          return (
            <div
              key={idx}
              className={`dsg-cell ${isHead ? 'head' : isBody ? 'body' : isFood ? 'food' : ''} ${isNextHead ? 'next-head' : ''}`}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: isHead ? '#ef4444' : isBody ? '#f97316' : isFood ? '#eab308' : '#1e293b',
                borderRadius: '4px',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                position: 'relative',
              }}
            >
              {isHead && (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                  ◉
                </motion.div>
              )}
              {isFood && (
                <motion.div
                  initial={{ rotate: 0, scale: 0.8 }}
                  animate={{ rotate: 360, scale: 1 }}
                  transition={{ duration: 0.6, type: 'spring' }}
                >
                  ★
                </motion.div>
              )}
              {isBody && <span style={{ color: '#4879a9', fontSize: '14px' }}>●</span>}
              {isNextHead && (
                <motion.div
                  className="dsg-next-head-preview"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 0.6, scale: 0.7 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: 'absolute',
                    border: '2px dashed #60a5fa',
                    width: '90%',
                    height: '90%',
                    borderRadius: '4px',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StateCard({ label, value, accent, icon }) {
  return (
    <div className="dsg-state-card">
      <div className="dsg-state-label">{icon && <span className="dsg-state-icon">{icon}</span>} {label}</div>
      <div className={`dsg-state-value ${accent || ''}`}>{value}</div>
    </div>
  )
}

function DirectionArrow({ direction }) {
  const arrowMap = {
    U: '↑',
    D: '↓',
    L: '←',
    R: '→',
  }
  const colorMap = {
    U: '#60a5fa',
    D: '#34d399',
    L: '#f472b6',
    R: '#fbbf24',
  }

  return (
    <motion.div
      className="dsg-direction-arrow"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: colorMap[direction],
        textShadow: `0 0 12px ${colorMap[direction]}`,
      }}
    >
      {arrowMap[direction]}
    </motion.div>
  )
}

const EXAMPLES = getExamplesOr('design-snake-game', [
  { label: 'Straight Move', value: 'RRRRU', moves: ['R', 'R', 'R', 'R', 'U'] },
  { label: 'Food Eating', value: 'RRUULL', moves: ['R', 'R', 'U', 'U', 'L', 'L'] },
  { label: 'Self-Collision', value: 'RRRUUULL', moves: ['R', 'R', 'R', 'U', 'U', 'U', 'L', 'L'] },
])

export default function DesignSnakeGameVisualizer() {
  const [movementsInput, setMovementsInput] = useState('RRDDR')

  const { movements, inputError } = useMemo(() => {
    const trimmed = movementsInput.trim().toUpperCase()
    if (!trimmed) return { movements: [], inputError: '' }
    if (!/^[UDLR]*$/.test(trimmed)) return { movements: [], inputError: 'Only U, D, L, R are allowed.' }
    if (trimmed.length > 50) return { movements: [], inputError: 'Maximum 50 moves.' }
    return { movements: trimmed.split(''), inputError: '' }
  }, [movementsInput])

  const steps = useMemo(() => generateSteps(movements), [movements])

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((ex) => {
    setMovementsInput(ex.moves?.join('') || ex.value || '')
    handleReset()
  }, [handleReset])

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'grid', title: 'Game Grid', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={solutionCode || SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    grid: (<div className="dsg-viz-container">
          <GridVisualization step={step} />
          <div className="dsg-stats-row">
            <StateCard label="Score" value={step?.score ?? 1} accent="primary" icon="🐍" />
            <StateCard label="Food Left" value={step?.foodRemaining?.length ?? 0} accent="success" icon="★" />
            <StateCard label="Direction" value={step?.direction || '—'} accent="cyan" icon="◀" />
          </div>
          <AnimatePresence mode="wait">
            {step?.direction && (
              <div className="dsg-direction-display">
                <DirectionArrow direction={step.direction} />
              </div>
            )}
          </AnimatePresence>
        </div>),
  }), [step, solutionCode, connectivity])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="dsg-shell">
      <ManualInputPanel
        fields={[{"key":"movements","label":"movements","type":"string"}]}
        values={{ movements: movementsInput }}
        onChange={(k, v) => { if (k === 'movements') setMovementsInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

      <FloatingPanel title="Movements & Examples" className="dsg-input-panel">
        <div className="dsg-example-row">
          {EXAMPLES.map((ex) => (
            <button key={ex.label} className="dsg-example-btn" onClick={() => applyExample(ex)}>
              {ex.label}
            </button>
          ))}
        </div>
        <div className="dsg-input-row">
          <span className="dsg-input-prefix">moves =</span>
          <input
            className="dsg-input"
            value={movementsInput}
            onChange={(e) => {
              setMovementsInput(e.target.value)
              handleReset()
            }}
            placeholder="RRDDR"
            maxLength={50}
          />
        </div>
        {inputError && <span className="dsg-error-pill">{inputError}</span>}
        <div className="dsg-note-box">
          <div className="dsg-note-title">How it works</div>
          <div className="dsg-note-text">
            Each move applies a direction: <code>U</code>p, <code>D</code>own, <code>L</code>eft, <code>R</code>ight. The snake head moves, food is eaten if at the new position, and the tail shrinks unless food is consumed. If the head hits a wall or body, game over.
          </div>
        </div>
      </FloatingPanel>

      <FloatingPanel title="Game Status" className="dsg-status-panel">
        <div className="dsg-game-status">
          <div className="dsg-status-title">Current Phase</div>
          <div className={`dsg-status-badge ${step?.phase || ''}`}>
            {step?.phase === 'init'
              ? 'Initialized'
              : step?.phase === 'direction'
                ? 'Direction Input'
                : step?.phase === 'eat-food'
                  ? 'Food Eaten! 🎉'
                  : step?.phase === 'move-forward'
                    ? 'Moving'
                    : step?.phase === 'collision-wall'
                      ? 'Wall Collision ✗'
                      : step?.phase === 'collision-self'
                        ? 'Self-Collision ✗'
                        : step?.phase === 'state-update'
                          ? 'State Updated'
                          : 'Idle'}
          </div>
        </div>
        <div className="dsg-body-trace">
          <div className="dsg-trace-title">Body Segments</div>
          <div className="dsg-segments-list">
            {step?.body?.length === 0 ? (
              <div className="dsg-trace-empty">No body yet.</div>
            ) : (
              step?.body?.map((seg, idx) => (
                <div key={`${idx}-${seg.join(',')}`} className={`dsg-segment-item ${idx === 0 ? 'head' : 'body'}`}>
                  <span className="dsg-segment-label">{idx === 0 ? 'Head' : `Seg ${idx}`}</span>
                  <span className="dsg-segment-coord">
                    ({seg[0]}, {seg[1]})
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="dsg-controls-info">
          <div className="dsg-info-title">Controls</div>
          <div className="dsg-info-text">Use UDLR (Up, Down, Left, Right) to control the snake. Watch out for walls and your own tail!</div>
        </div>
      </FloatingPanel>

      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.grid && createPortal(panelContents.grid, panelDivs.grid)}
          </>
        )}
      </>

      <div className={`dsg-status ${step?.phase?.includes('collision') ? 'danger' : step?.phase === 'eat-food' ? 'success' : ''}`}>
        {step?.message || 'Press Play or Step to begin.'}
      </div>

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
