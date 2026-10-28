import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Start with an empty set of values that are far enough behind.' },
    { id: 'scan', label: 'Scan', description: 'Add the value x positions back, then check the current value against its neighbours.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest gap found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"nums": [...], "x": distance}',
  url: 'https://leetcode.com/problems/minimum-absolute-difference-between-elements-with-constraint/',
  complexity: 'Sorted-set insertions and binary searches: O(n log n). The visualization caps input at 8 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,3,2,4],"x":2}' },
    { label: 'Example 2', input: '{"nums":[5,3,2,10,15],"x":1}' },
  ],
}

export default function MinimumAbsoluteDifferenceConstraint() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.j ?? -1} />
    <IndexedSequence label="Eligible values (sorted)" length={step.seen.length} valueAt={i => step.seen[i]} />
    <output aria-label="Best">{`Best gap so far: ${step.best ?? '-'}`}</output>
  </>} renderReasoning={() => <>
    <p>Only values at least x positions behind the current index are eligible partners, and they are added as the scan moves right.</p>
    <p>In a sorted set, the closest value to the current number is one of its two neighbours, so two checks per index are enough.</p>
  </>} />
}
