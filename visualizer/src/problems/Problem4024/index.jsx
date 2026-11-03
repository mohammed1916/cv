import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DroneRangeView from './DroneRangeView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: "start", label: "Start", description: "Set the target." },
    { id: "take", label: "Nearest", description: "This drone is the nearest so far." },
    { id: "tie", label: "Tie", description: "Reachable but not closer." },
    { id: "out", label: "Out of reach", description: "The range is too short." },
    { id: "done", label: "Result", description: "Report the index or -1." },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with target [x, y] and drones ([x, y, range] entries), e.g. {\"target\":[1,2],\"drones\":[[0,0,5],[4,4,1]]}",
  url: "https://leetcode.com/problems/nearest-available-drone/",
  complexity: "O(d) time and O(1) extra space for d drones.",
  examples: [
    { label: "Tie at distance three", input: "{\"target\":[1,2],\"drones\":[[0,0,5],[4,4,1],[1,5,3]]}" },
    { label: "Nobody reaches", input: "{\"target\":[0,0],\"drones\":[[9,9,4]]}" },
  ],
}

export default function Problem4024() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <DroneRangeView run={run} step={step} />} renderReasoning={({ step }) => <p>{step ? step.message : 'Press Play to start the trace.'}</p>} />
}
