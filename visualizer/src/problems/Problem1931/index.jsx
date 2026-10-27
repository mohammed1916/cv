import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'First column', description: 'Every valid column pattern can be the first column.' },
    { id: 'column', label: 'Next column', description: 'Each pattern sums the earlier patterns that differ from it in every row.' },
    { id: 'done', label: 'Complete', description: 'Sum the ways over all patterns of the last column.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid (JSON object with m rows and n columns)',
  url: 'https://leetcode.com/problems/painting-a-grid-with-three-different-colors/',
  complexity: 'O(n * p^2) time for p = 3 * 2^(m-1) column patterns. The visualization caps the grid at 3 rows and 6 columns.',
  examples: [
    { label: 'One cell', input: '{"m":1,"n":1}' },
    { label: 'Three by three', input: '{"m":3,"n":3}' },
  ],
}

export default function ThreeColourGrid() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="ways[column pattern] (patterns read top to bottom: R, G, B)" values={step.table}
      rowLabels={['ways']} columnLabels={run.labels} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>No two neighbouring cells may share a colour. A column is a pattern of m colours with no vertical repeat.</p>
    <p>Two columns can follow each other only when every row differs, so the count for each pattern is the sum over the compatible patterns before it.</p>
  </>} />
}
