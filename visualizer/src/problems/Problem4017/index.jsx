import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PeakRangeView from './PeakRangeView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: "start", label: "Start", description: "Mark the initial peaks." },
    { id: "update", label: "Update", description: "Change one value." },
    { id: "refresh", label: "Refresh", description: "Recompute nearby peak flags." },
    { id: "scan", label: "Scan", description: "Walk the start index leftward." },
    { id: "answer", label: "Answer", description: "Record the count." },
    { id: "done", label: "Result", description: "Return the answers in order." },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with nums and queries ([1, l, r] counts, [2, index, value] updates), e.g. {\"nums\":[1,3,2,4,1],\"queries\":[[1,0,4]]}",
  url: "https://leetcode.com/problems/peaks-in-array-ii/",
  complexity: "O(n) per range query and O(1) per update in this scan. The visualization caps n at 14; a tree-based structure would be needed for the largest official inputs.",
  examples: [
    { label: "Update then query", input: "{\"nums\":[1,3,2,4,1],\"queries\":[[1,0,4],[2,2,0],[1,0,4]]}" },
    { label: "Alternating", input: "{\"nums\":[5,1,5,1,5,1,5],\"queries\":[[1,0,6],[1,1,5]]}" },
  ],
}

export default function Problem4017() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <PeakRangeView run={run} step={step} />} renderReasoning={({ step }) => <p>{step ? step.message : 'Press Play to start the trace.'}</p>} />
}
