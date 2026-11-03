import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ShaftView from './ShaftView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the table of subsets.' },
    { id: 'base', label: 'First stop', description: 'Start the route at one request.' },
    { id: 'relax', label: 'Extend', description: 'Travel to a new request and store a faster time.' },
    { id: 'keep', label: 'Keep', description: 'The stored time is already faster.' },
    { id: 'done', label: 'Result', description: 'Report the earliest finish.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with start and requests as [arrival, floor] pairs, e.g. {"start":1,"requests":[[0,5],[3,2]]}',
  url: 'https://leetcode.com/problems/elevator-requests-iii/',
  complexity: 'O(2^r * r^2) time and O(2^r * r) space for r requests. The visualization caps requests at 6, floors at 20 and arrival times at 30; the official limit is 16 requests.',
  examples: [
    { label: 'Three requests', input: '{"start":1,"requests":[[0,5],[3,2],[4,4]]}' },
    { label: 'Early arrival', input: '{"start":3,"requests":[[10,1],[0,4],[2,4],[12,2]]}' },
  ],
}

export default function ElevatorRequestsIII() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ShaftView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
