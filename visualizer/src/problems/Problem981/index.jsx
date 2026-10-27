import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty store', description: 'No keys are stored yet.' },
    { id: 'set', label: 'Set', description: 'Append a timestamped value to the key’s list.' },
    { id: 'search', label: 'Binary search', description: 'Find the last entry at or before the query time.' },
    { id: 'answer', label: 'Answer', description: 'Return that value, or the empty string.' },
    { id: 'done', label: 'Complete', description: 'All operations are processed.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Operations (JSON array)',
  url: 'https://leetcode.com/problems/time-based-key-value-store/',
  complexity: 'O(1) per set and O(log n) per get. The visualization caps input at 30 operations.',
  examples: [
    { label: 'Example 1', input: '[["set","foo","bar",1],["get","foo",1],["get","foo",3],["set","foo","baz",4],["get","foo",4],["get","foo",5]]' },
    { label: 'Before first', input: '[["set","a","x",5],["get","a",4]]' },
  ],
}

export default function TimeBasedKeyValueStore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label={step.key ? `Entries for ${step.key} (time, value)` : 'Entries'} length={step.entries.length}
      active={step.mid ?? step.found ?? -1}
      valueAt={i => `${step.entries[i][0]}:${step.entries[i][1]}`}
      roleAt={i => (step.found !== null && i === step.found ? 'match' : step.low !== null && i >= step.low && i <= step.high ? 'read' : '')} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Timestamps for a key only increase, so its list is already sorted. A get is then a binary search for the last timestamp at or before the query.</p>
    <p>Each time the search finds a valid entry, it keeps it as the candidate and looks for a later one.</p>
  </>} />
}
