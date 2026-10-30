import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'init', label: 'Setup', description: "Start with no best rectangle." },
    { id: 'scan', label: 'Scan', description: "Read the next rectangle." },
    { id: 'update', label: 'Update', description: "Replace the best rectangle." },
    { id: 'done', label: 'Result', description: "Return the best area." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON object: {\"dimensions\": [[length,width],...]} (1 to 50 rectangles for this view)",
  url: "https://leetcode.com/problems/maximum-area-of-longest-diagonal-rectangle/",
  complexity: "O(n) time and O(1) extra space. The visualization caps input at 50 rectangles; LeetCode allows up to 100.",
  examples: [
    { label: "[[9,3],[8,6]]", input: "{\"dimensions\": [[9, 3], [8, 6]]}" },
    { label: "[[3,4],[4,3]]", input: "{\"dimensions\": [[3, 4], [4, 3]]}" },
  ],
}

export default function Problem3000() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label={"Squared diagonals per rectangle"} length={step.seq.length} valueAt={i => step.seq[i]} active={step.index} />
      <dl className="algorithm-workspace__stats">
        {Object.entries(step.stats || {}).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd></div>)}
      </dl>
      <p role="status">{step.message}</p>
      <p>Result: <output>{JSON.stringify(run.result)}</output></p>
    </>}
    renderReasoning={({ step }) => <>
      <p>{"The longest diagonal is the largest l*l + w*w. Ties on the diagonal are broken by the larger area."}</p>
      <p>{step.message}</p>
    </>}
  />
}
