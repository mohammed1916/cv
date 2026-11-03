import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Values (JSON object with nums)',
  url: 'https://leetcode.com/problems/number-of-valid-subarrays/',
  complexity: 'O(n) time and O(n) stack space. The visualization caps input at 40 values.',
  examples: [
    { label: 'Closing starts', input: '{"nums":[3,6,4,7,2,5,5,1]}' },
    { label: 'Equal values', input: '{"nums":[8,8,8,8]}' },
    { label: 'Decreasing', input: '{"nums":[9,7,5,3]}' },
    { label: 'Increasing', input: '{"nums":[1,4,6,10]}' },
  ],
}

export default function NumberOfValidSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums, right, stack, total, closed } = step.snapshot
    const openSet = new Set(stack)
    return <>
      <IndexedSequence label="Values" length={nums.length} valueAt={i => nums[i]} active={right >= 0 && right < nums.length ? right : -1}
        roleAt={i => (i === right ? 'right' : openSet.has(i) ? 'open' : '')} />
      <StackLane title="Open starts" items={stack.map(i => `${i}:${nums[i]}`)} note={`total ${total}`} />
      <p>Closed starts: {closed.length ? closed.map(c => `${c.start} (+${c.count})`).join(', ') : 'none yet'}.</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each open start is a position whose subarrays are still valid. A smaller value closes the starts above it, and each closed start contributes the number of right ends it covered. Equal values do not close a start.</p>
  </>} />
}
