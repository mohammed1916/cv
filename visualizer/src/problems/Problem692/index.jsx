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
    { label: 'Single word', input: '{"words":["solo"],"k":1}' },
    { label: 'Equal counts use alphabetical order', input: '{"words":["pear","apple","pear","apple"],"k":1}' },
    { label: 'Every distinct word kept', input: '{"words":["a","b","c"],"k":3}' },
    { label: 'Long run: 400 words', input: '{"words":["gnu","ant","hen","dog","gnu","ant","hen","hen","gnu","eel","jay","hen","hen","gnu","ant","ant","ibis","jay","ant","dog","jay","ant","cat","koi","dog","lark","ibis","fox","koi","dog","lark","eel","lark","ant","lark","cat","eel","lark","ibis","lark","bee","ibis","jay","lark","ant","gnu","jay","koi","fox","gnu","cat","bee","jay","eel","hen","bee","dog","bee","fox","lark","koi","fox","koi","lark","bee","jay","bee","fox","fox","dog","ibis","dog","bee","ibis","lark","hen","koi","bee","eel","koi","cat","bee","fox","hen","ibis","lark","fox","eel","ant","eel","cat","eel","lark","bee","dog","ant","dog","bee","ibis","ibis","bee","ibis","jay","gnu","gnu","eel","eel","gnu","hen","gnu","jay","cat","jay","ibis","koi","ibis","bee","fox","hen","gnu","jay","dog","bee","dog","ant","jay","eel","lark","lark","jay","jay","ibis","ibis","dog","cat","ant","lark","gnu","fox","fox","cat","cat","eel","koi","koi","gnu","ant","fox","koi","ant","lark","lark","ibis","dog","dog","ant","koi","ant","fox","bee","gnu","bee","cat","gnu","ant","gnu","koi","jay","dog","gnu","jay","jay","hen","dog","lark","cat","bee","lark","gnu","hen","ant","cat","cat","koi","eel","gnu","bee","koi","koi","eel","bee","ant","gnu","cat","fox","ibis","ant","ibis","jay","gnu","bee","ibis","ant","lark","dog","bee","jay","fox","dog","ibis","cat","koi","lark","lark","lark","ibis","hen","ibis","bee","jay","eel","dog","ibis","dog","gnu","ibis","gnu","ant","lark","bee","jay","cat","gnu","jay","koi","bee","jay","ibis","fox","ant","bee","hen","koi","hen","dog","koi","jay","jay","cat","cat","koi","hen","eel","ant","hen","gnu","koi","cat","cat","hen","eel","ibis","fox","ibis","ant","fox","fox","eel","cat","dog","koi","dog","eel","koi","hen","cat","lark","ibis","lark","lark","bee","eel","cat","ant","hen","ant","koi","gnu","cat","ibis","jay","koi","ant","ant","eel","eel","ibis","lark","ibis","fox","eel","lark","fox","jay","jay","gnu","gnu","hen","ant","lark","jay","eel","ant","ant","lark","gnu","ibis","hen","jay","ant","lark","eel","fox","hen","ant","jay","bee","lark","dog","cat","lark","ant","bee","hen","ant","cat","cat","dog","cat","ant","bee","eel","fox","bee","koi","ibis","cat","gnu","koi","ant","ant","ant","ibis","eel","hen","koi","hen","dog","ant","ant","ibis","ant","gnu","jay","jay","eel","ibis","bee","fox","hen","jay","lark","koi","dog","bee","ibis","fox","jay","cat","bee","dog","eel","ibis","fox","ant","fox","ibis","cat","fox","eel","eel","ibis","hen","ibis","koi","koi","gnu","ant","lark","eel"],"k":5}' },
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
