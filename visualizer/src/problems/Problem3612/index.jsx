import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty string.' },
    { id: 'add', label: 'Letter', description: 'Append the letter.' },
    { id: 'remove', label: 'Star', description: 'Remove the last character if there is one.' },
    { id: 'copy', label: 'Hash', description: 'Append a copy of the string to itself.' },
    { id: 'reverse', label: 'Percent', description: 'Reverse the string.' },
    { id: 'done', label: 'Complete', description: 'Report the processed string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s (letters, *, # and %)',
  url: 'https://leetcode.com/problems/process-string-with-special-operations-i/',
  complexity: 'O(length) per operation. The visualization caps the final string at 5000 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"a#b%*"}' },
    { label: 'Example 2', input: '{"s":"z*#"}' },
  ],
}

export default function SpecialOperationsI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Current string" length={step.text.length} valueAt={i => step.text[i]} active={step.index} />
    <output aria-label="Current string text">{`Current: ${step.text || '(empty)'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each character of s is one operation applied to the result so far, in order.</p>
  </>} />
}
