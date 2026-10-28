import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty answer.' },
    { id: 'copy', label: 'Copy', description: 'Copy nums in order into the first half.' },
    { id: 'reverse', label: 'Reverse', description: 'Append nums from last to first.' },
    { id: 'done', label: 'Return', description: 'The answer has twice the length.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"nums": [...]}',
  url: 'https://leetcode.com/problems/concatenate-array-with-reverse/',
  complexity: 'O(n) time for the output of length 2n.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3]}' },
    { label: 'Example 2', input: '{"nums":[1]}' },
  ],
}

export default function ConcatenateWithReverse() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={j => run.input.nums[j]} active={step.index} />
    <IndexedSequence label="Answer so far" length={step.ans.length} valueAt={j => step.ans[j]} active={step.ans.length - 1} />
    <output aria-label="Step message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The first n answers copy nums, and the next n answers read nums backward.</p>
    <p>A single pass for the copy and a single pass backward for the reverse build the whole answer in linear time.</p>
  </>} />
}
