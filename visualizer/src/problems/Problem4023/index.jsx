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
    { label: "Already at the requested floor", input: "{\"start\":1,\"floors\":[1]}" },
    { label: "Duplicate requests collapse", input: "{\"start\":5,\"floors\":[3,3,8,8]}" },
    { label: "Extreme floors", input: "{\"start\":1,\"floors\":[1000,1,500]}" },
    { label: "Long run: eight floors", input: "{\"start\":500,\"floors\":[91,86,242,953,86,122,748,188]}" },
  ],
}

export default function Problem4023() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <ElevatorLineView run={run} step={step} />} renderReasoning={({ step }) => <p>{step ? step.message : 'Press Play to start the trace.'}</p>} />
}
