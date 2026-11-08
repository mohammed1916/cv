import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LightCycleView from './LightCycleView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: "start", label: "Start", description: "Find the longest green." },
    { id: "green", label: "Green", description: "A light is green for this car." },
    { id: "red", label: "Red", description: "The car waits for the cycle to restart." },
    { id: "done", label: "Result", description: "Report the worst wait." },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with period, green (one green time per light) and arrivals, e.g. {\"period\":12,\"green\":[4,9],\"arrivals\":[3,7,14,20]}",
  url: "https://leetcode.com/problems/minimize-the-maximum-waiting-time-at-synchronized-traffic-lights/",
  complexity: "O(a) time for a arrivals after finding the longest green time. The visualization caps arrivals at 12.",
  examples: [
    { label: "Two lights", input: "{\"period\":12,\"green\":[4,9],\"arrivals\":[3,10,14,22]}" },
    { label: "Single light", input: "{\"period\":10,\"green\":[3],\"arrivals\":[5]}" },
    { label: "Smallest cycle", input: "{\"period\":2,\"green\":[1],\"arrivals\":[1]}" },
    { label: "Simultaneous arrivals", input: "{\"period\":10,\"green\":[5],\"arrivals\":[4,4,4]}" },
    { label: "Largest period and time", input: "{\"period\":1000,\"green\":[999],\"arrivals\":[1000000000]}" },
    { label: "Long run: four lights, 12 cars", input: "{\"period\":60,\"green\":[10,25,40,55],\"arrivals\":[46,128,223,368,11,251,389,492,99,319,215,285]}" },
  ],
}

export default function Problem4025() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <LightCycleView run={run} step={step} />} renderReasoning={({ step }) => <p>{step ? step.message : 'Press Play to start the trace.'}</p>} />
}
