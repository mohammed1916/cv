import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1558',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (JSON)',
  url: 'https://leetcode.com/problems/minimum-numbers-of-function-calls-to-make-target-array/',
  complexity: 'O(n log M) time and O(1) extra space, where M is the largest value: count bits per element, then take the bit length of the maximum.',
  examples: [
    { label: 'Mixed values', input: '{"nums":[3,5,1]}' },
    { label: 'Equal powers', input: '{"nums":[8,8]}' },
    { label: 'All zero', input: '{"nums":[0,0,0]}' },
    { label: 'Single value', input: '{"nums":[7]}' },
    { label: 'Four equal values', input: '{"nums":[6,6,6,6]}' },
    { label: 'Largest: 12 values', input: '{"nums":[60,1,60,1,60,1,60,1,60,1,60,1]}' },
    { label: 'Long run: 12 values', input: '{"nums":[50,31,58,4,49,3,0,58,26,26,3,36]}' },
  ],
}

export default function MinimumOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { values } = step.snapshot
    const { index, binary, ones, total, doublings } = step.snapshot
    return <>
      <table aria-label="Binary form of each element" style={{ fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <thead><tr><th>value</th><th>binary</th><th>set bits</th></tr></thead>
        <tbody>{values.map((value, i) => <tr key={i} data-element={i} style={{
          background: i === index ? 'var(--surface2)' : 'transparent',
        }}><td>{value}</td><td>{binary[i]}</td><td>{i <= index ? ones[i] : '-'}</td></tr>)}</tbody>
      </table>
      <p>Increments so far: <strong>{total}</strong></p>
      <p>Global doublings: <strong>{doublings ?? 'not yet known'}</strong></p>
      <p>{run.input.nums.length} elements in the target.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Two kinds of move:</strong> adding one to a single element costs one step for each set bit; doubling every element at once costs one step no matter how many elements there are.</p>
    <p><strong>Why the largest value decides doublings:</strong> doubling shifts every bit left, so the largest value needs the most shifts. Each shift is one doubling, and the increments can be placed between them.</p>
  </>} />
}
