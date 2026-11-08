import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Sort a copy of the numbers.' },
    { id: 'step', label: 'Two pointers', description: 'Compare the sum at the two pointers with the limit.' },
    { id: 'done', label: 'Complete', description: 'Report the number of fair pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, lower and upper (JSON)',
  url: 'https://leetcode.com/problems/count-the-number-of-fair-pairs/',
  complexity: 'O(n log n) time for the sort and O(n) for each two-pointer pass.',
  examples: [
    { label: 'Own case 1', input: '{"nums":[1,2,8,5,5,6],"lower":4,"upper":7}' },
    { label: 'Own case 2', input: '{"nums":[2,8,10,3,6],"lower":12,"upper":12}' },
    { label: 'Single zero', input: '{"nums":[0],"lower":0,"upper":0}' },
    { label: 'Equal values in a point range', input: '{"nums":[2,2,2,2],"lower":2,"upper":2}' },
    { label: 'Widest range over 30 values', input: '{"nums":[-20,20,-20,20,-20,20,-20,20,-20,20,-20,20,-20,20,-20,20,-20,20,-20,20,-20,20,-20,20,-20,20,-20,20,-20,20],"lower":-40,"upper":40}' },
    { label: 'Long run: 30 values', input: '{"nums":[-5,-16,14,0,-10,-11,5,8,-12,-6,6,-1,-14,-19,0,17,-9,-17,-20,13,-1,-14,-4,-7,-19,-9,6,13,2,1],"lower":-10,"upper":10}' },
  ],
}

export default function FairPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted numbers" length={run.input.nums.length} active={step.i}
      valueAt={index => step.sorted[index]}
      roleAt={index => (index === step.j ? 'right pointer' : '')} />
    <output aria-label="Pointer state">{step.sum === null ? `Sorted; target range ${run.input.lower} to ${run.input.upper}` : `${step.pass} pass: sum ${step.sum} against ${step.limit}, count ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>Pairs with sum in the range are those with sum at most upper, minus those with sum at most lower minus one.</p>
    <p>On sorted values, one pointer pair counts every fitting pair in linear time.</p>
  </>} />
}
