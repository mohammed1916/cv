import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start node', description: 'Begin a walk from this node.' },
    { id: 'visit', label: 'Visit', description: 'A path reached here is special but not better.' },
    { id: 'record', label: 'Record', description: 'A new best length, or the same length with fewer nodes.' },
    { id: 'stop', label: 'Stop', description: 'The value repeats on the path, so stop here.' },
    { id: 'done', label: 'Result', description: 'Report the best length and node count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (values 0 to 4) and edges [u,v,w] (tree)',
  url: 'https://leetcode.com/problems/longest-special-path/',
  complexity: 'O(n^2) time for walks from every node, O(n) space per walk. The visualization caps n at 8.',
  examples: [
    { label: 'Distinct', input: '{"nums":[1,2,3],"edges":[[0,1,2],[1,2,3]]}' },
    { label: 'Repeat', input: '{"nums":[1,2,1],"edges":[[0,1,2],[1,2,3]]}' },
  ],
}

export default function LongestSpecialPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.nums.length
    const labels = run.input.nums.map((value, i) => `${i}:${value}`)
    const edges = run.input.edges.map(([u, v]) => [u, v])
    return <>
      <GraphTraversalView title="Tree (node:value)" n={n} edges={edges} labels={labels}
        current={step.node >= 0 ? step.node : null} />
      <output aria-label="Best special path">{`Best so far: length ${step.best[0]}, ${step.best[1]} node${step.best[1] === 1 ? '' : 's'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A special path has no repeated values, so a walk from a start node stops as soon as it reaches a value already on its path.</p>
    <p>Among special paths the longest wins, and between equal lengths the one with fewer nodes wins.</p>
  </>} />
}
