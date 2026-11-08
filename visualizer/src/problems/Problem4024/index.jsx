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
    { label: "Single drone on target", input: "{\"target\":[0,0],\"drones\":[[0,0,1]]}" },
    { label: "Two drones at equal distance", input: "{\"target\":[0,0],\"drones\":[[3,0,5],[0,3,5]]}" },
    { label: "Corner coordinates", input: "{\"target\":[-25,25],\"drones\":[[25,-25,100],[-25,25,1]]}" },
    { label: "Long run: ten drones", input: "{\"target\":[-21,-17],\"drones\":[[17,18,6],[-10,-12,59],[22,20,35],[-25,20,70],[19,-19,58],[-14,-11,65],[2,-4,58],[9,14,21],[16,2,15],[-17,-3,53]]}" },
  ],
}

export default function Problem4024() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <DroneRangeView run={run} step={step} />} renderReasoning={({ step }) => <p>{step ? step.message : 'Press Play to start the trace.'}</p>} />
}
