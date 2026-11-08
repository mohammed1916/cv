import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no score.' },
    { id: 'start-cut', label: 'Start cut', description: 'Rotate the cycle so a cut is at the start, then split the line.' },
    { id: 'done', label: 'Complete', description: 'Report the best score over all starts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums and k, for example {"nums":[1,2,3,3],"k":2}',
  url: 'https://leetcode.com/problems/maximize-cyclic-partition-score/',
  complexity: 'O(n^4) time for the dynamic programme over n starts. The visualization caps the array at 8 values.',
  examples: [
    { label: 'Four values, k two', input: '{"nums":[2,7,1,8],"k":2}' },
    { label: 'Largest value alone', input: '{"nums":[1000000000],"k":1}' },
    { label: "Single value", input: "{\"nums\":[7],\"k\":1}" },
    { label: "Equal values", input: "{\"nums\":[5,5,5,5],\"k\":2}" },
    { label: "Largest values at the limit", input: "{\"nums\":[1000000000,999999999,1000000000,1,1000000000,1000000000,1,1000000000],\"k\":5}" },
    { label: "Long run: 8 values", input: "{\"nums\":[11520524,13132533,11452080,3693077,16228269,5093278,12001376,13431363],\"k\":4}" },
  ],
}

export default function CyclicPartitionScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.start} />
    <output aria-label="Best">{`Start: ${step.start < 0 ? '-' : step.start}. Best score so far: ${step.best}. At most ${run.input.k} arcs.`}</output>
  </>} renderReasoning={() => <>
    <p>On a circle, an arc may wrap around. Any partition has a cut, so rotating the array to begin right after that cut turns it into a line.</p>
    <p>On each line, a dynamic programme chooses at most k pieces that maximize the sum of their ranges.</p>
  </>} />
}
