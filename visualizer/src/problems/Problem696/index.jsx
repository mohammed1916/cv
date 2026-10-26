import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Runs', description: 'Split the string into runs of equal characters.' },
    { id: 'pair', label: 'Adjacent pair', description: 'Each neighbouring pair of runs contributes the smaller length.' },
    { id: 'done', label: 'Complete', description: 'Return the total.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Binary string s (JSON string of 0 and 1)',
  url: 'https://leetcode.com/problems/count-binary-substrings/',
  complexity: 'O(n) time and O(r) space for r runs.',
  examples: [
    { label: 'Example', input: '"00110011"' },
    { label: 'Unequal runs', input: '"10101"' },
    { label: 'Long run', input: '"00011"' },
  ],
}

export default function CountBinarySubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Run lengths" length={Math.max(1, step.runs.length)} active={step.pair ? step.pair[1] : -1}
      valueAt={i => (step.runs[i] ?? '…')} roleAt={i => (step.pair && (i === step.pair[0] || i === step.pair[1]) ? 'pair' : '')} />
    <output aria-label="Total">Total so far: {step.total}{step.add !== undefined ? ` · this pair adds ${step.add}` : ''}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why min:</strong> a substring with equal halves across a boundary can use at most as many characters as the shorter run on either side.</p>
  </>} />
}
