import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RiverView from './RiverView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, k, m, time and mul',
  url: 'https://leetcode.com/problems/minimum-time-to-transport-all-individuals/',
  complexity: 'There are at most 2ⁿ × 2 × m states. Forward trips from all states total at most 3ⁿ × m, so the search is about O(3ⁿ · m · n · log(2ⁿ · m)). The task allows n up to 12; the visualization caps n at 6 to keep the timeline readable.',
  examples: [
    { label: 'A detour pays off', input: '{"n":2,"k":2,"m":3,"time":[1,10],"mul":[2,1,0.5]}' },
    { label: 'Three people', input: '{"n":3,"k":2,"m":2,"time":[3,4,9],"mul":[1.5,0.5]}' },
    { label: 'Room for one', input: '{"n":3,"k":1,"m":2,"time":[4,6,3],"mul":[1,1.5]}' },
    { label: 'One person', input: '{"n":1,"k":3,"m":2,"time":[7],"mul":[0.5,2]}' },
  ],
}

export default function MinimumTimeToTransportAllIndividuals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <RiverView run={run} step={step} />} renderReasoning={() => <>
    <p>The future depends on only three things: who is still at camp, which bank has the boat, and the current stage. How the group got there does not matter, so each such combination is one state.</p>
    <p>Each trip is an edge whose weight is its length. All weights are positive, so Dijkstra applies: the first time a state with nobody at camp comes out of the queue, its time is the minimum.</p>
    <p>A greedy rule such as always sending the slowest together fails because stages change the price of a trip. A quick errand can move the stage to a cheap multiplier, and that can make the extra trips worthwhile.</p>
    <p>With k = 1 and more than one person, each crossing is undone by the return trip, so the queue runs out and the answer is -1.</p>
  </>} />
}
