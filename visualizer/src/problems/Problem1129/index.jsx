import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at node 0; the first edge may be red or blue.' },
    { id: 'pop', label: 'Expand', description: 'Take a (node, last colour) state and follow edges of the other colour.' },
    { id: 'reach', label: 'First reach', description: 'This node is reached for the first time, so this distance is its answer.' },
    { id: 'extend', label: 'Extend', description: 'This colour state is new, but the node already has a shorter answer.' },
    { id: 'done', label: 'Complete', description: 'Report the shortest alternating length for every node.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n, red_edges and blue_edges (directed pairs)',
  url: 'https://leetcode.com/problems/shortest-path-with-alternating-colors/',
  complexity: 'O(n + e) time over the 2n colour states. The visualization caps the graph at 10 nodes.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"red_edges":[[0,1],[1,2]],"blue_edges":[]}' },
    { label: 'Example 2', input: '{"n":3,"red_edges":[[0,1]],"blue_edges":[[1,2]]}' },
  ],
}

export default function ShortestAlternatingPaths() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n, red_edges: red, blue_edges: blue } = run.input
    const edges = [...red, ...blue]
    const tags = {}
    step.answers.forEach((d, id) => { tags[id] = d === -1 ? 'none' : `${d}` })
    return <>
      <GraphTraversalView title="Directed graph" n={n} edges={edges} directed current={step.current} tags={tags} showFrontier={false} />
      <output aria-label="Edges by colour">{`Red: ${red.map(e => `${e[0]}->${e[1]}`).join(', ') || 'none'}. Blue: ${blue.map(e => `${e[0]}->${e[1]}`).join(', ') || 'none'}.`}</output>
      <output aria-label="Current state">{`Last colour: ${step.last ?? '-'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The colour of the edge used to arrive is part of the state, so a node reached by red and by blue are different situations.</p>
    <p>Breadth-first order guarantees the first time a node gets an answer is its shortest alternating length.</p>
  </>} />
}
