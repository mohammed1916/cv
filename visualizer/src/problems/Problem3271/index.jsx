import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Split the string into blocks of k letters.' },
    { id: 'block', label: 'Block', description: 'Sum the alphabet positions in the block and map the sum to a letter.' },
    { id: 'done', label: 'Complete', description: 'Report the hashed string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s (1 to 24 lowercase letters) and k (1 to 6, dividing the length of s)',
  url: 'https://leetcode.com/problems/hash-divided-string/',
  complexity: 'O(n) time for a string of length n. The visualization caps s at 24 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"abcd","k":2}' },
    { label: 'Example 2', input: '{"s":"mxz","k":3}' },
  ],
}

export default function HashDividedString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Characters of s" length={run.input.s.length} valueAt={index => run.input.s[index]} active={step.start} roleAt={index => (step.start >= 0 && index >= step.start && index < step.start + run.input.k ? 'block' : '')} />
    <output aria-label="Hashed so far">{`Hashed so far: ${step.result || '(empty)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each block of k letters contributes one letter, so the output has length n divided by k.</p>
    <p>Adding the alphabet positions and taking the result modulo 26 always lands on a letter, which keeps the mapping total.</p>
  </>} />
}
