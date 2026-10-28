import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Scan', description: 'Look for the first letter that is not a.' },
    { id: 'find', label: 'Start', description: 'Fix the start of the substring.' },
    { id: 'extend', label: 'Extend', description: 'Extend the substring while letters are not a.' },
    { id: 'shift', label: 'Shift', description: 'Shift every letter in the substring back one.' },
    { id: 'wrap', label: 'Wrap', description: 'Every letter is a, so the last one wraps to z.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Lowercase string of 1 to 20 letters (JSON string)',
  url: 'https://leetcode.com/problems/lexicographically-smallest-string-after-substring-operation/',
  complexity: 'O(n) time and O(n) space for the output. The visualization caps input at 20 letters.',
  examples: [
    { label: 'Example 1', input: '"cbabc"' },
    { label: 'Example 2', input: '"acbbc"' },
  ],
}

export default function SmallestAfterShift() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Current string" length={step.text.length} valueAt={i => step.text[i]}
      active={step.start} roleAt={i => (i >= step.start && i < step.end ? 'shifted' : '')} />
    <output aria-label="Current string value">{`String: ${step.text}`}</output>
  </>} renderReasoning={() => <>
    <p>Shifting a substring can only lower letters, and the earliest position that is not a is the one that matters most.</p>
    <p>Shifting from there up to the next a gives the smallest result, because the a at the end of the run must stay unchanged.</p>
  </>} />
}
