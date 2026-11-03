import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FloodRouteView from './FloodRouteView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid as a JSON list of row strings using S . * X D (e.g. ["S.D"])',
  url: 'https://leetcode.com/problems/minimum-time-takes-to-reach-destination-without-drowning/',
  complexity: 'O(m * n) time and space for an m x n grid: one BFS floods the grid and one BFS finds the traveler route. The visualization caps the grid at 8 x 8; the official bounds are not verified here.',
  examples: [
    { label: 'Dry detour', input: '["S...D", ".....", "*...."]' },
    { label: 'Caught by water', input: '["S..*", ".X..", "...D"]' },
    { label: 'Short hop', input: '["S.D"]' },
  ],
}

export default function Problem2814Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <FloodRouteView run={run} step={step} />}
    renderReasoning={({ run, step }) => <>
      <p>Water spreads first each minute, then the traveler steps. A cell is usable to leave at minute m only if its flood time is greater than m.</p>
      <p>{run ? `Result: ${run.result}.` : ''}</p>
    </>} />
}
