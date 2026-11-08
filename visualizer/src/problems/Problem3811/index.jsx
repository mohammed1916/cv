import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The empty prefix starts the alternation.' },
    { id: 'cut', label: 'Cut', description: 'Count the partitions that end at this position.' },
    { id: 'done', label: 'Complete', description: 'Report the total count modulo 10^9 + 7.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array and targets (JSON object with nums, target1, target2)',
  url: 'https://leetcode.com/problems/number-of-alternating-xor-partitions/',
  complexity: 'O(n^2) time in this visualization, with prefix XOR values. The visualization caps n at 10.',
  examples: [
    { label: 'Five values, two targets', input: '{"nums":[0,3,5,3,9],"target1":3,"target2":9}' },
    { label: 'Two equal values', input: '{"nums":[7,7],"target1":7,"target2":0}' },
    { label: 'One value', input: '{"nums":[0],"target1":0,"target2":1}' },
    { label: 'Equal values', input: '{"nums":[5,5,5],"target1":5,"target2":0}' },
    { label: 'Alternating extremes', input: '{"nums":[15,0,15,0,15,0,15,0,15,0],"target1":15,"target2":0}' },
    { label: 'Long run: 10 values', input: '{"nums":[13,10,5,12,11,11,13,7,2,14],"target1":14,"target2":7}' },
  ],
}

export default function NumberOfAlternatingXorPartitions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      active={step.at > 0 ? step.at - 1 : -1} roleAt={i => (step.at > 0 && i < step.at ? 'prefix' : '')} />
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A block value is the XOR of two prefix values, so each cut is checked in constant time.</p>
  </>} />
}
