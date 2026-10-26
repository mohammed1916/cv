import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Split', description: 'Split the sentence into words.' },
    { id: 'classify', label: 'Vowel check', description: 'Look at the first letter of the word.' },
    { id: 'rotate', label: 'Rotate', description: 'Move a leading consonant to the end.' },
    { id: 'append', label: 'Append', description: 'Add "ma" and one "a" per word position.' },
    { id: 'done', label: 'Complete', description: 'Join the transformed words.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Sentence (JSON string)',
  url: 'https://leetcode.com/problems/goat-latin/',
  complexity: 'O(n^2) time and space in the worst case, because the i-th word receives i trailing a letters.',
  examples: [
    { label: 'Official 1', input: '"I speak Goat Latin"' },
    { label: 'Official 2', input: '"The quick brown fox jumped over the lazy dog"' },
    { label: 'One word', input: '"a"' },
  ],
}
export default function GoatLatin() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Words" length={run.words.length} active={step.index} valueAt={i => run.words[i]} />
    <IndexedSequence label="Transformed words" length={step.out.length} active={-1} valueAt={i => step.out[i]} />
    <output aria-label="Current word">{step.word ? `${step.word} becomes ${step.current}` : 'No word in progress'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>Vowel test is case-insensitive and looks only at the first letter. Only consonant-led words are rotated.</p>
    <p>The suffix "ma" is constant; the number of trailing a letters equals the 1-based word position{step.index >= 0 ? `, here ${step.index + 1}` : ''}.</p>
  </>} />
}
