import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ElevatorLineView from './ElevatorLineView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: "start", label: "Start", description: "Begin at the start floor." },
    { id: "expand", label: "Expand", description: "Grow the interval from this end." },
    { id: "done", label: "Result", description: "Report the cheapest total." },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with start and floors (distinct requested floors), e.g. {\"start\":4,\"floors\":[1,6,9]}",
  url: "https://leetcode.com/problems/elevator-requests-ii/",
  complexity: "O(n^2) interval states with two ends each, where n counts the distinct floors plus the start. The visualization caps floors at 8.",
  examples: [
    { label: "Spread requests", input: "{\"start\":4,\"floors\":[1,6,9]}" },
    { label: "Start inside", input: "{\"start\":2,\"floors\":[2,3,7]}" },
  ],
}

export default function Problem4023() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <ElevatorLineView run={run} step={step} />} renderReasoning={({ step }) => <p>{step ? step.message : 'Press Play to start the trace.'}</p>} />
}
