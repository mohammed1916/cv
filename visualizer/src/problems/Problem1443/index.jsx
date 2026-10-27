import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Begin at vertex 0 with no time spent.' },
    { id: 'enter', label: 'Enter vertex', description: 'Record whether this vertex holds an apple.' },
    { id: 'trip', label: 'Add trip', description: 'A child subtree needs a visit, so this edge costs two seconds.' },
    { id: 'return', label: 'Return', description: 'Report whether this subtree needs a visit.' },
    { id: 'done', label: 'Complete', description: 'Report the total time.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree as JSON: n, edges, has_apple',
  url: 'https://leetcode.com/problems/minimum-time-to-collect-all-apples-in-a-tree/',
  complexity: 'O(n) time and O(n) space for the adjacency list and recursion. The visualization caps input at 12 vertices.',
  examples: [
    { label: 'Example 1', input: '{"n":7,"edges":[[0,1],[0,2],[1,4],[1,5],[2,3],[2,6]],"has_apple":[false,false,true,false,true,true,false]}' },
    { label: 'Example 2', input: '{"n":5,"edges":[[0,1],[1,2],[0,3],[3,4]],"has_apple":[false,false,false,false,false]}' },
  ],
}

export default function MinimumTimeToCollectApples() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const tags = {}
    run.input.has_apple.forEach((has, id) => { if (has) tags[id] = 'apple' })
    return <>
      <GraphTraversalView title="Tree rooted at 0" n={run.input.n} edges={run.input.edges} current={step.node}
        done={step.finished} tags={tags} />
      <output aria-label="Total time">{`Total time so far: ${step.total} seconds`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Every edge that leads to a subtree containing an apple must be walked down and back, so it costs two seconds.</p>
    <p>A depth-first walk from vertex 0 answers this in one pass: each child reports whether its subtree needs a visit.</p>
  </>} />
}
