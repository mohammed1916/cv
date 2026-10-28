import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count', description: 'Count the letters in s and in the target.' },
    { id: 'letter', label: 'Letter limit', description: 'Divide available letters by the letters one copy needs.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest limit over all target letters.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s and target (lowercase letters)',
  url: 'https://leetcode.com/problems/rearrange-characters-to-make-target-string/',
  complexity: 'O(n + m) time and O(1) extra space for the 26 letters. The visualization caps s at 20 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"ababcbarc","target":"baca"}' },
    { label: 'Missing letter', input: '{"s":"aaa","target":"ab"}' },
  ],
}

export default function RearrangeCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={-1} roleAt={() => ''} />
    <p aria-label="Letters">{step.letter ? `Checking ${step.letter}: ${step.have} available, ${step.need} per copy` : 'Comparing the letters of the target'}</p>
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each copy of the target uses its letters once, so the number of copies is limited by the scarcest letter.</p>
    <p>For each letter, divide the available count by the count one copy needs; the answer is the smallest of those quotients.</p>
  </>} />
}
