import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Clear the difference array for points 0 through 101.' },
    { id: 'mark', label: 'Mark cars', description: 'Add one at each car’s start and remove it just after its end.' },
    { id: 'sweep', label: 'Sweep points', description: 'Add the running total to each point and count the covered ones.' },
    { id: 'done', label: 'Complete', description: 'Report how many points are covered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums as [start, end] pairs (1 to 100)',
  url: 'https://leetcode.com/problems/points-that-intersect-with-cars/',
  complexity: 'O(n + 100) time and O(100) space for n cars.',
  examples: [
    { label: 'Example 1', input: '{"nums":[[3,6],[1,5],[4,7]]}' },
    { label: 'Example 2', input: '{"nums":[[1,3],[5,8]]}' },
    { label: "Single car", input: "{\"nums\":[[5,5]]}" },
    { label: "Same interval repeated", input: "{\"nums\":[[2,4],[2,4],[2,4]]}" },
    { label: "Full range and ends", input: "{\"nums\":[[1,100],[1,1],[100,100]]}" },
    { label: "Long run: 100 seeded intervals", input: "{\"nums\":[[82,92],[80,98],[10,86],[84,91],[18,73],[32,77],[54,97],[24,77],[10,99],[4,91],[54,72],[36,88],[62,76],[68,75],[66,96],[88,98],[66,98],[40,86],[6,57],[64,78],[94,99],[100,100],[98,100],[8,8],[82,84],[60,68],[6,76],[68,82],[14,39],[68,83],[54,98],[64,89],[98,98],[76,83],[10,14],[36,48],[26,33],[72,86],[46,85],[92,94],[54,79],[36,83],[46,80],[92,98],[34,97],[16,70],[6,81],[88,100],[38,66],[16,59],[38,99],[36,72],[82,97],[12,33],[10,50],[44,91],[78,82],[72,75],[22,88],[44,90],[54,97],[64,73],[90,91],[48,69],[86,89],[16,71],[18,53],[4,95],[62,68],[64,75],[62,79],[28,43],[50,62],[32,100],[90,97],[64,98],[94,100],[88,91],[82,95],[40,84],[26,88],[52,86],[34,98],[72,84],[54,84],[88,96],[86,100],[12,34],[42,100],[8,60],[18,65],[80,96],[58,82],[88,98],[26,73],[100,100],[30,52],[24,45],[34,56],[24,36]]}" },
  ],
}

export default function PointsWithCars() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const covered = new Set(run.input.nums.flatMap(([s, e]) => Array.from({ length: e - s + 1 }, (_, i) => s + i)))
    return <>
      <IndexedSequence label="Points 1 to 100" length={100} indexOffset={1}
        valueAt={i => (covered.has(i + 1) ? 'covered' : 'open')}
        active={step.point === null ? -1 : step.point - 1}
        roleAt={i => (step.point !== null && i + 1 <= step.point && covered.has(i + 1) ? 'counted' : '')} />
      <output aria-label="Current step">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each car adds one at its start and removes one just after its end. A running total over the points is positive exactly where some car is present.</p>
    <p>Sweeping the 100 points once gives the answer without checking every car for every point.</p>
  </>} />
}
