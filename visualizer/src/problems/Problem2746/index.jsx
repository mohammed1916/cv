import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'First word', description: 'Start the table with the first word.' },
    { id: 'word', label: 'Join word', description: 'Join this word on either side of each stored string.' },
    { id: 'done', label: 'Complete', description: 'Report the shortest length.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object {"words": array of 1 to 8 lowercase strings}',
  url: 'https://leetcode.com/problems/decremental-string-concatenation/',
  complexity: 'O(n * 26 * 26) time, since only the first and last letter of each state matter. The visualization caps input at 8 words.',
  examples: [
    { label: 'Example 1', input: '{"words": ["aa", "ab", "bc"]}' },
    { label: 'Example 2', input: '{"words": ["ab", "b"]}' },
  ],
}

export default function DecrementalStringConcatenation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Words" length={run.input.words.length} valueAt={i => run.input.words[i]} active={step.index} roleAt={i => (i === step.index ? 'joining' : '')} />
    <output aria-label="Table entries">{`Entries: ${step.entries.map(e => `${e.first}..${e.last}=${e.length}`).join(', ') || 'none'}. Shortest ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Joining two strings removes at most one letter, and only when the left string ends with the letter the right string starts with.</p>
    <p>Later joins depend only on the first letter, the last letter and the length, so the table keeps the shortest length for each pair of end letters.</p>
  </>} />
}
