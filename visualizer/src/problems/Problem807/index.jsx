import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PagedGrid from '../../components/shared/PagedGrid'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read the city grid.' },
    { id: 'rows', label: 'Row maxima', description: 'Skyline seen from east and west.' },
    { id: 'cols', label: 'Column maxima', description: 'Skyline seen from north and south.' },
    { id: 'cell', label: 'Raise building', description: 'Raise to min(row max, column max).' },
    { id: 'done', label: 'Complete', description: 'Return the total height added.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Square grid (JSON)',
  url: 'https://leetcode.com/problems/max-increase-to-keep-city-skyline/',
  complexity: 'O(n^2) time, O(n) extra space.',
  examples: [
    { label: 'Example 1', input: '[[3,0,8,4],[2,4,5,7],[9,2,6,3],[0,3,1,0]]' },
    { label: 'Flat city', input: '[[0,0,0],[0,0,0],[0,0,0]]' },
    { label: 'Single building', input: '[[5]]' },
  ],
}
export default function MaxIncreaseSkyline() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <PagedGrid label="City heights" rows={run.input.length} columns={run.input.length} cellAt={(r, c) => {
      const current = step.cell && step.cell[0] === r && step.cell[1] === c, cap = step.raised[r][c]
      const label = current ? 'raising' : cap === null ? 'pending' : `raised to ${cap}`
      return { value: cap === null ? run.input[r][c] : cap, label, role: current ? 'active' : cap !== null ? 'done' : '', detail: `original ${run.input[r][c]}; ${label}` }
    }} />
    {step.rowMax && <IndexedSequence label="Row maxima" length={step.rowMax.length} active={step.cell ? step.cell[0] : -1} valueAt={i => step.rowMax[i]} />}
    {step.colMax && <IndexedSequence label="Column maxima" length={step.colMax.length} active={step.cell ? step.cell[1] : -1} valueAt={i => step.colMax[i]} />}
    <output aria-label="Total increase">Total added: {step.total}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why min:</strong> a building must stay no taller than its row skyline and no taller than its column skyline, and the two bounds are independent, so the tightest is the smaller one. Raising every building to its cap never lifts either maximum.</p>
  </>} />
}
