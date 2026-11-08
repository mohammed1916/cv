import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Express the run sum with the run length k.' },
    { id: 'miss', label: 'Not divisible', description: 'No integer start for this k.' },
    { id: 'hit', label: 'Valid run', description: 'n minus the triangular offset divides evenly by k.' },
    { id: 'done', label: 'Complete', description: 'Return the number of valid run lengths.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'n (JSON integer)',
  url: 'https://leetcode.com/problems/consecutive-numbers-sum/',
  complexity: 'O(sqrt(n)) time since k(k+1)/2 <= n; O(1) extra space (this view stores the valid runs).',
  examples: [{ label: 'n = 5', input: '5' }, { label: 'n = 9', input: '9' }, { label: 'n = 15', input: '15' }, { label: 'Smallest n', input: '1' }, { label: 'Power of two', input: '8' }, { label: 'Largest allowed n', input: '10000000' }, { label: 'Long run: n = 9999991', input: '9999991' }],
}
export default function ConsecutiveNumbersSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const shown = run.hits.filter(h => h.k <= step.k)
    return <>
      <output aria-label="Current length">{step.k ? `Trying k = ${step.k}: (${run.input} - ${step.k * (step.k - 1) / 2}) / ${step.k}${step.rest !== undefined ? ` = ${step.rest / step.k}` : ''}` : 'No k tried yet'}</output>
      {step.k > 0 && <RecordStateTable label={`Lengths tried so far (n = ${run.input})`} columns={['k', 'rest = n - k(k-1)/2', 'rest / k', 'works']} activeRow={step.k - 1}
        rows={Array.from({ length: step.k }, (_, i) => i + 1).map(k => {
          const rest = run.input - k * (k - 1) / 2
          return { k, 'rest = n - k(k-1)/2': rest, 'rest / k': rest % k === 0 ? rest / k : 'not whole', works: rest % k === 0 ? 'yes' : 'no' }
        })} />}
      <IndexedSequence label="Valid runs found (length k: start..end)" length={shown.length} active={step.phase === 'hit' ? shown.length - 1 : -1}
        valueAt={i => `${shown[i].k}: ${shown[i].a}..${shown[i].a + shown[i].k - 1}`} />
      <output aria-label="Count">Ways found: {step.count}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>With start a and length k, the sum is k*a + k(k-1)/2. Rearranged, a = (n - k(k-1)/2) / k must be a positive integer.</p>
    <p>The smallest run of length k starts at 1 and sums to k(k+1)/2, so once that exceeds n no longer run can work and the loop stops.</p>
    {step.k > 0 && <p>Current k = {step.k}.</p>}
  </>} />
}
