import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CoordinatePlane from '../../components/shared/CoordinatePlane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No circle has been tried yet.' },
    { id: 'point', label: 'Dart centre', description: 'Centre a circle on one dart and count the darts it covers.' },
    { id: 'pair', label: 'Two-dart circle', description: 'Place a circle of radius r through two darts and count the darts it covers.' },
    { id: 'done', label: 'Complete', description: 'Report the largest count found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Darts (JSON object with points as [x, y] pairs and radius r)',
  url: 'https://leetcode.com/problems/maximum-number-of-darts-inside-of-a-circular-dartboard/',
  complexity: 'O(n^3) time for n darts, since each pair gives two centres checked against n darts. The visualization caps input at 8 darts.',
  examples: [
    { label: 'Four darts', input: '{"points":[[-2,0],[2,0],[0,2],[0,-2]],"r":2}' },
    { label: 'Six darts', input: '{"points":[[-3,0],[3,0],[2,6],[5,4],[0,9],[7,8]],"r":5}' },
    { label: 'One dart at the centre', input: '{"points":[[0,0]],"r":1}' },
    { label: 'Equal distances', input: '{"points":[[2,0],[0,2],[-2,0]],"r":2}' },
    { label: 'Largest: 8 darts, radius 5', input: '{"points":[[5,0],[0,5],[-5,0],[0,-5],[3,4],[-3,4],[4,-3],[-4,-3]],"r":5}' },
    { label: 'Long run: 8 darts', input: '{"points":[[-2,-5],[-1,-2],[1,0],[5,3],[-5,0],[4,-2],[4,0],[-3,-4]],"r":4}' },
  ],
}

export default function Dartboard() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <CoordinatePlane title={`Darts and the candidate centre (radius ${run.input.r})`}
      points={[
        ...run.input.points.map(([x, y], i) => ({ x, y, label: `${i + 1}`, role: step.covered[i] ? 'kept' : 'excluded' })),
        ...(step.center ? [{ x: step.center[0], y: step.center[1], label: 'centre', role: 'active' }] : []),
      ]} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Any circle of radius r that covers some darts can be slid until one dart sits on its edge, and then turned until a second one does.</p>
    <p>So the candidate centres are the darts themselves and the two centres of each circle through a pair of darts that are at most 2r apart.</p>
  </>} />
}
