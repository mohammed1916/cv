import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecurrenceGrid from '../../components/shared/RecurrenceGrid'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Outer pair', description: 'Price the first mirror pair: the two outermost houses.' },
    { id: 'pairs', label: 'Inner pairs', description: 'Move inward one mirror pair at a time, keeping both colors different from the previous pair.' },
    { id: 'done', label: 'Result', description: 'Take the cheapest state of the innermost pair.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Painting JSON with n and cost (n × 3)',
  url: 'https://leetcode.com/problems/paint-house-iv/',
  complexity: 'O(n) time and O(1) extra space for n houses, since each mirror pair has six color states. The visualization caps n at 12.',
  examples: [
    { label: 'Example 1', input: '{"n":4,"cost":[[3,5,7],[6,2,9],[4,8,1],[7,3,5]]}' },
    { label: 'Example 2', input: '{"n":6,"cost":[[2,4,6],[5,3,8],[7,1,9],[4,6,2],[3,5,7],[8,2,4]]}' },
  ],
}

export default function PaintHouseIV() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <RecurrenceGrid
    label="Mirror-pair DP table (colors shown 1 to 3)" rowLabels={step.rowLabels} columnLabels={step.columnLabels}
    row={Math.max(0, step.row)} column={Math.max(0, step.column)}
    valueAt={(r, c) => (step.table[r][c] === null ? '–' : step.table[r][c])}
    roleAt={(r, c) => (r === step.row && c === step.column ? 'current' : (step.row > 0 && r === step.row - 1 ? 'source' : ''))} />
  } renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The houses are processed in mirror pairs, so the only constraints between pairs are the two adjacent sides; each pair keeps its two colors distinct.</p>
  </>} />
}
