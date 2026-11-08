import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Groups', description: 'Every number starts in its own group.' },
    { id: 'pair', label: 'Pair', description: 'Check the lcm of this pair; if it is within the threshold, merge their groups.' },
    { id: 'done', label: 'Complete', description: 'Report the number of groups left.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [...unique integers 1 to 30], "threshold": limit}',
  url: 'https://leetcode.com/problems/count-connected-components-in-lcm-graph/',
  complexity: 'O(n^2 log V) time for the pair checks with union-find. The visualization caps input at 8 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,3,4,6],"threshold":8}' },
    { label: 'Own case 1', input: '{"nums":[3,5,9,4,10],"threshold":6}' },
    { label: 'Single number', input: '{"nums":[5],"threshold":5}' },
    { label: 'Threshold equals a value', input: '{"nums":[2,3,6],"threshold":6}' },
    { label: 'Largest values, top threshold', input: '{"nums":[30,29,28,27,26,25,24,23],"threshold":60}' },
    { label: 'Long run: 8 numbers', input: '{"nums":[5,20,8,29,25,22,10,27],"threshold":40}' },
  ],
}

export default function LcmComponents() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers and their groups" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      roleAt={i => `group ${step.roots[i]}`} />
    <output aria-label="Groups">{`Groups so far: ${step.groups}`}</output>
    <p>{step.pair ? `Pair ${run.input.nums[step.pair[0]]} and ${run.input.nums[step.pair[1]]}: lcm ${step.lcm}.` : 'No pair checked in this step.'}</p>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Two numbers are linked when their lcm is within the threshold. Linked numbers are connected, so the answer is the number of groups that union-find leaves.</p>
    <p>The lcm is computed as a times b divided by their gcd, which avoids the large intermediate product of a and b.</p>
  </>} />
}
