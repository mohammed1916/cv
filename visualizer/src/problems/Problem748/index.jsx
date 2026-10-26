import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Plate letters', description: 'Count the letters of the plate, ignoring digits, spaces and case.' },
    { id: 'count', label: 'Count word', description: 'Count the letters of the next word.' },
    { id: 'check', label: 'Compare', description: 'Check that the word has at least as many of each needed letter.' },
    { id: 'best', label: 'Update best', description: 'Keep the shortest completing word, first on ties.' },
    { id: 'done', label: 'Complete', description: 'Return the shortest completing word.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Plate and words (JSON)',
  url: 'https://leetcode.com/problems/shortest-completing-word/',
  complexity: 'O(total letters of words) time with a 26-letter counter; the trace shows one frame set per word (capped at 40 words).',
  examples: [
    { label: 'Example 1', input: '{"licensePlate": "1s3 PSt", "words": ["step", "steps", "stripe", "stepple"]}' },
    { label: 'Example 2', input: '{"licensePlate": "1s3 456", "words": ["looks", "pest", "stew", "show"]}' },
    { label: 'Tie', input: '{"licensePlate": "Ab", "words": ["xab", "bay", "ab"]}' },
  ],
}

export default function ShortestCompletingWord() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Needed plate letters" length={step.need.length} valueAt={i => `${step.need[i][0]}x${step.need[i][1]}`} roleAt={i => step.missing.some(m => m.startsWith(step.need[i][0] + ':')) ? 'missing' : ''} />
    <IndexedSequence label="Words" length={run.input.words.length} active={step.index} valueAt={i => run.input.words[i]} roleAt={i => i === step.best ? 'best' : ''} />
    <output aria-label="Best word">Best so far: {step.best >= 0 ? run.input.words[step.best] : 'none'}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>Plate: {run.input.licensePlate}</p>
    {step.missing.length > 0 && <p>Shortfall: {step.missing.join('; ')}</p>}
    <p><strong>Why it works:</strong> a word completes the plate exactly when its count of every plate letter is at least the plate count; extra letters never hurt.</p>
    <p>Scanning in order and replacing only on strictly shorter length returns the first shortest word.</p>
  </>} />
}
