import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import { bfsTutorial } from './tutorial'
import {bfsVisuals} from './visuals'

const definition = {
  number: '1971',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with n, edges, source and destination (e.g. {"n":6,"edges":[[0,1],[0,2],[3,5],[5,4],[4,3]],"source":0,"destination":5})',
  url: 'https://leetcode.com/problems/find-if-path-exists-in-graph/',
  complexity: 'O(V + E) time and O(V) space for the queue and visited marks.',
  examples: [
    { label: 'Triangle', input: '{"n":3,"edges":[[0,1],[1,2],[2,0]],"source":0,"destination":2}' },
    { label: 'Two components', input: '{"n":6,"edges":[[0,1],[0,2],[3,5],[5,4],[4,3]],"source":0,"destination":5}' },
  ],
}

export default function Problem1971Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    tutorial={bfsTutorial}
    visuals={bfsVisuals}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
