import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Top-left', description: 'The top-left coin starts the robot, and a robber there may be neutralized.' },
    { id: 'cell', label: 'Cell', description: 'Take the coin, or neutralize a robber, from the best state above or to the left.' },
    { id: 'done', label: 'Complete', description: 'Report the largest money at the bottom-right.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Coins grid (JSON object with coins rows of integers from -10 to 10, up to 5 by 5)',
  url: 'https://leetcode.com/problems/maximum-amount-of-money-robot-can-earn/',
  complexity: 'O(m * n) time with three states per cell. The visualization caps the grid at 5 by 5.',
  examples: [
    { label: 'Official', input: '{"coins":[[0,1,-1],[1,-2,3],[2,-3,4]]}' },
    { label: 'All positive', input: '{"coins":[[10,10,10],[10,10,10]]}' },
  ],
}

export default function RobotMoney() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid matrix={run.coins} label="Coins (negative = robber)" activeCell={{ row: step.row, col: step.col }} />
    <MatrixGrid matrix={step.table} label="Best money for the cell over all robber states (· = not yet)" activeCell={{ row: step.row, col: step.col }} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The robot moves right or down. A negative coin is a robber that takes money, unless the robot spends a neutralizer on it; there are at most two neutralizers.</p>
    <p>Each cell keeps the best money for having used zero, one or two neutralizers, so the final answer is the best of those three states.</p>
  </>} />
}
