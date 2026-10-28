import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'rotate', label: 'Rotation', description: 'Try one rotation and price each mirror pair.' },
    { id: 'done', label: 'Complete', description: 'Report the cheapest rotation.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String (JSON object with s)',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-a-rotated-palindrome-i/',
  complexity: 'O(n²) time and O(n) space for each rotation. The visualization caps s at 12 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"abc"}' },
    { label: 'Example 2', input: '{"s":"yb"}' },
  ],
}

export default function RotatedPalindromeOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <p aria-label="Current rotation" style={{ fontFamily: 'monospace', fontSize: '1.25rem' }}>
      {step.text}
    </p>
    <output aria-label="Best">{`Original ${run.input.s}; best so far ${step.best ?? '(none)'}`}</output>
  </>} renderReasoning={() => <>
    <p>A left rotation costs one operation, and a letter can only move forward through the alphabet, so each mirror pair costs the smaller of the two forward distances.</p>
    <p>The answer is the cheapest total over all rotations.</p>
  </>} />
}
