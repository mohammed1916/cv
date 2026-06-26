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
import './Problem289Visualizer.css'

const SOLUTION_CODE = [
    { line: 1, text: '# Game of Life Solution' },
    { line: 2, text: '# Simulate game of life cellular automaton.' },
    { line: 3, text: 'def solve(input):' },
    { line: 4, text: '    # Implementation details' },
    { line: 5, text: '    return result' },
]

function generateSteps(board) {
    const steps = []
    if (!board || board.length === 0) return steps

    const rows = board.length
    const cols = board[0]?.length || 0
    const originalBoard = JSON.parse(JSON.stringify(board))
    const newBoard = JSON.parse(JSON.stringify(board))

    steps.push({
        phase: 'init',
        activeLine: 1,
        message: `Game of Life: ${rows}x${cols} grid. Checking neighbors for each cell...`,
        board: originalBoard,
        newBoard: null,
        currentCell: null,
    })

    let cellsChanged = 0

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let liveNeighbors = 0

            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    if (di === 0 && dj === 0) continue
                    const ni = i + di
                    const nj = j + dj
                    if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                        if (board[ni][nj] === 1) liveNeighbors++
                    }
                }
            }

            const wasAlive = board[i][j] === 1
            let willLive = false

            if (wasAlive) {
                willLive = liveNeighbors === 2 || liveNeighbors === 3
            } else {
                willLive = liveNeighbors === 3
            }

            if (wasAlive !== willLive) cellsChanged++
            newBoard[i][j] = willLive ? 1 : 0

            steps.push({
                phase: 'evaluate',
                activeLine: 3,
                message: `Cell [${i}][${j}]: ${liveNeighbors} neighbors, ${wasAlive ? 'alive' : 'dead'} -> ${willLive ? 'LIVES' : 'dies'}`,
                board: originalBoard,
                newBoard: newBoard,
                currentCell: { row: i, col: j },
                liveNeighbors: liveNeighbors,
                willLive: willLive,
            })
        }
    }

    const aliveCount = newBoard.reduce((sum, row) =>
        sum + row.reduce((s, cell) => s + (cell === 1 ? 1 : 0), 0), 0)

    steps.push({
        phase: 'done',
        activeLine: 5,
        message: `Generation complete: ${cellsChanged} cells changed, ${aliveCount} alive`,
        board: newBoard,
        newBoard: null,
    })

    return steps
}

export default function Problem289Visualizer() {
    const examples = useMemo(() => getExamples('289') || [], [])
    const [currentExample, setCurrentExample] = useState(0)
    const [currentStep, setCurrentStep] = useState(0)

    const example = examples[currentExample] || { input: [], output: [] }
    const steps = useMemo(() => generateSteps(example.input), [example])
    const step = steps[currentStep] || steps[0]

    const { isPlaying, setIsPlaying, canNext, canPrev } = usePlaybackState(steps, currentStep, setCurrentStep)
    const { pattern, togglePattern } = usePatternOverlay(false)

    return (
        <DockableWorkspace
            title="Game of Life"
            subtitle="game-of-life"
            accentColor="#8b5cf6"
        >
            <FloatingPanel title="Visualization" position="main">
                <div className="problem289-visualizer-viz-panel">
                    <div className="problem289-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem289-visualizer-content"
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
