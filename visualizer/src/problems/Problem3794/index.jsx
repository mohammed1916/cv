import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read the characters of the string.' },
    { id: 'swap', label: 'Swap', description: 'Swap the two characters at the ends of the prefix.' },
    { id: 'done', label: 'Complete', description: 'Report the string with its prefix reversed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String and prefix length (JSON object with s and k)',
  url: 'https://leetcode.com/problems/reverse-string-prefix/',
  complexity: 'O(k) time and O(n) space.',
  examples: [
    { label: 'Example 1', input: '{"s":"abcd","k":2}' },
    { label: 'Example 2', input: '{"s":"xyz","k":3}' },
  ],
}

export default function ReverseStringPrefix() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <IndexedSequence label="Characters" length={step.chars.length} valueAt={i => step.chars[i]} active={step.left}
      roleAt={i => (i < run.input.k ? 'prefix' : '')} />
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Swapping from both ends of the prefix reverses it in place, and the rest of the string never moves.</p>
  </>} />
}
