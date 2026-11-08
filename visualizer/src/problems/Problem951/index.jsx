import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Two trees to compare.' },
    { id: 'visit', label: 'Visit pair', description: 'A recursive call compares one node from each tree.' },
    { id: 'base', label: 'Base case', description: 'Both empty, one empty, or different values.' },
    { id: 'flip', label: 'Try flip', description: 'The straight pairing failed; cross the children.' },
    { id: 'return', label: 'Return', description: 'A subtree pair gets its final verdict.' },
    { id: 'done', label: 'Complete', description: 'Overall answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Object {root1, root2} (JSON level-order)',
  url: 'https://leetcode.com/problems/flip-equivalent-binary-trees/',
  complexity: 'O(min(n1, n2)) for unique values; the visualization caps each tree at 30 nodes.',
  examples: [
    { label: 'Own case 1', input: '{"root1":[2,3,4,5,6,7,null,null,null,8,9],"root2":[2,4,3,null,7,5,6,null,null,null,null,9,8]}' },
    { label: 'Both empty', input: '{"root1":[],"root2":[]}' },
    { label: 'Not equivalent', input: '{"root1":[1,2,3],"root2":[1,2,4]}' },
    { label: 'Single node', input: '{"root1":[1],"root2":[1]}' },
    { label: 'Missing children', input: '{"root1":[1,null,2],"root2":[1,null,2]}' },
    { label: 'Null only on one side', input: '{"root1":[1,2,null,3],"root2":[1,2,null,3]}' },
    { label: 'Long run: 15 nodes', input: '{"root1":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],"root2":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]}' },
  ],
}

export default function FlipEquivalentTrees() {
  const rolesFor = (step, key) => {
    const roles = {}
    for (const pair of step.stack) roles[pair[key === 'a' ? 0 : 1]] = 'visited'
    if (step[key] !== null && step[key] !== undefined) roles[step[key]] = step.phase === 'base' || step.phase === 'return' ? (step.verdict ? 'match' : 'pruned') : 'active'
    return roles
  }
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <BinaryTreeLane title="Tree A (root1)" root={run.tree1} roles={rolesFor(step, 'a')} />
    <BinaryTreeLane title="Tree B (root2)" root={run.tree2} roles={rolesFor(step, 'b')} />
    <output aria-label="Verdict">{step.verdict === undefined ? 'Comparing...' : step.verdict ? 'Equivalent so far' : 'Not equivalent'}; recursion depth {step.stack.length}</output>
  </>} renderReasoning={() => <>
    <p>Flipping is allowed at any node, so two nodes match when their values are equal and their children match either straight or crossed. The recursion tries the straight pairing first, then the crossed one.</p>
    <p>Each pair of nodes is reached from a unique parent pair, so every pair is compared at most once.</p>
  </>} />
}
