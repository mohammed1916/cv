import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Target', description: 'Each bucket must reach total ÷ k.' },
    { id: 'place', label: 'Place a number', description: 'Put the next largest number into a bucket that still has room.' },
    { id: 'undo', label: 'Backtrack', description: 'A dead end takes the number back out and tries another bucket.' },
    { id: 'done', label: 'Answer', description: 'True when every bucket reaches the target.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Numbers and k (JSON object)',
  url: 'https://leetcode.com/problems/partition-to-k-equal-sum-subsets/',
  complexity: 'Exponential in the worst case (about k^n placements), pruned by sorting and skipping equal buckets; practical for the 16-number limit here.',
  examples: [
    { label: 'Three buckets', input: '{"nums":[4,3,2,3,5,2,1],"k":4}' },
    { label: 'Impossible', input: '{"nums":[1,2,3,4],"k":3}' },
    { label: 'Two halves', input: '{"nums":[2,2,2,2,3,3],"k":2}' },
  ],
}

export default function PartitionKSubsets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers in descending order" length={[...run.input.nums].sort((a, b) => b - a).length} active={step.index ?? -1}
      valueAt={i => [...run.input.nums].sort((a, b) => b - a)[i]} roleAt={i => (i === step.index ? 'placing' : '')} />
    <RecordStateTable label={`Buckets (target ${step.target ?? '…'})`} columns={['bucket', 'sum']}
      rows={step.sums.map((sum, b) => ({ bucket: b + 1, sum }))} activeRow={step.bucket ?? -1} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why largest first:</strong> big numbers are the hardest to place, so failing early prunes most of the search.</p>
  </>} />
}
