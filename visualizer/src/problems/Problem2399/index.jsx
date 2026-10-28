import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty map', description: 'No letter has been seen yet.' },
    { id: 'scan', label: 'First copy', description: 'Record where this letter first appears.' },
    { id: 'check', label: 'Second copy', description: 'Compare the gap with the letter’s distance entry.' },
    { id: 'fail', label: 'Mismatch', description: 'A gap differs from its distance, so the answer is false.' },
    { id: 'done', label: 'Result', description: 'Every gap matched.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String and distances as JSON: {"s": "...", "distance": [26 numbers]}',
  url: 'https://leetcode.com/problems/check-distances-between-same-letters/',
  complexity: 'O(n) time and O(1) extra space for the 26-letter table. The visualization caps input at 52 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"abaccb","distance":[1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}' },
    { label: 'Example 2', input: '{"s":"aa","distance":[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}' },
  ],
}

export default function SameLetterDistances() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Letters" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.index ?? -1} />
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Result so far">{step.result === null ? 'Still checking' : `Result: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the first copy’s index needs to be remembered. When the second copy arrives, the number of letters between them is a single subtraction.</p>
    <p>Letters that do not appear are not checked, so their distance entries are ignored.</p>
  </>} />
}
