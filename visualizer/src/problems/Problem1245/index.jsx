import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TreeWaveView from './TreeWaveView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1245',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and edges ([a, b] pairs on nodes 0 to n-1)',
  url: 'https://leetcode.com/problems/tree-diameter/description/',
  complexity: 'O(n) time and O(n) space for the two breadth-first sweeps. The visualization caps the tree at 15 nodes; the draft does not state an exact official bound.',
  examples: [
    { label: 'Five nodes', input: '{"n":5,"edges":[[0,1],[1,2],[1,3],[2,4]]}' },
    { label: 'Path', input: '{"n":4,"edges":[[0,1],[1,2],[2,3]]}' },
    { label: 'Single node', input: '{"n":1,"edges":[]}' },
  ],
}

export default function Problem1245TreeDiameter() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TreeWaveView run={run} step={step} />}
      renderReasoning={() => (
        <p>In a tree, the farthest node from any start is an endpoint of some longest path. Sweeping from node 0 finds one such endpoint, and sweeping again from it finds the other end of the diameter.</p>
      )}
    />
  )
}
