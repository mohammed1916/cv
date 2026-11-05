import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty counts', description: 'No word has been counted.' },
    { id: 'count', label: 'Count words', description: 'Each occurrence adds one to its word’s count.' },
    { id: 'sort', label: 'Rank words', description: 'Higher counts first; equal counts in alphabetical order.' },
    { id: 'done', label: 'Top k', description: 'Keep the first k words of the ranking.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Words and k (JSON object)',
  url: 'https://leetcode.com/problems/top-k-frequent-words/',
  complexity: 'O(n + d log d) time for n words with d distinct values, and O(d) space for the counts.',
  examples: [
    { label: 'Tie by letter', input: '{"words":["red","blue","red","green","blue","blue"],"k":2}' },
    { label: 'Everything', input: '{"words":["m","n","m"],"k":2}' },
    { label: 'One', input: '{"words":["zed","alpha","alpha"],"k":1}' },
  ],
}

export default function TopKFrequentWords() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RecordStateTable label="Words, counts and rank" columns={['word', 'count', 'chosen']}
      rows={step.entries.map(e => ({ word: e.word, count: e.count, chosen: step.chosen.includes(e.word) ? 'yes' : '' }))} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why this order:</strong> the ranking uses the count first and the word second, so ties resolve alphabetically and the first k entries are exactly the answer.</p>
  </>} />
}
