import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'init', label: 'Setup', description: "Start with zero counts." },
    { id: 'pair', label: 'Pair', description: "Check one house pair." },
    { id: 'done', label: 'Result', description: "Return the counts." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON object: {\"n\": 5, \"x\": 2, \"y\": 4} (2 to 30 houses for this view)",
  url: "https://leetcode.com/problems/count-the-number-of-houses-at-a-certain-distance-i/",
  complexity: "O(n^2) time and O(n) space. The visualization caps n at 30; LeetCode allows n up to 100.",
  examples: [
    { label: "n=5, x=2, y=4", input: "{\"n\": 5, \"x\": 2, \"y\": 4}" },
  ],
}

export default function Problem3015() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label={"Pair counts by distance"} length={step.seq.length} valueAt={i => step.seq[i]} active={step.index} />
      <dl className="algorithm-workspace__stats">
        {Object.entries(step.stats || {}).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd></div>)}
      </dl>
      <p role="status">{step.message}</p>
      <p>Result: <output>{JSON.stringify(run.result)}</output></p>
    </>}
    renderReasoning={({ step }) => <>
      <p>{"For a pair i < j the shortest route is either the line segment or the route through the extra street. Each unordered pair adds two ordered pairs."}</p>
      <p>{step.message}</p>
    </>}
  />
}
