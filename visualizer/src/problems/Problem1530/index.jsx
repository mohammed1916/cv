import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No pairs counted yet.' },
    { id: 'leaf', label: 'Leaf', description: 'A leaf reports one leaf at depth zero.' },
    { id: 'merge', label: 'Merge', description: 'Pair leaves from the left and right subtrees whose depths sum to at most the limit.' },
    { id: 'done', label: 'Complete', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a level-order tree and distance, for example {"tree":[1,2,3],"distance":3}',
  url: 'https://leetcode.com/problems/number-of-good-leaf-nodes-pairs/',
  complexity: 'O(n * d^2) time, where d is the distance limit. The visualization caps input at 15 nodes.',
  examples: [
    { label: 'Example 1', input: '{"tree":[1,2,3,null,4],"distance":3}' },
    { label: 'Example 2', input: '{"tree":[1,2,3,4,5,6,7],"distance":3}' },
  ],
}

export default function GoodLeafPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    Object.keys(step.marks).forEach(id => { roles[id] = step.marks[id] === 'leaf' ? 'visited' : 'match' })
    if (step.node !== null) roles[step.node] = 'active'
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} tags={step.marks} />
      <output aria-label="Pairs">{`Good pairs so far: ${step.pairs}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each subtree reports how many leaves lie at each depth below it. Two leaves meet at their lowest common ancestor, so their distance is the sum of their depths measured from that node.</p>
    <p>Counting pairs at each meeting point, and never twice, gives the answer in one pass.</p>
  </>} />
}
