import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ColumnChainView from './ColumnChainView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3989',
  phases: [
    { id: 'start', label: 'Setup', description: 'Read the grid and the limit.' },
    { id: 'column', label: 'Column', description: 'Start a chain at this column.' },
    { id: 'pair', label: 'Pair test', description: 'Test an earlier column against this one row by row.' },
    { id: 'record', label: 'Record', description: 'Keep the longest chain seen so far.' },
    { id: 'done', label: 'Result', description: 'Report the longest kept chain.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grid and limit (e.g. {"grid":[[1,5,9,2],[2,4,8,3]],"limit":2})',
  url: 'https://leetcode.com/problems/maximum-consistent-columns-in-a-grid/',
  complexity: 'O(c^2 * r) time and O(c) extra space for r rows and c columns. The visualization caps the grid at 5 by 8.',
  examples: [
    { label: 'Chain of two', input: '{"grid":[[1,5,9,2],[2,4,8,3]],"limit":2}' },
    { label: 'Everything fits', input: '{"grid":[[3,3,3],[0,1,2]],"limit":3}' },
  ],
}

export default function MaximumConsistentColumns() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <ColumnChainView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>A column pair is tested across every row; the chain length at each column builds on the best compatible earlier column.</p>
    </>} />
}
