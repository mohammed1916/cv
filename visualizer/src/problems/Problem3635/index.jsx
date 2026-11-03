import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing is chosen; the best finish is unbounded.' },
    { id: 'land', label: 'Land first', description: 'Take a land ride, then a water ride when it opens.' },
    { id: 'water', label: 'Water first', description: 'Take a water ride, then a land ride when it opens.' },
    { id: 'done', label: 'Result', description: 'The smallest finish over every schedule.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with land and water, each a list of [opening time, duration] rides',
  url: 'https://leetcode.com/problems/earliest-finish-time-for-land-and-water-rides-ii/',
  complexity: 'O(L * W) time for L land rides and W water rides. The visualization caps each list at 6 rides.',
  examples: [
    { label: 'Example', input: '{"land":[[2,8]],"water":[[6,3]]}' },
    { label: 'Several rides', input: '{"land":[[2,15],[30,5]],"water":[[20,10],[40,5]]}' },
  ],
}

export default function EarliestFinishLandAndWater() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <div className="algorithm-workspace__rides" aria-label="Rides">
      <ol aria-label="Land rides">{run.input.land.map(([open, dur], idx) => <li key={idx} data-chosen={step.a === idx ? 'yes' : undefined}>{`land ${idx}: opens ${open}, lasts ${dur}`}</li>)}</ol>
      <ol aria-label="Water rides">{run.input.water.map(([open, dur], idx) => <li key={idx} data-chosen={step.b === idx ? 'yes' : undefined}>{`water ${idx}: opens ${open}, lasts ${dur}`}</li>)}</ol>
    </div>
    <output aria-label="Schedule check">{`${step.order ? `${step.order}: land ${step.a}, water ${step.b}, finish ${step.finish}` : 'no schedule yet'}; best ${step.best === null || step.best === undefined ? 'none' : step.best === Infinity ? 'unbounded' : step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Pick one land ride and one water ride. Whichever goes first ends at its own finish time; the second ride starts at the later of that moment and its opening time.</p>
    <p>Trying both orders for every pair covers every schedule, so the smallest finish among them is the answer.</p>
  </>} />
}
