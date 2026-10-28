import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import FrequencyCountTable from '../../components/shared/FrequencyCountTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the best answer to -1.' },
    { id: 'window', label: 'Windows', description: 'Count which values each length-k window contains.' },
    { id: 'pick', label: 'Pick largest', description: 'Keep the largest value present in exactly one window.' },
    { id: 'done', label: 'Complete', description: 'Report the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and window length k (JSON)',
  url: 'https://leetcode.com/problems/find-the-largest-almost-missing-integer/',
  complexity: 'O(n * k) time with direct window scans. The visualization caps nums at 20 values.',
  examples: [
    { label: 'Largest unique window', input: '{"nums":[3,9,2,1,7],"k":3}' },
    { label: 'Single window', input: '{"nums":[3,9,7,2,1,7],"k":4}' },
  ],
}

export default function AlmostMissing() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums, k } = run.input
    const start = step.index
    return <>
      <IndexedSequence label="nums" length={nums.length} valueAt={i => nums[i]} active={start}
        roleAt={i => (start >= 0 && i >= start && i < start + k ? 'window' : '')} />
      <FrequencyCountTable title="Windows containing each value" entries={step.counts} active={step.key} />
      <output aria-label="Best so far">{`Best so far: ${step.best}. ${step.message ?? ''}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A value is almost missing when exactly one length-k window contains it, so the windows are the thing to count.</p>
    <p>Each window counts a value once even if the value repeats inside it.</p>
  </>} />
}
