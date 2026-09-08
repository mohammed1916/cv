import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, inputLabel: 'Bitonic array nums (JSON)',
  url: 'https://leetcode.com/problems/compare-sums-of-bitonic-parts/',
  complexity: 'O(n) time and O(1) solver extra space. The visualization retains O(n) compact events, without copying the array at each addition.',
  phases: [
    { id: 'start', label: 'Input', description: 'Start with two zero sums.' },
    { id: 'scan', label: 'Climb →', description: 'Follow strictly increasing neighbors.' },
    { id: 'peak', label: 'Shared peak', description: 'Identify the inclusive boundary shared by both parts.' },
    { id: 'left', label: 'Sum ascending', description: 'Include indices 0 through the peak.' },
    { id: 'right', label: 'Sum descending', description: 'Include the peak through the last index.' },
    { id: 'done', label: 'Compare', description: 'Return 0, 1, or −1 according to the larger sum.' },
  ],
  examples: [
    { label: 'Descending wins', input: '[1,3,2,1]' },
    { label: 'Ascending wins', input: '[2,4,5,2]' },
    { label: 'Equal sums', input: '[1,2,4,3]' },
  ],
}

export default function CompareBitonicSums() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Bitonic input and shared peak" length={run.input.length} active={step.index} valueAt={i => run.input[i]}
      roleAt={i => step.peak === null ? 'unclassified' : i === step.peak ? 'both parts' : i < step.peak ? 'ascending' : 'descending'} />
    {step.peak !== null && <>
      <IndexedSequence label="Ascending part (peak included)" length={step.peak + 1}
        active={step.phase === 'left' ? step.index : -1} valueAt={i => run.input[i]}
        roleAt={i => ['right', 'done'].includes(step.phase) || step.phase === 'left' && i <= step.index ? 'added' : 'pending'} />
      <IndexedSequence label="Descending part (peak included)" length={run.input.length - step.peak} indexOffset={step.peak}
        active={step.phase === 'right' ? step.index - step.peak : -1} valueAt={i => run.input[i + step.peak]}
        roleAt={i => step.phase === 'done' || step.phase === 'right' && i + step.peak <= step.index ? 'added' : 'pending'} />
    </>}
    <table><caption>Running inclusive sums</caption><thead><tr><th>Ascending</th><th>Descending</th></tr></thead>
      <tbody><tr><td>{step.left}</td><td>{step.right}</td></tr></tbody></table>
    {step.phase === 'done' && <output aria-label="Comparison result">Result: {run.result}</output>}
  </>} renderReasoning={({ run, step }) => <>
    <p>The two parts overlap at the peak; this is not a disjoint split.</p>
    {step.peak !== null && <p>Original ranges: ascending [0..{step.peak}], descending [{step.peak}..{run.input.length - 1}]. Peak value {run.input[step.peak]} appears in both sums.</p>}
    <p>Return mapping: 0 = ascending larger; 1 = descending larger; −1 = equal.</p>
    <p>The shared peak could be subtracted from both sides without changing the comparison. Here it remains in both totals to match the problem's definition.</p>
  </>} />
}
