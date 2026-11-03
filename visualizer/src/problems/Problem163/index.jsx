import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers, lower and upper (JSON)',
  url: 'https://leetcode.com/problems/missing-ranges/',
  complexity: 'O(n) time, where n is the number of given numbers. The visualization accepts up to 20 numbers.',
  examples: [
    { label: 'Gaps', input: '{"nums":[2,3,7,10],"lower":0,"upper":12}' },
    { label: 'Empty', input: '{"nums":[],"lower":-3,"upper":2}' },
    { label: 'Edges', input: '{"nums":[-1,0,5],"lower":-2,"upper":6}' },
  ],
}

export default function MissingRanges() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index} />
    <StackLane title="Missing ranges" items={step.ranges.map(r => (r[0] === r[1] ? `${r[0]}` : `${r[0]}..${r[1]}`))} note={`expected ${step.expected}`} />
  </>} renderReasoning={({ step }) => <>
    <p>The scan only tracks the next value that has not been covered. Each number either matches it, or leaves a gap ending just before the number.</p>
    <p>The final gap is checked after the last number, so an empty list still produces one range covering the whole interval.</p>
  </>} />
}
