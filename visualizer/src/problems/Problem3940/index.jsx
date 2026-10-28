import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty answer.' },
    { id: 'keep', label: 'Keep', description: 'This value has fewer than k kept copies, so keep it.' },
    { id: 'drop', label: 'Drop', description: 'This value already has k kept copies, so skip it.' },
    { id: 'done', label: 'Return', description: 'The kept values form the answer in order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"nums": [...sorted], "k": k}',
  url: 'https://leetcode.com/problems/limit-occurrences-in-sorted-array/',
  complexity: 'O(n) time and O(n) extra space for the answer, or O(1) extra space when done in place.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,1,1,2,2,3],"k":2}' },
    { label: 'Example 2', input: '{"nums":[1,2,3],"k":1}' },
  ],
}

export default function LimitOccurrences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Input (sorted)" length={run.input.nums.length} valueAt={j => run.input.nums[j]} active={step.index} />
    <IndexedSequence label="Answer so far" length={step.answer.length} valueAt={j => step.answer[j]} active={step.answer.length - 1} />
    <output aria-label="Step message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Equal values are adjacent in a sorted array, so each value's copies arrive together and the first k are the ones to keep.</p>
    <p>Counting how many copies of the current value were kept is enough to decide each step.</p>
  </>} />
}
