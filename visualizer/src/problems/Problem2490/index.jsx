import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2490',
  phases: [
    { id: 'setup', label: 'Setup', description: 'Split the sentence into words.' },
    { id: 'compare', label: 'Compare', description: 'Check one link of the circle.' },
    { id: 'fail', label: 'Fail', description: 'A link does not match.' },
    { id: 'done', label: 'Result', description: 'Every link matches.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"sentence": "leetcode exercises sound delightful"}',
  url: 'https://leetcode.com/problems/circular-sentence/',
  complexity: 'O(n) time and O(n) extra space for a sentence of n characters. The visualization caps sentences at 500 characters.',
  examples: [
    { label: 'Circular', input: '{"sentence":"leetcode exercises sound delightful"}' },
    { label: 'Not circular', input: '{"sentence":"Leetcode is cool"}' },
  ],
}

export default function CircularSentence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="words" length={step.words.length} valueAt={i => step.words[i]} active={step.at}
      roleAt={i => (step.next !== null && step.next !== undefined && i === step.next ? 'next' : '')} />
    <output aria-label="Circular check">{step.result === null ? 'checking' : step.result ? 'circular' : 'not circular'}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A sentence is circular when the last letter of each word matches the first letter of the next word, and the last word's last letter matches the first word's first letter.</p>
    <p>Checking each word against its successor, with the successor wrapping around to the first word, covers every link once.</p>
  </>} />
}
