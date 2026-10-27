import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Record the last position of every letter.' },
    { id: 'scan', label: 'Next letter', description: 'Take the next letter from left to right.' },
    { id: 'skip', label: 'Skip repeat', description: 'A letter already in the stack is not added again.' },
    { id: 'pop', label: 'Pop', description: 'Remove a larger letter that appears again later.' },
    { id: 'push', label: 'Push', description: 'Add the letter to the top of the stack.' },
    { id: 'done', label: 'Complete', description: 'Report the stack as the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s: lowercase letters, e.g. {"s":"bcabc"}',
  url: 'https://leetcode.com/problems/smallest-subsequence-of-distinct-characters/',
  complexity: 'O(n) time and O(1) extra space for at most 26 letters. The visualization caps input at 40 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"bcabc"}' },
    { label: 'Example 2', input: '{"s":"cbacdcbc"}' },
  ],
}

export default function SmallestSubsequenceDistinct() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s } = run.input
    const roleOf = index => {
      if (index === step.index && step.phase === 'skip') return 'skipped'
      if (step.stack.length && index >= 0 && s.indexOf(step.stack[step.stack.length - 1]) === index) return 'top'
      return ''
    }
    return <>
      <IndexedSequence label="Letters of s" length={s.length} valueAt={i => s[i]} active={step.index >= 0 ? step.index : -1} roleAt={roleOf} />
      <output aria-label="Stack">{`Stack: ${step.stack.join('') || '(empty)'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A letter is dropped when a copy of it is already kept. A larger letter on the stack is popped only if it appears again later, so no letter is lost.</p>
    <p>Popping only when a later copy exists keeps every letter exactly once while the stack stays as small as possible in order.</p>
  </>} />
}
