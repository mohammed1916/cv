import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Sort nums1.' },
    { id: 'sort', label: 'Order opponents', description: 'Sort nums2 indices by value.' },
    { id: 'compare', label: 'Compare', description: 'Current card against the weakest remaining opponent.' },
    { id: 'win', label: 'Win', description: 'Assign the card to beat the weakest opponent.' },
    { id: 'sacrifice', label: 'Sacrifice', description: 'Waste the card on the strongest opponent.' },
    { id: 'done', label: 'Complete', description: 'Permutation built.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object {nums1, nums2} (JSON, up to 30 elements)',
  url: 'https://leetcode.com/problems/advantage-shuffle/',
  complexity: 'O(n log n) for the sorts, O(n) for the single sweep.',
  examples: [
    { label: 'Official example 1', input: '{"nums1":[2,7,11,15],"nums2":[1,10,4,11]}' },
    { label: 'Official example 2', input: '{"nums1":[12,24,8,32],"nums2":[13,25,32,11]}' },
    { label: 'No advantage possible', input: '{"nums1":[1,1,1],"nums2":[5,6,7]}' },
  ],
}

export default function AdvantageShuffle() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums2 } = run.input
    const n = nums2.length
    return <>
      <IndexedSequence label="nums1 sorted (our cards)" length={n} active={step.i} valueAt={i => run.sorted[i]} roleAt={i => i < step.i ? 'written' : ''} />
      <IndexedSequence label="nums2 by ascending value (opponents; lo/hi are the open ends)" length={n} active={-1} valueAt={i => nums2[run.order[i]]}
        roleAt={i => i < step.lo ? 'written' : i > step.hi ? 'shifted' : i === step.lo ? 'left' : i === step.hi ? 'right' : ''} />
      <IndexedSequence label="Result (by nums2 position)" length={n} active={step.target ?? -1} valueAt={i => step.res[i] === null ? '·' : step.res[i]} roleAt={i => nums2[i] < (step.res[i] ?? -1) ? 'written' : ''} />
      <output aria-label="Pointers">lo = {step.lo}, hi = {step.hi}</output>
    </>
  }} renderReasoning={() => <>
    <p><strong>Greedy:</strong> if our smallest unused card beats the weakest remaining opponent, use it there: a bigger card would not gain more, and this is the cheapest win.</p>
    <p><strong>Sacrifice:</strong> if our smallest card cannot beat even the weakest opponent, it can never win, so we spend it on the strongest opponent whose loss costs us nothing.</p>
  </>} />
}
