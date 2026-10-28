import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the leaves.' },
    { id: 'leaf', label: 'Leaf', description: 'A leaf path total is its own cost.' },
    { id: 'node', label: 'Node', description: 'Lift children that fall short of the largest child total.' },
    { id: 'done', label: 'Complete', description: 'Report how many nodes were raised.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, edges and cost (JSON)',
  url: 'https://leetcode.com/problems/minimum-increments-to-equalize-leaf-paths/',
  complexity: 'O(n) time. The visualization caps n at 8.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"edges":[[0,1],[0,2]],"cost":[2,1,3]}' },
    { label: 'Example 3', input: '{"n":5,"edges":[[0,4],[0,1],[1,2],[1,3]],"cost":[3,4,1,1,7]}' },
  ],
}

export default function EqualizeLeafPaths() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Node costs" length={run.input.n} valueAt={i => run.input.cost[i]} active={step.node ?? -1} />
    <output aria-label="Raised">{`Nodes raised so far: ${step.raised}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Raising a node shifts every path through it equally, so the only real differences are between siblings, and each sibling that falls short needs one raise.</p>
  </>} />
}
