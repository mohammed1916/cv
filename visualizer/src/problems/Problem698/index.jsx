import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Target', description: 'Each bucket must reach total ÷ k.' },
    { id: 'place', label: 'Place number', description: 'Put the next largest number into a bucket that still fits.' },
    { id: 'undo', label: 'Backtrack', description: 'The branch failed; remove the number and try another bucket.' },
    { id: 'done', label: 'Complete', description: 'Report whether the split exists.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Input (JSON object with nums and k)',
  url: 'https://leetcode.com/problems/partition-to-k-equal-sum-subsets/',
  complexity: 'Exponential in the worst case; sorting descending and skipping equal empty buckets prune most branches.',
  examples: [
    { label: 'Splits', input: '{"nums":[4,3,2,3,5,2,1],"k":4}' },
    { label: 'Impossible', input: '{"nums":[1,2,3,4],"k":3}' },
  ],
}

export default function PartitionKSubsets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <div aria-label="Buckets" style={{ display: 'grid', gap: 8 }}>
      {step.buckets.map((b, i) => <StackLane key={i} title={`Bucket ${i}`} items={b.map(String)} note={step.target ? `${step.sums[i]} / ${step.target}` : ''} />)}
    </div>
    <output aria-label="Status">{step.phase === 'done' ? `Result: ${String(step.result)}` : step.message}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Pruning:</strong> placing into an empty bucket only once avoids repeating the same branch, and the descending order fails fast on oversized values.</p>
  </>} />
}
