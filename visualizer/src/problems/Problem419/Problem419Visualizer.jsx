import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import './Problem419Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('battleships-in-a-board')

const PATTERNS = ['done', 'found_ship', 'init', 'mark_connected', 'mark_visited', 'scan_start']
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'scan_start',
  3: 'found_ship',
  4: 'mark_visited',
  5: 'mark_connected',
  6: 'done'
}


const EXAMPLES = [
  {
    label: 'Small',
    board: [['X', 'X', '.', 'X'], ['.', '.', '.', '.'], ['.', '.', '.', '.']],
    expected: 2
  },
  {
    label: 'Medium',
    board: [['X', 'X', '.', 'X'], ['X', '.', '.', '.'], ['.', '.', '.', '.']],
    expected: 2
  },
  {
    label: 'Large',
    board: [['X', '.', '.', 'X'], ['.', '.', '.', '.'], ['.', '.', '.', 'X']],
    expected: 3
  },
]

function generateSteps(board) {
  const steps = []
  const m = board.length
  const n = board[0].length

  steps.push({
    activeLine: 1,
    message: `Count battleships in ${m}x${n} board.`,
    phase: 'init',
    result: 0,
    count: 0,
    visited: Array(m).fill(null).map(() => Array(n).fill(false)),
    currentCell: null,
    ships: [],
    board,
  })

  let count = 0
  const visited = Array(m).fill(null).map(() => Array(n).fill(false))
  const ships = []

  steps.push({
    activeLine: 2,
    message: `Initialize board scanning.`,
    phase: 'scan_start',
    result: 0,
    count: 0,
    visited: visited.map(row => [...row]),
    currentCell: null,
    ships: [],
    board,
  })

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (board[i][j] === 'X' && !visited[i][j]) {
        steps.push({
          activeLine: 3,
          message: `Found unvisited ship cell at [${i}, ${j}]`,
          phase: 'found_ship',
          result: count,
          count,
          visited: visited.map(row => [...row]),
          currentCell: [i, j],
          ships: [...ships],
          board,
        })

        count++
        ships.push([i, j])
        visited[i][j] = true

        steps.push({
          activeLine: 4,
          message: `Ship #${count} detected. Mark as visited.`,
          phase: 'mark_visited',
          result: count,
          count,
          visited: visited.map(row => [...row]),
          currentCell: [i, j],
          ships: [...ships],
          board,
        })

        // Mark adjacent ship cells
        if (i + 1 < m && board[i + 1][j] === 'X') {
          visited[i + 1][j] = true
        }
        if (j + 1 < n && board[i][j + 1] === 'X') {
          visited[i][j + 1] = true
        }

        steps.push({
          activeLine: 5,
          message: `Mark connected cells as visited.`,
          phase: 'mark_connected',
          result: count,
          count,
          visited: visited.map(row => [...row]),
          currentCell: [i, j],
          ships: [...ships],
          board,
        })
      }
    }
  }

  steps.push({
    activeLine: 6,
    message: `Complete. Total battleships: ${count}`,
    phase: 'done',
    result: count,
    count,
    visited: visited.map(row => [...row]),
    currentCell: null,
    ships,
    board,
  })

  return steps
}

function BattleshipsVisualization({ board, step }) {
  const result = step?.result || 0
  const m = board.length
  const n = board[0].length
  const visited = step?.visited || []
  const ships = step?.ships || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Battleships Counter</div>

      {/* Board visualization */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Board ({m}x{n})</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${n}, minmax(60px, 1fr))`,
          gap: 4,
          padding: 8,
          backgroundColor: '#f1f5f9',
          borderRadius: 6,
          border: '2px solid #cbd5e1',
          width: 'fit-content',
        }}>
          {board.map((row, i) =>
            row.map((cell, j) => {
              const isCurrent = step?.currentCell && step.currentCell[0] === i && step.currentCell[1] === j
              const isVisited = visited[i] && visited[i][j]
              const isShip = cell === 'X'

              let bgColor = '#f1f5f9'
              let borderColor = '#cbd5e1'
              let content = '·'

              if (isShip) {
                if (isCurrent) {
                  bgColor = '#fce7f3'
                  borderColor = '#be185d'
                  content = '🎯'
                } else if (isVisited) {
                  bgColor = '#fed7aa'
                  borderColor = '#f97316'
                  content = 'X'
                } else {
                  bgColor = '#ffffff'
                  borderColor = '#f97316'
                  content = 'X'
                }
              }

              return (
                <motion.div
                  key={`${i}-${j}`}
                  style={{
                    padding: '8px',
                    backgroundColor: bgColor,
                    borderRadius: 4,
                    border: `2px solid ${borderColor}`,
                    textAlign: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: isShip ? '#f97316' : '#cbd5e1',
                    minWidth: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  animate={{
                    scale: isCurrent ? 1.15 : 1,
                  }}
                >
                  {content}
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <div style={{ padding: 10, backgroundColor: '#ffffff', borderRadius: 4, border: '2px solid #f97316' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#92400e' }}>Unvisited Ship</div>
          <div style={{ fontSize: 11, color: '#92400e', marginTop: 4 }}>Potential ship</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#fed7aa', borderRadius: 4, border: '2px solid #f97316' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#92400e' }}>Visited Ship</div>
          <div style={{ fontSize: 11, color: '#92400e', marginTop: 4 }}>Part of a ship</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#f1f5f9', borderRadius: 4, border: '2px solid #cbd5e1' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b' }}>Water</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Empty cell</div>
        </div>
      </div>

      {/* Ships list */}
      {ships.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Detected Ships</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ships.map((pos, idx) => (
              <div
                key={idx}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#fed7aa',
                  borderRadius: 4,
                  border: '2px solid #f97316',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#92400e',
                }}
              >
                Ship #{idx + 1} at [{pos[0]}, {pos[1]}]
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      <div style={{ padding: 12, backgroundColor: '#fed7aa', borderRadius: 6, border: '2px solid #f97316' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>Total Battleships</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#c35305' }}>
          {result}
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#475569' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem419Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [boardInput, setBoardInput] = useState(JSON.stringify(EXAMPLES[0]?.board ?? []));
  const { board, inputError } = useMemo(() => {
    try {
      const parsedBoard = JSON.parse(boardInput); if (!Array.isArray(parsedBoard)) throw new Error('board must be an array');
      return { board: parsedBoard, inputError: '' };
    } catch (e) {
      return { board: EXAMPLES[exIdx]?.board ?? '', inputError: e.message };
    }
  }, [boardInput]);
  const example = EXAMPLES[exIdx]

  const steps = useMemo(
    () =>
      generateSteps(board).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [example]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((i) => { setExIdx(i); setBoardInput(JSON.stringify(EXAMPLES[i].board)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🎯 Battleships', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, height: '100%' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, idx) => (
                <button
                  key={e.label}
                  onClick={() => applyEx(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: exIdx === idx ? '2px solid #f97316' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#fed7aa' : '#f1f5f9',
                    color: exIdx === idx ? '#92400e' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <BattleshipsVisualization board={board} step={step} />
        </div>),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, example, exIdx, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"board","label":"board","type":"array"}]}
          values={{ board: boardInput }}
          onChange={(k, v) => { if (k === 'board') setBoardInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={EXAMPLES[exIdx]?.label}
          applyExample={(e) => applyEx(EXAMPLES.indexOf(e))}
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
      
    </div>
  )
}
