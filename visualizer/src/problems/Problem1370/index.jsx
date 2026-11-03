import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FrequencyCountTable from '../../components/shared/FrequencyCountTable'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Letters (JSON object with s)',
  url: 'https://leetcode.com/problems/increasing-decreasing-string/',
  complexity: 'O(n) time and O(1) extra space for the 26 letter counts. The visualization accepts up to 200 letters.',
  examples: [
    { label: 'Short', input: '{"s":"aab"}' },
    { label: 'Four each', input: '{"s":"aaaabbbbcccc"}' },
    { label: 'Mixed', input: '{"s":"zzyxa"}' },
  ],
}

export default function IncreasingDecreasingString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Output so far" length={step.snapshot.out.length} valueAt={i => step.snapshot.out[i]}
      active={step.snapshot.out.length - 1} roleAt={() => ''} />
    <FrequencyCountTable title="Copies left" entries={Object.entries(step.snapshot.remaining)} />
    <p>Sweep direction: {step.snapshot.direction === 'up' ? 'increasing' : step.snapshot.direction === 'down' ? 'decreasing' : 'not started'}. Input length {run.input.s.length}.</p>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each sweep takes at most one copy of every letter that still has copies. Going up and then down keeps the output from ever using two copies of the same letter in one sweep.</p>
  </>} />
}
