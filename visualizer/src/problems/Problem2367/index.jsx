import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Build set', description: 'Put every value in a hash set.' },
    { id: 'check', label: 'Check values', description: 'Look up the two values above x at the fixed difference.' },
    { id: 'match', label: 'Triplet', description: 'Both values exist, so count this triplet.' },
    { id: 'done', label: 'Count', description: 'Report the number of triplets.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers and difference as JSON: {"nums": [...], "diff": d}',
  url: 'https://leetcode.com/problems/number-of-arithmetic-triplets/',
  complexity: 'O(n) time and O(n) space with a hash set. The visualization caps input at 20 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[0,1,4,6,7,10],"diff":3}' },
    { label: 'Example 2', input: '{"nums":[4,5,6,7,8,9],"diff":2}' },
  ],
}

export default function ArithmeticTriplets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index ?? -1} />
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Triplets so far">{`Triplets so far: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Because the values are strictly increasing, each value can only be the first, middle, or last of a triplet with a given difference. Checking the two values above each x is enough.</p>
    <p>The set answers both membership questions in constant time, so the whole count is linear.</p>
  </>} />
}
