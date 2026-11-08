import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No rotations have run yet.' },
    { id: 'rotate', label: 'Rotate', description: 'Board up to four from the queue and pay the running cost.' },
    { id: 'record', label: 'New best', description: 'This rotation beats the best profit so far.' },
    { id: 'done', label: 'Complete', description: 'Report the best rotation count, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with customers, boardingCost and runningCost',
  url: 'https://leetcode.com/problems/maximum-profit-of-operating-a-centennial-wheel/',
  complexity: 'O(customers + rotations) time. The visualization caps the group list at 20.',
  examples: [
    { label: 'Example 1', input: '{"customers":[8,3],"boardingCost":5,"runningCost":6}' },
    { label: 'Example 2', input: '{"customers":[10,9,6],"boardingCost":6,"runningCost":4}' },
    { label: "Single group", input: "{\"customers\":[4],\"boardingCost\":5,\"runningCost\":6}" },
    { label: "Running and boarding cost equal", input: "{\"customers\":[2,2],\"boardingCost\":3,\"runningCost\":3}" },
    { label: "Twenty large groups", input: "{\"customers\":[50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50],\"boardingCost\":100,\"runningCost\":0}" },
    { label: "Long run: 20 groups", input: "{\"customers\":[5,20,10,4,42,16,18,50,2,33,25,40,2,8,21,27,22,48,25,23],\"boardingCost\":82,\"runningCost\":9}" },
  ],
}

export default function CentennialWheel() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Profit after each rotation" length={step.profits.length} valueAt={i => step.profits[i]}
      active={step.rotation - 1} roleAt={i => (i === step.bestRotation - 1 ? 'best' : '')} />
    <output aria-label="Queue">{`Rotation ${step.rotation}, waiting ${step.waiting}, best ${step.best} at rotation ${step.bestRotation}`}</output>
  </>} renderReasoning={() => <>
    <p>Each rotation boards at most four people from the queue. The profit after each rotation is boarding income minus the running cost so far.</p>
    <p>A later rotation only replaces the answer when its profit is strictly larger, so ties keep the earliest rotation.</p>
  </>} />
}
