import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'base', label: 'Root at 0', description: 'Count the correct guesses when rooted at vertex 0.' },
    { id: 'reroot', label: 'Move root', description: 'Shift the root across one edge and update only that edge.' },
    { id: 'done', label: 'Count roots', description: 'Count roots with at least k correct guesses.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree and guesses as JSON: edges, guesses, k',
  url: 'https://leetcode.com/problems/count-number-of-possible-root-nodes/',
  complexity: 'O(n) time and O(n) space for one walk and one rerooting pass. The visualization caps the tree at 10 vertices.',
  examples: [
    { label: 'Example 1', input: '{"edges":[[0,1],[1,2],[1,3],[4,2]],"guesses":[[1,3],[0,1],[1,0],[2,4]],"k":3}' },
    { label: 'Path', input: '{"edges":[[0,1],[1,2],[2,3],[3,4]],"guesses":[[1,0],[3,4],[2,1],[3,2]],"k":1}' },
  ],
}

export default function CountPossibleRoots() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const tags = {}
    step.correct.forEach((count, id) => { tags[id] = `${count}/${step.k}` })
    return <>
      <GraphTraversalView title="Tree (tag: correct guesses / k)" n={run.input.edges.length + 1} edges={run.input.edges}
        current={step.node} tags={tags} />
      <table aria-label="Correct guesses per root">
        <thead><tr><th>Root</th><th>Correct</th><th>Counts</th></tr></thead>
        <tbody>{step.correct.map((count, id) => (
          <tr key={id} className={id === step.node ? 'is-current' : ''}><td>{id}</td><td>{count}</td><td>{count >= step.k ? 'yes' : 'no'}</td></tr>
        ))}</tbody>
      </table>
    </>
  }} renderReasoning={() => <>
    <p>Rooting at 0 gives a starting count. Moving the root from a parent p to its child v flips only the edge between them: the guess p to v stops being correct and v to p becomes correct.</p>
    <p>Every vertex is therefore scored in constant time from its parent, so all roots are checked in one pass.</p>
  </>} />
}
