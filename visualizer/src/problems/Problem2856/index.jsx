import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty tally of values.' },
    { id: 'count', label: 'Count', description: 'Tally how often each value appears.' },
    { id: 'excess', label: 'Dominant value', description: 'One value has more copies than the other slots, so some copies must remain.' },
    { id: 'balanced', label: 'Balanced', description: 'No value dominates, so only the parity of the length remains.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a sorted nums array (JSON)',
  url: 'https://leetcode.com/problems/minimum-array-length-after-pair-removals/',
  complexity: 'O(n) time and O(n) space for the tally. The visualization caps input at 30 values.',
  examples: [
    { label: 'Balanced', input: '{"nums":[1,3,4,9]}' },
    { label: 'Dominant', input: '{"nums":[1,1,1,1,2,3]}' },
  ],
}

export default function MinimumPairRemovals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted values" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      roleAt={i => (run.input.nums[i] === step.value ? 'counting' : '')} />
    <output aria-label="Tally">{`Tally: ${Object.entries(step.counts).map(([v, c]) => `${v}×${c}`).join(', ') || 'empty'}; largest count ${step.most}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A pair removal needs a smaller value before a larger one. If one value fills more than half the array, each of its copies can only pair with a different value, so the surplus remains.</p>
  </>} />
}
