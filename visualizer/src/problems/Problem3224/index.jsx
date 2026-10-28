import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Pairs', description: 'Mirrored positions form pairs; each common difference is tried in turn.' },
    { id: 'pair', label: 'Pair cost', description: 'Find the fewest changes this pair needs for the current difference.' },
    { id: 'target', label: 'Target total', description: 'Keep the cheapest total over all differences.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest changes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (even length) and k (JSON)',
  url: 'https://leetcode.com/problems/minimum-array-changes-to-make-differences-equal/',
  complexity: 'O(k * n) time and O(1) extra space. The visualization caps n at 8 and k at 6.',
  examples: [
    { label: 'Example 1', input: '{"nums":[0,1,2,3],"k":3}' },
    { label: 'Example 2', input: '{"nums":[1,0,3,0],"k":3}' },
  ],
}

export default function MinimumArrayChanges() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.nums.length
    const pairRole = i => (step.pair >= 0 && (i === step.pair || i === n - 1 - step.pair) ? 'pair' : '')
    return <>
      <IndexedSequence label="nums" length={n} valueAt={i => run.input.nums[i]} active={step.pair >= 0 ? step.pair : -1} roleAt={pairRole} />
      <output aria-label="Totals">{`Difference ${step.target < 0 ? '-' : step.target}: total ${step.total}, best ${step.best ?? 'none'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Only the gap between each mirrored pair matters, so every pair is judged against one common target difference.</p>
    <p>A pair needs no change when its gap already equals the target, one change when one element can move to create the target gap within 0 to k, and two changes otherwise.</p>
  </>} />
}
