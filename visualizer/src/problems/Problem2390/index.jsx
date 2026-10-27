import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty stack.' },
    { id: 'letter', label: 'Push letter', description: 'A letter goes on top of the stack.' },
    { id: 'star', label: 'Star', description: 'A star removes the letter on top.' },
    { id: 'done', label: 'Complete', description: 'Report what remains on the stack.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with string s of letters and stars (JSON)',
  url: 'https://leetcode.com/problems/removing-stars-from-a-string/',
  complexity: 'O(n) time and O(n) space.',
  examples: [
    { label: 'Example 1', input: '{"s":"leet**cod*e"}' },
    { label: 'Example 2', input: '{"s":"erase*****"}' },
  ],
}

export default function RemovingStars() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.i} roleAt={i => (i < step.i ? 'seen' : '')} />
    <IndexedSequence label="Stack" length={step.stack.length} valueAt={i => step.stack[i]} active={step.stack.length - 1} />
  </>} renderReasoning={() => <>
    <p>A star always deletes the closest letter that is still present to its left, which is exactly the top of a stack.</p>
  </>} />
}
