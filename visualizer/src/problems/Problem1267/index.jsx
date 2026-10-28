import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Tally', description: 'Count servers in every row and column.' },
    { id: 'count', label: 'Count server', description: 'A server that shares a line with another server counts.' },
    { id: 'skip', label: 'Skip server', description: 'A server alone in its row and column does not count.' },
    { id: 'done', label: 'Complete', description: 'Report how many servers communicate.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a 0/1 grid (1 is a server)',
  url: 'https://leetcode.com/problems/count-servers-that-communicate/',
  complexity: 'O(mn) time, with O(m + n) extra space for the row and column tallies. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Isolated', input: '{"grid":[[1,0],[0,1]]}' },
    { label: 'Shared column', input: '{"grid":[[1,0],[1,1]]}' },
  ],
}

export default function CountServers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Server grid" matrix={run.input.grid} highlightedCells={step.counted}
      activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null} />
    <output aria-label="Server total">{`Communicating servers: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Two servers communicate when they share a row or a column. A server counts when its row tally or its column tally exceeds one.</p>
    <p>Tallying each line once avoids comparing every pair of servers.</p>
  </>} />
}
