import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import StationGapView from './StationGapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: "earliest", label: "Early", description: "Place this worker as early as possible." },
    { id: "latest", label: "Late", description: "Place this worker as late as possible." },
    { id: "pair", label: "Pair", description: "Measure the gap for this pair." },
    { id: "skip", label: "Skipped", description: "The pair cannot be ordered." },
    { id: "done", label: "Result", description: "Report the widest gap." },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with workers and stations (lowercase strings), e.g. {\"workers\":\"abb\",\"stations\":\"abacbb\"}",
  url: "https://leetcode.com/problems/maximum-gap-between-stations/",
  complexity: "O(n + m) time for n workers and m stations, using greedy scans.",
  examples: [
    { label: "Repeated letter", input: "{\"workers\":\"abb\",\"stations\":\"abacbb\"}" },
    { label: "Offset start", input: "{\"workers\":\"ab\",\"stations\":\"cabab\"}" },
  ],
}

export default function Problem4026() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <StationGapView run={run} step={step} />} renderReasoning={({ step }) => <p>{step ? step.message : 'Press Play to start the trace.'}</p>} />
}
