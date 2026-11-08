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
    { label: "Smallest array", input: "{\"nums\":[0,0,0],\"queries\":[[1,0,2]]}" },
    { label: "Equal neighbours are not peaks", input: "{\"nums\":[4,4,4,4],\"queries\":[[1,0,3],[2,1,9],[1,0,3]]}" },
    { label: "Largest value update", input: "{\"nums\":[100000,0,100000,0,100000],\"queries\":[[1,0,4],[2,1,100000],[1,0,4]]}" },
    { label: "Monotone range has no peak", input: "{\"nums\":[1,2,3,4],\"queries\":[[1,0,3]]}" },
    { label: "Long run: 14 values, 10 queries", input: "{\"nums\":[9029,57535,63342,60250,27805,98382,65789,79970,9406,68952,71339,8634,81668,2924],\"queries\":[[1,9,12],[1,5,8],[2,2,87785],[1,5,9],[1,3,4],[2,6,47850],[1,8,11],[1,10,11],[2,12,62727],[1,0,5]]}" },
  ],
}

export default function Problem4017() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <PeakRangeView run={run} step={step} />} renderReasoning={({ step }) => <p>{step ? step.message : 'Press Play to start the trace.'}</p>} />
}
