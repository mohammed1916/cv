import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a best difference of zero.' },
    { id: 'pair', label: 'Neighbour pair', description: 'Compare each element with the next one, wrapping from the last to the first.' },
    { id: 'better', label: 'New best', description: 'This absolute difference is the largest so far.' },
    { id: 'done', label: 'Complete', description: 'Report the largest adjacent difference.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (2 to 12 integers from -100 to 100)',
  url: 'https://leetcode.com/problems/maximum-difference-between-adjacent-elements-in-a-circular-array/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,4]}' },
    { label: 'Example 2', input: '{"nums":[-5,-10,-5]}' },
  ],
}

export default function MaxAdjacentDifference() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const pair = step.at === null ? [] : [step.at, step.next]
    return <>
      <IndexedSequence label="Circular array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at ?? -1}
        roleAt={i => (pair.includes(i) ? 'pair' : '')} />
      <output aria-label="Best difference">{`Best difference so far: ${step.best}${step.gap !== null ? `, this pair: ${step.gap}` : ''}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The array is circular, so the last element has a neighbour too: the first element.</p>
    <p>Taking the absolute difference of every neighbour pair, with the index wrapping, covers all adjacent pairs exactly once.</p>
  </>} />
}
