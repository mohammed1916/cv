import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the left end.' },
    { id: 'check', label: 'Compare', description: 'Compare this index with its mirror from the right.' },
    { id: 'found', label: 'Match', description: 'The two characters are equal, so this is the first match.' },
    { id: 'done', label: 'Complete', description: 'Report the index.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Lowercase string (JSON object with s)',
  url: 'https://leetcode.com/problems/first-matching-character-from-both-ends/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps input at 30 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"abcacbd"}' },
    { label: 'Example 2', input: '{"s":"abc"}' },
    { label: 'No match', input: '{"s":"abcdab"}' },
    { label: 'Single letter', input: '{"s":"a"}' },
    { label: 'Equal letters', input: '{"s":"aaaa"}' },
    { label: 'Descending run, 26 letters', input: '{"s":"zyxwvutsrqponmlkjihgfedcbaz"}' },
    { label: 'Long run: 30 letters', input: '{"s":"uufvlqupdbluvijdmgwabenktihqgv"}' },
  ],
}

export default function FirstMatchingFromEnds() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Characters" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.index}
      roleAt={i => (i === step.mirror ? 'mirror' : '')} />
    <output aria-label="Comparison">{step.index < 0 ? 'Ready' : `Index ${step.index} vs mirror ${step.mirror ?? '-'}, answer ${step.result ?? 'pending'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The left index and its mirror from the right are compared in order, so the first equal pair gives the smallest index.</p>
  </>} />
}
