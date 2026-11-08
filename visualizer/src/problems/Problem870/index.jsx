import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Sort nums1.' },
    { id: 'sort', label: 'Order opponents', description: 'Sort nums2 indices by value.' },
    { id: 'compare', label: 'Compare', description: 'Current card against the weakest remaining opponent.' },
    { id: 'win', label: 'Win', description: 'Assign the card to beat the weakest opponent.' },
    { id: 'sacrifice', label: 'Sacrifice', description: 'Waste the card on the strongest opponent.' },
    { id: 'done', label: 'Complete', description: 'Permutation built.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object {nums1, nums2} (JSON, up to 30 elements)',
  url: 'https://leetcode.com/problems/advantage-shuffle/',
  complexity: 'O(n log n) for the sorts, O(n) for the single sweep.',
  examples: [
    { label: 'Official example 1', input: '{"nums1":[2,7,11,15],"nums2":[1,10,4,11]}' },
    { label: 'Official example 2', input: '{"nums1":[12,24,8,32],"nums2":[13,25,32,11]}' },
    { label: 'No advantage possible', input: '{"nums1":[1,1,1],"nums2":[5,6,7]}' },
    { label: 'Single element', input: '{"nums1":[5],"nums2":[3]}' },
    { label: 'Equal values use the smaller index', input: '{"nums1":[4,4,9],"nums2":[2,2,5]}' },
    { label: 'Largest values', input: '{"nums1":[1000000000,0],"nums2":[0,1000000000]}' },
    { label: 'Long run: 30 cards', input: '{"nums1":[51,92,44,60,65,83,65,72,48,58,71,95,41,52,96,18,47,40,56,24,73,35,17,39,4,66,34,81,58,30],"nums2":[60,13,90,54,5,64,69,71,4,24,3,64,27,33,66,90,49,58,27,42,9,26,24,33,77,44,17,18,60,95]}' },
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
