import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import HashMapView from '../../components/shared/HashMapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Remainders', description: 'Prepare to count remainders modulo value.' },
    { id: 'count', label: 'Count', description: 'Add each number to the count for its remainder.' },
    { id: 'use', label: 'Build m', description: 'Spend one number with remainder m mod value.' },
    { id: 'missing', label: 'Missing', description: 'No number is left for this remainder, so m is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers and value as JSON: {"nums": [...], "value": v}',
  url: 'https://leetcode.com/problems/smallest-missing-non-negative-integer-after-operations/',
  complexity: 'O(n + answer) time with a table of at most value entries. The visualization caps input at 20 numbers.',
  question: "Given numbers and a value v, you may add or subtract v from any number any number of times; find the smallest non-negative integer that cannot be formed as a chosen member of the transformed list.",
  approaches: [
    { name: "Remainder buckets and greedy targets", intuition: "Numbers with the same remainder mod v can be shifted into each other, so count each remainder and try targets 0, 1, 2 in order.", time: "O(n + answer)", space: "O(v)" },
    { name: "Sort and sweep", intuition: "Sort the remainders and walk through them to find the first gap that matches the target.", time: "O(n log n)", space: "O(n)" },
  ],
  examples: [
    { label: 'Mixed signs, value 4', input: '{"nums":[-4,12,-7,3,9,-1,5],"value":4}' },
    { label: 'Equal numbers, value 10', input: '{"nums":[10,10,10,10],"value":10}' },
    { label: 'Single negative value', input: '{"nums":[-100],"value":1}' },
    { label: 'Equal values tie', input: '{"nums":[4,4,4,4],"value":4}' },
    { label: 'Alternating extreme values', input: '{"nums":[100,-100,100,-100,100,-100,100,-100,100,-100,100,-100,100,-100,100,-100,100,-100,100,-100],"value":10}' },
    { label: 'Long run: 20 numbers', input: '{"nums":[68,54,93,-77,60,42,-36,-22,-67,34,-98,-24,53,24,-17,37,33,88,79,79],"value":6}' },
  ],
}

export default function SmallestMissingMex() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <p>{`Target m = ${step.target ?? 'not started'}, remainder ${step.target === null ? '-' : step.target % run.input.value} (mod ${run.input.value})`}</p>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} roleAt={i => (step.target !== null && run.input.nums[i] % run.input.value === step.target % run.input.value ? 'group' : '')} />
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Current m">{step.phase === 'missing' ? `Answer: ${step.result}` : `Building m = ${step.target ?? 0}`}</output>
  </>} renderReasoning={() => <>
    <p>Adding or subtracting value keeps a number’s remainder mod value fixed, so the numbers are sorted into remainder groups.</p>
    <p>Building 0, 1, 2, and so on, each target uses one number from its remainder group. The first target whose group is empty is the largest achievable answer.</p>
  </>} />
}
