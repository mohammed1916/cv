import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Only the empty prefix is buildable.' },
    { id: 'build', label: 'Buildable', description: 'Its shorter prefix is already buildable.' },
    { id: 'skip', label: 'Blocked', description: 'Its shorter prefix is missing from the set.' },
    { id: 'done', label: 'Complete', description: 'The longest buildable word wins; ties go alphabetically.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Words (JSON object with a words array)',
  url: 'https://leetcode.com/problems/longest-word-in-dictionary/',
  complexity: 'O(n log n + total letters) for sorting and set lookups.',
  examples: [
    { label: 'Chain', input: '{"words":["m","ma","mat","mate","matter","mad"]}' },
    { label: 'Gap', input: '{"words":["k","kn","knot","kno","knight"]}' },
  ],
}

export default function LongestWordInDictionary() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RecordStateTable label="Words checked shortest first" columns={['word', 'parent', 'buildable']}
      rows={step.rows.map(r => ({ word: r.word, parent: r.parent, buildable: r.buildable ? 'yes' : 'no' }))}
      activeRow={step.rows.findIndex(r => r.word === step.current)} />
    <output aria-label="Best word">{`Best so far: ${step.best || 'none'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>A word is buildable when the word without its last letter is buildable. Checking shorter words first means each parent is already decided.</p>
    <p>Among buildable words, the longest wins. Because the scan is alphabetical within a length, the first longest word found is the smallest one.</p>
    {step.phase === 'done' && <p>{step.message}</p>}
  </>} />
}
