import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers (JSON with nums)',
  url: 'https://leetcode.com/problems/sort-array-by-increasing-frequency/',
  complexity: 'O(n log n) time and O(n) space. The visualization accepts up to 20 values.',
  examples: [
    { label: 'Mixed counts', input: '{"nums":[4,1,1,7,4,9,9,9,2]}' },
    { label: 'One value', input: '{"nums":[5,5,5]}' },
    { label: 'Negatives', input: '{"nums":[-2,3,-2,3,0]}' },
  ],
}

export default function SortByIncreasingFrequency() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Input" length={run.input.nums.length} valueAt={i => run.input.nums[i]} />
    <StackLane title="Count pairs (value:count)" items={(step.keys?.length ? step.keys : step.tally).map(t => `${t.value}:${t.count}`)} />
    <StackLane title="Placed so far" items={step.placed.map(String)} />
  </>} renderReasoning={({ step }) => <>
    <p>Counting first turns each value into a single key. Sorting keys by count, then by value descending, decides the order of whole groups.</p>
    <p>Repeated values stay together because every copy shares the same key.</p>
  </>} />
}
