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
    { label: "Four sides", input: "{\"nums\": [4, 9, 5, 6]}" },
    { label: "Too long a side", input: "{\"nums\": [2, 2, 9]}" },
    { label: "Equal sides", input: "{\"nums\": [3, 3, 3, 3]}" },
    { label: "[5,5,50]", input: "{\"nums\": [5, 5, 50]}" },
    { label: "Smallest polygon", input: '{"nums":[1,1,1]}' },
    { label: "Five equal sides", input: '{"nums":[7,7,7,7,7]}' },
    { label: "Longest side equals the rest", input: '{"nums":[1,2,3]}' },
    { label: "Largest values", input: '{"nums":[1000000000,1000000000,1000000000]}' },
    { label: "Long run: 50 sides", input: '{"nums":[2,26,9,91,93,56,17,9,83,76,96,24,9,98,34,81,73,29,56,68,74,54,63,69,69,9,44,82,35,89,88,42,23,95,48,39,96,13,20,21,25,99,36,6,52,18,52,25,79,44]}' },
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
