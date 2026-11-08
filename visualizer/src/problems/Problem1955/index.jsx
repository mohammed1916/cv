import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1955',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of 0, 1 and 2 (e.g. [0,1,2,2])',
  url: 'https://leetcode.com/problems/count-number-of-special-subsequences/',
  complexity: 'O(n) time and O(1) extra space: three running counts, one per stage.',
  examples: [
    { label: 'Two trailing 2s', input: '[0,1,2,2]' },
    { label: 'Mixed', input: '[0,1,2,0,1,2]' },
    { label: 'Single two', input: '[2]' },
    { label: 'All twos', input: '[2,2,2,2,2,2,2,2,2,2,2,2]' },
    { label: 'Long run: twelve values', input: '[2,1,1,0,2,2,1,2,2,0,1,1]' },
  ],
}

export default function Problem1955Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label="Values" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.i} roleAt={i => (i === step.i ? 'l' : '')} />
      <table aria-label="Stage counts" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th>Stage</th><th>Ways ending here</th></tr></thead>
        <tbody>
          <tr><td>0s</td><td>{step.zero}</td></tr>
          <tr><td>0s then 1s</td><td>{step.one}</td></tr>
          <tr><td>0s, 1s, then 2s</td><td>{step.two}</td></tr>
        </tbody>
      </table>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
