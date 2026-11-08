import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Origin', description: 'The robot starts at (0, 0).' },
    { id: 'move', label: 'Take a step', description: 'U and D change y; L and R change x.' },
    { id: 'done', label: 'Check origin', description: 'Return true only if both coordinates are zero.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Moves (JSON string of U, D, L, R)',
  url: 'https://leetcode.com/problems/robot-return-to-origin/',
  complexity: 'O(n) time and O(1) extra space for the two counters.',
  examples: [
    { label: 'Square', input: '"URDL"' },
    { label: 'Two up', input: '"UUD"' },
    { label: 'Loop', input: '"LRLRUD"' },
    { label: 'One move', input: '"U"' },
    { label: 'Cancelling pairs', input: '"UDLR"' },
    { label: 'Longest allowed path', input: '"UUUUUUUUUUUUUUUUUUUUDDDDDDDDDDDDDDDDDDDD"' },
    { label: 'Empty path', input: '""' },
    { label: 'Long run: 40 moves', input: '"RURRLDDLDRULRRURRUUURRUDLULRUUDLDRRRLULD"' },
  ],
}

export default function RobotReturn() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const xs = step.path.map(p => p[0]), ys = step.path.map(p => p[1])
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
    const matrix = Array.from({ length: maxY - minY + 1 }, () => Array(maxX - minX + 1).fill(''))
    step.path.forEach(([x, y], order) => { matrix[maxY - y][x - minX] = order === 0 ? 'start' : String(order) })
    const current = step.path[step.path.length - 1]
    return <>
      <MatrixGrid label="Path on the grid (numbers are step order)" matrix={matrix}
        activeCell={{ row: maxY - current[1], col: current[0] - minX }}
        highlightedCells={step.path.map(([x, y]) => ({ row: maxY - y, col: x - minX }))} />
      <output aria-label="Position">{`Position (${step.x}, ${step.y})${step.move ? ` after ${step.move}` : ''}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why two counters:</strong> vertical and horizontal moves never affect each other, so each axis only needs to end at zero.</p>
  </>} />
}
