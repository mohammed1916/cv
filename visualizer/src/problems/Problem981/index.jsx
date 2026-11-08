import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty store', description: 'No keys are stored yet.' },
    { id: 'set', label: 'Set', description: 'Append a timestamped value to the key’s list.' },
    { id: 'search', label: 'Binary search', description: 'Find the last entry at or before the query time.' },
    { id: 'answer', label: 'Answer', description: 'Return that value, or the empty string.' },
    { id: 'done', label: 'Complete', description: 'All operations are processed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Operations (JSON array)',
  url: 'https://leetcode.com/problems/time-based-key-value-store/',
  complexity: 'O(1) per set and O(log n) per get. The visualization caps input at 30 operations.',
  examples: [
    { label: 'Example 1', input: '[["set","foo","bar",1],["get","foo",1],["get","foo",3],["set","foo","baz",4],["get","foo",4],["get","foo",5]]' },
    { label: 'Before first', input: '[["set","a","x",5],["get","a",4]]' },
    { label: 'Smallest: one set and one get', input: '[["set","a","b",1],["get","a",1]]' },
    { label: 'Query time matches a stored time exactly', input: '[["set","x","one",2],["get","x",2],["set","x","two",9],["get","x",9]]' },
    { label: 'Limits: five letters and time 100', input: '[["set","zzzzz","zzzzz",1],["get","zzzzz",100],["set","zzzzz","aaaaa",100],["get","zzzzz",99]]' },
    { label: 'Unknown key returns empty', input: '[["get","nokey",5]]' },
    { label: 'Long run: 30 operations', input: '[["set","ijklm","bfe",2],["get","fgh",2],["get","ijklm",31],["get","ijklm",26],["get","ijklm",56],["get","ab",7],["get","fgh",53],["set","ab","c",3],["get","fgh",84],["set","ab","ddb",5],["set","cde","afgaa",1],["set","ab","afade",8],["set","ab","ccef",9],["get","ijklm",2],["get","cde",45],["get","fgh",22],["get","fgh",74],["get","cde",41],["get","cde",91],["get","ijklm",83],["set","ijklm","hc",4],["get","fgh",90],["set","cde","f",2],["get","ijklm",27],["get","fgh",89],["get","ab",22],["set","cde","b",3],["set","ijklm","hfede",6],["get","ab",31],["get","ab",54]]' },
  ],
}

export default function TimeBasedKeyValueStore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label={step.key ? `Entries for ${step.key} (time, value)` : 'Entries'} length={step.entries.length}
      active={step.mid ?? step.found ?? -1}
      valueAt={i => `${step.entries[i][0]}:${step.entries[i][1]}`}
      roleAt={i => (step.found !== null && i === step.found ? 'match' : step.low === null ? '' : i === step.low ? 'lo' : i === step.high ? 'hi' : i > step.low && i < step.high ? 'read' : '')} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Timestamps for a key only increase, so its list is already sorted. A get is then a binary search for the last timestamp at or before the query.</p>
    <p>Each time the search finds a valid entry, it keeps it as the candidate and looks for a later one.</p>
  </>} />
}
