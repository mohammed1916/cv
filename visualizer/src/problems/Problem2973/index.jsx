import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import SubtreeChipsView from './SubtreeChipsView'
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
    { label: "Two nodes", input: '{"edges":[[0,1]],"cost":[5,-3]}' },
    { label: "Equal costs", input: '{"edges":[[0,1],[1,2]],"cost":[2,2,2]}' },
    { label: "Largest magnitudes", input: '{"edges":[[0,1],[1,2]],"cost":[10000,-10000,1]}' },
    { label: "Long run: 50 nodes", input: '{"edges":[[0,1],[0,2],[2,3],[2,4],[3,5],[5,6],[1,7],[6,8],[0,9],[0,10],[7,11],[1,12],[1,13],[5,14],[10,15],[14,16],[6,17],[0,18],[13,19],[13,20],[19,21],[15,22],[13,23],[8,24],[22,25],[12,26],[24,27],[21,28],[17,29],[27,30],[9,31],[1,32],[18,33],[13,34],[32,35],[8,36],[9,37],[15,38],[36,39],[25,40],[6,41],[11,42],[12,43],[17,44],[26,45],[0,46],[30,47],[27,48],[23,49]],"cost":[13,57,75,55,41,39,-24,-32,9,83,19,61,67,-46,-90,45,13,39,-40,-62,67,-56,-30,-96,71,85,-6,13,-70,-50,69,-22,47,33,33,-56,-74,-18,9,-96,-86,1,-72,57,-6,-64,33,-38,1,69]}' },
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
      {step.values && <SubtreeChipsView values={step.values} pick={step.pick} best={step.stats.best} />}
      <p role="status">{step.message}</p>
      <p>Result: <output>{JSON.stringify(run.result)}</output></p>
    </>}
    renderReasoning={({ step }) => <>
      <p>{"A subtree with at least three nodes can be paired with its three largest costs or its two smallest and largest. Negative products are clamped to zero."}</p>
      <p>{step.message}</p>
    </>}
  />
}
