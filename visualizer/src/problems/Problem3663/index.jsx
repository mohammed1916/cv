import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import FrequencyCountTable from '../../components/shared/FrequencyCountTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Digits', description: 'Write n as its decimal digits.' },
    { id: 'count', label: 'Count digits', description: 'Tally each digit as it is read.' },
    { id: 'compare', label: 'Compare', description: 'Keep the digit with the smaller count, preferring smaller digits on ties.' },
    { id: 'done', label: 'Complete', description: 'Report the least frequent digit.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integer n from 1 to 1000000000 (JSON object)',
  url: 'https://leetcode.com/problems/find-the-least-frequent-digit/',
  complexity: 'O(d) time, where d is the number of decimal digits of n.',
  examples: [
    { label: 'Mixed digits', input: '{"n":1553322}' },
    { label: 'Tie', input: '{"n":1223}' },
  ],
}

export default function LeastFrequentDigit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const digits = String(run.input.n)
    return <>
      <IndexedSequence label="Digits of n" length={digits.length} valueAt={i => digits[i]} active={step.index}
        roleAt={i => (step.index >= 0 && i <= step.index ? 'seen' : '')} />
      <FrequencyCountTable title="Digit counts" entries={step.counts} active={step.key} />
      <output aria-label="Best digit">{step.best === null ? 'No best digit yet.' : `Best digit so far: ${step.best}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Only digits that appear are candidates, so the scan visits the distinct digits in increasing order.</p>
    <p>A digit replaces the best only when its count is strictly smaller, so ties keep the smaller digit.</p>
  </>} />
}
