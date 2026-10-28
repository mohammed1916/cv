import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Join', description: 'Concatenate the chunks into one text.' },
    { id: 'letter', label: 'Letter', description: 'A letter extends the current word.' },
    { id: 'joiner', label: 'Joiner', description: 'A hyphen between letters stays inside the word.' },
    { id: 'separator', label: 'Separator', description: 'Any other character ends the current word.' },
    { id: 'answer', label: 'Lookup', description: 'Each query reads its count from the table.' },
    { id: 'done', label: 'Return', description: 'Every query has an answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"chunks": [...], "queries": [...]}',
  url: 'https://leetcode.com/problems/count-valid-word-occurrences/',
  complexity: 'O(total length + total query length) with hash lookups. The visualization caps the joined text at 24 characters.',
  examples: [
    { label: 'Example 1', input: '{"chunks":["hello wor","ld hello"],"queries":["hello","world","wor"]}' },
    { label: 'Example 2', input: '{"chunks":["a-b a--b ","a-","b"],"queries":["a-b","a","b"]}' },
  ],
}

export default function CountValidWordOccurrences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Joined text" length={step.s.length} valueAt={j => step.s[j]} active={step.i} />
    <output aria-label="Current word">{`Current word: "${step.current}". Answers: [${step.answers.join(', ')}]`}</output>
    <output aria-label="Step message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A word is a maximal run of letters and joiner hyphens. A hyphen is a joiner only when letters sit on both sides of it.</p>
    <p>Counting the words once in a table lets every query be answered with a single lookup.</p>
  </>} />
}
