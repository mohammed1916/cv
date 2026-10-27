import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Tally how many times each value appears.' },
    { id: 'fold', label: 'Fold twice', description: 'Xor a value in only when it appears exactly twice.' },
    { id: 'skip', label: 'Skip', description: 'Values seen once or three times do not count.' },
    { id: 'done', label: 'Complete', description: 'Report the xor.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (values 1 to 50), for example {"nums":[1,2,1,3]}',
  url: 'https://leetcode.com/problems/find-the-xor-of-numbers-which-appear-twice/',
  complexity: 'O(n) time and O(n) space for the counts.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,1,3]}' },
    { label: 'Example 2', input: '{"nums":[1,2,2,1]}' },
  ],
}

export default function XorOfTwice() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} roleAt={i => (run.input.nums[i] === step.value ? (step.phase === 'fold' ? 'xored' : 'checked') : '')} />
    <table aria-label="Counts">
      <thead><tr><th>value</th><th>count</th></tr></thead>
      <tbody>{Object.entries(step.counts).map(([value, count]) => <tr key={value} data-current={Number(value) === step.value ? 'true' : undefined}><td>{value}</td><td>{count}</td></tr>)}</tbody>
    </table>
    <output aria-label="Result">{`Result so far: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Xor cancels equal pairs, so a value seen twice would cancel to nothing if it were xored in twice. Instead the algorithm xors each qualifying value once, after its count is known.</p>
    <p>Values appearing once or three times are left out, which is the rule of the problem.</p>
  </>} />
}
