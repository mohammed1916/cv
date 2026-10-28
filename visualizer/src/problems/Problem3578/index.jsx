import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'The empty prefix has one partition.' },
    { id: 'start-of-part', label: 'Valid part', description: 'Add the partitions that end with this part.' },
    { id: 'stop', label: 'Gap too big', description: 'Longer parts to the left are also invalid.' },
    { id: 'done', label: 'Complete', description: 'Report the partitions of the whole array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers from 1 to 20) and k (0 to 20)',
  url: 'https://leetcode.com/problems/count-partitions-with-max-min-difference-at-most-k/',
  complexity: 'O(n^2) time for the direct scan and O(n) space. The visualization caps input at 12 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[9,4,1,3,7],"k":4}' },
    { label: 'k = 0', input: '{"nums":[1,2,3,4],"k":0}' },
  ],
}

export default function PartitionsMaxMin() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.j ?? -1} />
    <IndexedSequence label="Partitions of each prefix (index i covers the first i numbers)" length={step.ways.length} valueAt={index => step.ways[index]} active={step.i} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The last part of a partition of the first i numbers starts at some j, and it is valid only when max minus min is at most k.</p>
    <p>Moving j to the left only widens the part, so the scan can stop at the first invalid start.</p>
  </>} />
}
