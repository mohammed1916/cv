import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count values', description: 'Count each distinct value.' },
    { id: 'scan', label: 'Check neighbour', description: 'Look for x + 1 among the values.' },
    { id: 'pair', label: 'Pair x with x + 1', description: 'Add both counts and keep the best.' },
    { id: 'done', label: 'Complete', description: 'Return the longest harmonious length.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Array nums (JSON)',
  url: 'https://leetcode.com/problems/longest-harmonious-subsequence/',
  complexity: 'O(n) expected time with a hash map, plus O(d log d) to sort the d distinct values for display.',
  examples: [
    { label: 'Mixed ones and twos', input: '[1,3,2,2,5,2,3,7]' },
    { label: 'No pair', input: '[1,1,1,1]' },
    { label: 'Negative values', input: '[-1,-1,0,0,0]' },
  ],
}

export default function LongestHarmonious() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Distinct values (value × count)" length={step.values.length} active={step.index}
      valueAt={i => `${step.values[i]}×${step.counts[i] ?? '?'}`}
      roleAt={i => step.pair && (step.values[i] === step.pair[0] || step.values[i] === step.pair[1]) ? 'pair' : ''} />
    <output aria-label="Best so far">Best harmonious length: {step.best}{step.total !== undefined ? ` · this pair: ${step.total}` : ''}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Harmonious:</strong> the maximum and minimum differ by exactly 1, so only neighbouring values can share a subsequence.</p>
    <p>Input has {run.input.length} elements and {step.values.length} distinct values.</p>
  </>} />
}
