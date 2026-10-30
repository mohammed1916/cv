import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: "Sort the sides ascending." },
    { id: 'init', label: 'Total', description: "Start with the total of all sides." },
    { id: 'loop', label: 'Scan', description: "Try the largest remaining side." },
    { id: 'check', label: 'Strict test', description: "Check the strict polygon inequality." },
    { id: 'shrink', label: 'Drop', description: "Remove a side that cannot be longest." },
    { id: 'done', label: 'Result', description: "Report the perimeter or -1." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON object: {\"nums\": [...]} (3 to 50 sides for this view)",
  url: "https://leetcode.com/problems/find-polygon-with-the-largest-perimeter/",
  complexity: "O(n log n) time for the sort, O(1) extra space. The visualization caps nums at 50 values; LeetCode allows up to 100000.",
  examples: [
    { label: "[2,3,4]", input: "{\"nums\": [2, 3, 4]}" },
    { label: "[1,2,3]", input: "{\"nums\": [1, 2, 3]}" },
    { label: "[3,3,3,20]", input: "{\"nums\": [3, 3, 3, 20]}" },
    { label: "[5,5,50]", input: "{\"nums\": [5, 5, 50]}" },
  ],
}

export default function Problem2971() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label={"Sorted sides (ascending)"} length={step.seq.length} valueAt={i => step.seq[i]} active={step.index} />
      <dl className="algorithm-workspace__stats">
        {Object.entries(step.stats || {}).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd></div>)}
      </dl>
      <p role="status">{step.message}</p>
      <p>Result: <output>{JSON.stringify(run.result)}</output></p>
    </>}
    renderReasoning={({ step }) => <>
      <p>{"The longest side must be strictly shorter than the sum of the others. Sorting lets the scan test only the largest candidate at each step."}</p>
      <p>{step.message}</p>
    </>}
  />
}
