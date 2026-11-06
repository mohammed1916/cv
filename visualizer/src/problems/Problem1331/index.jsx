import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1331',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (JSON)',
  url: 'https://leetcode.com/problems/rank-transform-of-an-array/',
  complexity: 'O(n log n) time for sorting the distinct values, and O(n) space for the rank table.',
  examples: [
    { label: 'Distinct', input: '[4,10,20,3]' },
    { label: 'Repeats', input: '[5,5,-3,5,0]' },
    { label: 'Mixed', input: '[7,-1,7,2]' },
  ],
}

const cell = { padding: '12px', fontFamily: 'monospace', textAlign: 'center', color: 'var(--text)', border: '1px solid var(--border)', background: 'var(--surface2)' }

export default function RankTransform() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { ordered, pairs, current, output } = step.snapshot
    return <>
      <IndexedSequence label="Input array (highlighted: value being ranked)" length={run.input.arr.length} valueAt={i => run.input.arr[i]} active={current === null || current === undefined ? -1 : run.input.arr.indexOf(current)} roleAt={i => (run.input.arr[i] === current ? 'value' : '')} />
      <table aria-label="Rank table" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th style={cell}>distinct value</th><th style={cell}>rank</th></tr></thead>
        <tbody>
          {ordered.map(v => {
            const pair = pairs.find(p => p.value === v)
            return <tr key={v} style={{ background: v === current ? 'color-mix(in srgb, var(--primary) 18%, var(--surface2))' : undefined }}>
              <td style={cell}>{v}</td><td style={cell}>{pair ? pair.rank : '·'}</td>
            </tr>
          })}
        </tbody>
      </table>
      <p>{output ? `Output so far: [${output.join(', ')}]` : 'Ranks are assigned before any output is produced.'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Distinct first:</strong> equal values need the same rank, so only the sorted distinct values receive numbers.</p>
    <p><strong>Then map:</strong> a lookup table turns each original value into its rank in one step.</p>
  </>} />
}
