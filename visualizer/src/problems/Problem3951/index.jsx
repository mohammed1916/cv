import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BrightnessTimelineView from './BrightnessTimelineView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Need', description: 'Work out how many bulbs one time unit requires.' },
    { id: 'sort', label: 'Sort', description: 'Order the requested intervals by start.' },
    { id: 'merge', label: 'Merge', description: 'Join overlapping or touching intervals.' },
    { id: 'add', label: 'Add', description: 'Charge the energy for each merged block.' },
    { id: 'done', label: 'Result', description: 'Report the total energy.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with bulbs, brightness and intervals ([start, end] pairs)',
  url: 'https://leetcode.com/problems/minimum-energy-to-maintain-brightness/',
  complexity: 'O(k log k) for k intervals after sorting; the visual caps the line at 12 bulbs and 8 intervals.',
  examples: [
    { label: 'Two blocks', input: '{"bulbs":6,"brightness":3,"intervals":[[0,2],[5,6]]}' },
    { label: 'Overlap', input: '{"bulbs":8,"brightness":5,"intervals":[[1,4],[3,6],[10,10]]}' },
    { label: 'Single bulb', input: '{"bulbs":1,"brightness":1,"intervals":[[0,0]]}' },
    { label: 'Repeated interval', input: '{"bulbs":4,"brightness":2,"intervals":[[0,1],[0,1]]}' },
    { label: 'Full range and edge points', input: '{"bulbs":12,"brightness":12,"intervals":[[0,40],[40,40],[0,0],[20,20],[5,35],[1,2],[3,4],[39,40]]}' },
    { label: 'Long run: 8 intervals', input: '{"bulbs":12,"brightness":5,"intervals":[[20,20],[5,38],[34,34],[10,39],[5,10],[38,40],[16,18],[9,27]]}' },
  ],
}

export default function MinimumEnergyToMaintainBrightness() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <BrightnessTimelineView run={run} step={step} />} renderReasoning={({ run, step }) => (
    <p>
      {step.message} Every covered time unit costs the same number of active bulbs, so the answer is that cost times the number of distinct covered times.
      {run ? ` Final energy: ${run.result}.` : ''}
    </p>
  )} />
}
