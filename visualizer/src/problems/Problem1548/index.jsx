import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LayeredCostView from './LayeredCostView'
import RoadMapView from './RoadMapView'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const definition = {
  number: '1548',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with n, roads ([a, b] pairs), names (one per vertex) and targetPath',
  url: 'https://leetcode.com/problems/the-most-similar-path-in-a-graph/description/',
  complexity: 'O(L * (n + m)) time and O(L * n) space for L target positions, n vertices and m roads. The visualization caps n at 6, roads at 15, names at 4 characters and L at 6. If no walk of the target length exists, the result is an empty list.',
  examples: [
    { label: 'Two vertices', input: '{"n":2,"roads":[[0,1]],"names":["A","B"],"targetPath":["A","B","A"]}' },
    { label: 'Mismatch needed', input: '{"n":5,"roads":[[0,1],[1,2],[2,3],[3,4],[0,4],[1,3]],"names":["Mon","Tue","Wed","Thu","Fri"],"targetPath":["Mon","Thu","Fri","Sat"]}' },
    { label: 'Single position', input: '{"n":3,"roads":[[0,1],[1,2]],"names":["x","y","z"],"targetPath":["y"]}' },
    { label: 'Single city', input: '{"n":1,"roads":[],"names":["A"],"targetPath":["A"]}' },
    { label: 'Unreachable step', input: '{"n":3,"roads":[[0,1]],"names":["A","B","C"],"targetPath":["A","C"]}' },
    { label: 'Two routes', input: '{"n":3,"roads":[[0,1],[1,2],[0,2]],"names":["X","Y","Z"],"targetPath":["X","Z"]}' },
    { label: 'Largest: 6 cities, 15 roads', input: '{"n":6,"roads":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,3],[1,4],[2,5],[0,2],[1,3],[2,4],[3,5],[4,0],[5,1]],"names":["Alp","Bet","Gam","Del","Eps","Zet"],"targetPath":["Alp","Bet","Gam","Del","Eps","Zet"]}' },
    { label: 'Long run: 15 roads', input: '{"n":6,"roads":[[0,1],[2,1],[1,2],[0,3],[5,1],[2,0],[5,2],[3,1],[0,4],[3,0],[3,1],[3,1],[0,2],[2,4],[1,0]],"names":["Ka","Lo","Mi","Ne","Ov","Pa"],"targetPath":["Pa","Ne","Mi","Lo","Ka","Ov"]}' },
  ],
}

export default function Problem1548Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <><RoadMapView run={run} step={step} /><LayeredCostView run={run} step={step} /></>}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
