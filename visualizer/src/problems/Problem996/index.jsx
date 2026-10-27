import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort the values so repeats sit next to each other.' },
    { id: 'place', label: 'Place', description: 'The new value keeps the adjacent sum a perfect square.' },
    { id: 'reject', label: 'Reject', description: 'The adjacent sum is not a perfect square, so skip this value.' },
    { id: 'duplicate', label: 'Repeat', description: 'An equal value was already tried at this position.' },
    { id: 'complete', label: 'Count', description: 'A full arrangement is squareful; add one to the count.' },
    { id: 'done', label: 'Return', description: 'Report the number of distinct squareful arrangements.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Integers from 0 to 20 (JSON): {"nums": [...]}',
  url: 'https://leetcode.com/problems/number-of-squareful-arrays/',
  complexity: 'Worst case O(n!) time for backtracking over at most 8 values; duplicate skipping prunes equal values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,17,8]}' },
    { label: 'Example 2', input: '{"nums":[2,2,2]}' },
  ],
}

export default function NumberOfSquarefulArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const sorted = [...run.input.nums].sort((a, b) => a - b)
    return <>
      <IndexedSequence label="Sorted values (used marks a placed value)" length={sorted.length} valueAt={j => sorted[j]} active={step.index ?? -1}
        roleAt={j => step.used[j] ? 'used' : ''} />
      <StackLane title="Arrangement so far" items={step.sequence.map(String)} note={`${step.sequence.length} of ${sorted.length}`} />
      <output aria-label="Squareful count">{`Squareful arrangements found: ${step.count}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each step appends one value and checks only the adjacent pair, so a failing pair prunes the whole branch below it.</p>
    <p>Sorting puts equal values together; at each position, trying a repeated value only once keeps the same arrangement from being counted twice.</p>
  </>} />
}
