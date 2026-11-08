import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PowerStateView from './PowerStateView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the source with full power.' },
    { id: 'pick', label: 'Pick', description: 'Finish the earliest unfinished state.' },
    { id: 'relax', label: 'Depart', description: 'Leave a vertex if power covers its cost.' },
    { id: 'arrive', label: 'Arrive', description: 'The target ends its walk.' },
    { id: 'done', label: 'Result', description: 'Choose the earliest arrival with the most power left.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with cost, edges, source, target and power',
  url: 'https://leetcode.com/problems/minimum-time-to-reach-target-with-limited-power/',
  complexity: 'Dijkstra over (vertex, power) states. The visual scans for the earliest state, so it is O(S^2) on these small tables.',
  examples: [
    { label: 'Cheaper hop', input: '{"cost":[2,1,3,1],"edges":[[0,1,4],[0,2,1],[1,3,2],[2,3,1]],"source":0,"target":3,"power":4}' },
    { label: 'Direct shortcut', input: '{"cost":[1,1,1],"edges":[[0,1,2],[0,2,2],[1,2,1]],"source":0,"target":2,"power":3}' },
    { label: "Same source and target", input: '{"cost":[3],"edges":[],"source":0,"target":0,"power":1}' },
    { label: "Equal travel times tie", input: '{"cost":[2,2,2],"edges":[[0,1,5],[1,2,5],[0,2,10]],"source":0,"target":2,"power":2}' },
    { label: "Maximum costs and times", input: '{"cost":[6,6,6,6,6,6,6,6],"edges":[[0,1,20],[1,2,20],[2,3,20],[3,4,20],[4,5,20],[5,6,20],[6,7,20]],"source":0,"target":7,"power":8}' },
    { label: "Long run: 8 vertices", input: '{"cost":[5,1,6,6,6,2,4,2],"edges":[[6,0,19],[7,6,6],[4,1,14],[0,2,5],[4,1,2],[1,6,16],[6,2,20],[7,6,9],[7,2,11],[2,1,4],[1,7,10],[7,2,8]],"source":0,"target":7,"power":3}' },
  ],
}

export default function MinimumTimeToReachTargetWithLimitedPower() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <PowerStateView run={run} step={step} />} renderReasoning={({ run, step }) => (
    <p>Time and remaining power form the state, so the fastest arrival is found by Dijkstra on those states and ties are broken by power left. {step.message} {run ? `Answer: [${run.result.join(', ')}].` : ''}</p>
  )} />
}
