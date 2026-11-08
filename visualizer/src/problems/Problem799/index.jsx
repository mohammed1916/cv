import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Top glass', description: 'All champagne starts in the top glass.' },
    { id: 'row', label: 'Spill', description: 'Each full glass sends its overflow to the two below.' },
    { id: 'done', label: 'Read glass', description: 'A glass holds at most one full unit.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'poured, query_row and query_glass (JSON object)',
  url: 'https://leetcode.com/problems/champagne-tower/',
  complexity: 'O(query_row^2) time and O(query_row) extra space per row.',
  examples: [
    { label: 'Two units', input: '{"poured":2,"query_row":1,"query_glass":0}' },
    { label: 'Deep', input: '{"poured":6,"query_row":3,"query_glass":1}' }, { label: 'Nothing poured', input: '{"poured":0,"query_row":0,"query_glass":0}' }, { label: 'Equal split at row 1', input: '{"poured":3,"query_row":1,"query_glass":1}' }, { label: 'Edge glass of row 99', input: '{"poured":100000,"query_row":99,"query_glass":0}' }, { label: 'Long run: middle glass of row 99', input: '{"poured":100000,"query_row":99,"query_glass":50}' },
  ],
}

export default function ChampagneTower() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const width = step.rows[step.rows.length - 1].length
    const pad = step.rows.map(r => [...r, ...Array(width - r.length).fill(0)])
    return <>
      <MatrixGrid label="Champagne in each glass (triangle, row by row)" matrix={pad.map(r => r.map(v => Number(v.toFixed(3))))} cellWidth={56} />
      <output aria-label="Step">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Glasses fill from the top. Anything above a full glass spills equally to the two glasses directly below it, so the flow is a simple top-down simulation.</p>
    <p>Each glass is capped at one unit when it is read, which is why the answer is the minimum of the amount and 1.</p>
  </>} />
}
