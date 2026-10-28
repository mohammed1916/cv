import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty list of letters.' },
    { id: 'letter', label: 'Letter', description: 'Keep each letter in the list.' },
    { id: 'star', label: 'Star', description: 'Remove the smallest letter to the left, rightmost on ties.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s, lowercase letters and stars, for example {"s":"aaba*"}',
  url: 'https://leetcode.com/problems/lexicographically-minimum-string-after-removing-stars/',
  complexity: 'O(n * 26) time with the scan shown. The visualization caps the string at 14 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"aaba*"}' },
    { label: 'Example 2', input: '{"s":"abc"}' },
  ],
}

export default function RemoveStars() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="String" length={run.input.s.length} valueAt={index => run.input.s[index]} active={step.index}
      roleAt={index => {
        if (run.input.s[index] === '*') return 'star'
        if (step.alive[index]) return 'kept'
        return index <= step.index ? 'removed' : ''
      }} />
    <output aria-label="Result so far">{`Result so far: ${step.text || '(empty)'}`}</output>
  </>} renderReasoning={() => <>
    <p>A star removes one letter to its left, so the best choice is always the smallest letter still there.</p>
    <p>On a tie, removing the rightmost copy keeps the earlier, smaller letters in place.</p>
  </>} />
}
