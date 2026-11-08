import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BridgeView from './BridgeView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3323',
  phases: [
    { id: 'sort', label: 'Sort', description: 'Order the intervals by start.' },
    { id: 'merge', label: 'Merge', description: 'Join intervals that share a point into groups.' },
    { id: 'count', label: 'Count', description: 'Count the groups before insertion.' },
    { id: 'start', label: 'Setup', description: 'Initialise the best saving and the frontier.' },
    { id: 'sweep', label: 'Sweep', description: 'Choose the left end of the bridge.' },
    { id: 'extend', label: 'Extend', description: 'A bridge of length at most k reaches another group.' },
    { id: 'stop', label: 'Stop', description: 'The next bridge is too long.' },
    { id: 'best', label: 'Best', description: 'Record how many groups this bridge saves.' },
    { id: 'done', label: 'Result', description: 'Subtract the best saving from the group count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with intervals ([start, end] pairs) and k',
  url: 'https://leetcode.com/problems/minimize-connected-groups-by-inserting-interval/',
  complexity: 'O(n log n) time for the sort and O(n) for the sweep; O(n) space. Reading used here: the added interval has integer ends and length at most k, and sharing an endpoint connects two intervals. The visualization caps the input at 8 intervals on coordinates 0 to 30.',
  examples: [
    { label: 'Two bridges', input: '{"intervals":[[1,3],[2,5],[8,10],[15,18]],"k":3}' },
    { label: 'Short bridges only', input: '{"intervals":[[0,2],[4,5],[9,11],[12,12],[20,21]],"k":4}' },
    { label: 'Single point interval', input: '{"intervals":[[4,4]],"k":1}' },
    { label: 'Equal intervals', input: '{"intervals":[[5,5],[5,5]],"k":1}' },
    { label: 'Widest allowed interval', input: '{"intervals":[[0,30]],"k":0}' },
    { label: 'Long run: 8 intervals', input: '{"intervals":[[20,23],[19,19],[9,9],[4,6],[17,19],[2,4],[0,1],[16,20]],"k":4}' },
  ],
}

export default function MinimizeConnectedGroups() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BridgeView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <>
          <p>Intervals that touch form one group. Groups are sorted, so a bridge from the end of group i to the start of group j covers every group between them.</p>
          <p>{step.bridge ? `The current bridge spans ${step.bridge[1] - step.bridge[0]} against k = ${step.k}.` : 'No bridge is being checked on this frame.'}</p>
        </>
      )}
    />
  )
}
