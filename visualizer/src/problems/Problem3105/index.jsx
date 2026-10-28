import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'A single number starts a run of length 1 in both directions.' },
    { id: 'step', label: 'Compare', description: 'Compare this number with the one before it.' },
    { id: 'done', label: 'Complete', description: 'Report the longest run.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers 1 to 6 (JSON array, up to 12 entries)',
  url: 'https://leetcode.com/problems/longest-strictly-increasing-or-strictly-decreasing-subarray/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps input at 12 entries.',
  examples: [
    { label: 'Example 1', input: '[1,4,3,3,2]' },
    { label: 'Decreasing', input: '[3,2,1]' },
  ],
}

export default function MonotoneSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={i => run.input[i]} active={step.index}
      roleAt={i => (i === step.index && step.index > 0 ? (run.input[i] > run.input[i - 1] ? 'rise' : run.input[i] < run.input[i - 1] ? 'fall' : 'flat') : '')} />
    <p aria-label="Runs">{`Increasing run: ${step.up}; decreasing run: ${step.down}; best: ${step.best}`}</p>
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Only the latest pair matters: a rise extends the increasing run and resets the decreasing one, a fall does the reverse, and an equal pair resets both.</p>
  </>} />
}
