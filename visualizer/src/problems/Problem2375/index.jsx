import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'Begin with an empty answer and stack.' },
    { id: 'push', label: 'Push', description: 'Push the next digit onto the stack.' },
    { id: 'flush', label: 'Flush', description: 'At an I or the end, pop the stack into the answer.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest number.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'A JSON string of I and D, for example "IIIDIDDD"',
  url: 'https://leetcode.com/problems/construct-smallest-number-from-di-string/',
  complexity: 'O(n) time and O(n) space. The visualization caps the pattern at 8 characters.',
  examples: [
    { label: 'Example 1', input: '"IIIDIDDD"' },
    { label: 'All decreasing', input: '"DDD"' },
  ],
}

export default function SmallestFromDI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Stack of digits" length={step.stack.length} valueAt={index => step.stack[index]} active={step.stack.length - 1} />
    <output aria-label="Answer so far">{`Answer so far: ${step.result || '(empty)'}`}</output>
  </>} renderReasoning={() => <>
    <p>An I means the next digit must be larger, so every digit waiting on the stack can be released now in reverse order.</p>
    <p>A D means the next digit must be smaller, so the current digit waits on the stack and is released later, reversed.</p>
  </>} />
}
