import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import { buildTrace, parseInput, code, python, rootTree } from './algorithm'

const definition = {
  phases: [
    { id: 'enter', label: 'Enter', description: "Enter a node and start its subtree costs." },
    { id: 'merge', label: 'Merge', description: "Merge a child subtree." },
    { id: 'small', label: 'Small', description: "Subtree has fewer than 3 nodes." },
    { id: 'large', label: 'Triple', description: "Compute the best triple product." },
    { id: 'return', label: 'Return', description: "Return subtree costs to the parent." },
    { id: 'done', label: 'Result', description: "All nodes have coins." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON object: {\"edges\": [[a,b],...], \"cost\": [...]} (2 to 50 nodes for this view)",
  url: "https://leetcode.com/problems/find-number-of-coins-to-place-in-tree-nodes/",
  complexity: "O(n^2 log n) for this teaching version (sorts each subtree); a keep-top-3 and bottom-2 DFS is O(n). The visualization caps the tree at 50 nodes.",
  examples: [
    { label: "star [1..6]", input: "{\"edges\": [[0,1],[0,2],[0,3],[0,4],[0,5]], \"cost\": [1, 2, 3, 4, 5, 6]}" },
    { label: "branching", input: "{\"edges\": [[0,1],[0,2],[1,3],[1,4],[1,5],[2,6],[2,7],[2,8]], \"cost\": [1, 4, 2, 3, 5, 7, 8, -4, 2]}" },
    { label: "negative", input: "{\"edges\": [[0,1],[0,2]], \"cost\": [1, 2, -2]}" },
  ],
}

export default function Problem2973() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label={"Coins placed per node"} length={step.seq.length} valueAt={i => step.seq[i]} active={step.index} />
      <RootedTreeDiagram title="Tree rooted at node 0" root={rootTree(run.input)} roles={step.index >= 0 ? { [step.index]: 'focus' } : {}} />
      <dl className="algorithm-workspace__stats">
        {Object.entries(step.stats || {}).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd></div>)}
      </dl>
      <p role="status">{step.message}</p>
      <p>Result: <output>{JSON.stringify(run.result)}</output></p>
    </>}
    renderReasoning={({ step }) => <>
      <p>{"A subtree with at least three nodes can be paired with its three largest costs or its two smallest and largest. Negative products are clamped to zero."}</p>
      <p>{step.message}</p>
    </>}
  />
}
