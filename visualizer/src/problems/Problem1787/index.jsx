import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Classes', description: 'Each index class modulo k must share one value.' },
    { id: 'group', label: 'Fold class', description: 'Add one class to the xor table, keeping the cheapest cost per xor.' },
    { id: 'done', label: 'Complete', description: 'Report the cost that reaches xor 0.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k, for example {"nums":[1,2,0,3,0],"k":1}',
  url: 'https://leetcode.com/problems/make-the-xor-of-all-segments-equal-to-zero/',
  complexity: 'O(n * k * V) time with V = 8 xor states in this visualization; the full problem uses bits up to 2^10.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,0,3,0],"k":1}' },
    { label: 'Example 2', input: '{"nums":[3,4,5,2,1,7,3,4,7],"k":3}' },
  ],
}

export default function ZeroXorSegments() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} roleAt={i => `class ${i % run.input.k}`} />
    <table aria-label="Cheapest cost for each xor">
      <thead><tr><th>xor</th>{step.best.map((_, x) => <th key={x}>{x}</th>)}</tr></thead>
      <tbody><tr><th>cost</th>{step.best.map((cost, x) => <td key={x}>{cost === Infinity ? '-' : cost}</td>)}</tr></tbody>
    </table>
  </>} renderReasoning={() => <>
    <p>Every window of length k has the same xor as the window before it when the value leaving equals the value entering, so each index class modulo k must hold a single value.</p>
    <p>Each class picks one replacement value; the table tracks the cheapest total cost for every xor so far, and the answer is the cost of xor 0.</p>
  </>} />
}
