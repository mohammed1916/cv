import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  number: '1481',
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array and removals (JSON object with arr and k)',
  url: 'https://leetcode.com/problems/least-number-of-unique-integers-after-k-removals/',
  complexity: 'O(n log n) time because of the sort, and O(n) space for the counts. The visualization caps arr at 60 values.',
  examples: [
    { label: 'Sample', input: '{"arr":[7,7,8,9,9,9,10,10],"k":4}' },
    { label: 'Ties', input: '{"arr":[1,2,3,4],"k":2}' },
    { label: 'All removable', input: '{"arr":[5,5,5],"k":3}' },
  ],
}

export default function LeastUniqueAfterRemovalsVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StackLane title="Values still present" items={step.scene.groups.filter(g => g.status !== 'removed').map(g => `${g.value}×${g.count}`)}
      dropped={step.scene.groups.filter(g => g.status === 'removed').map(g => `${g.value}×${g.count}`)}
      note={`${step.scene.remaining} removals left · ${step.scene.distinct} distinct`} />
  </>} renderReasoning={({ step }) => <>
    <p>Removing every copy of a value is the only way to lose a distinct value. Spending removals on the values with the fewest copies therefore removes the most distinct values.</p>
    <p>{step.message}</p>
  </>} />
}
