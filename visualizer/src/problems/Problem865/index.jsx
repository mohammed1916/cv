import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Plan the post-order pass.' },
    { id: 'enter', label: 'Enter node', description: 'Recurse into the children.' },
    { id: 'combine', label: 'Combine', description: 'Compare child depths and pick the candidate.' },
    { id: 'done', label: 'Complete', description: 'The answer subtree.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Level-order tree (JSON, null for missing, up to 30 nodes)',
  url: 'https://leetcode.com/problems/smallest-subtree-with-all-the-deepest-nodes/',
  complexity: 'O(n) time, O(h) recursion space; every node is processed once.',
  examples: [
    { label: 'Official example 1', input: '[3,5,1,6,2,0,8,null,null,7,4]' },
    { label: 'Single node', input: '[1]' },
    { label: 'Deepest only on one side', input: '[0,1,3,null,2]' },
    { label: 'Skewed', input: '[1,2,null,3,null,4]' },
  ],
}

export default function SmallestSubtreeDeepest() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    for (const id of step.done ?? []) roles[id] = 'visited'
    for (const id of step.subtree ?? []) roles[id] = 'match'
    if (step.candidate !== null && step.candidate !== undefined && step.phase === 'combine') roles[step.candidate] = 'match'
    if (step.current !== null && step.current !== undefined) roles[step.current] = 'active'
    return <>
      <BinaryTreeLane title="Tree (hN = height of finished subtree)" root={run.root} roles={roles} tags={step.heights ?? {}} />
      {step.phase === 'done' && <output aria-label="Answer">Answer subtree root {run.result}: [{run.resultSubtree.join(', ')}]</output>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Return pair:</strong> dfs gives (height, lowest node holding all deepest nodes of this subtree).</p>
    <p><strong>Deeper side wins:</strong> if one child is taller, every deepest node lives there, so its candidate is still correct. If heights tie, the deepest nodes split between both sides and only the current node contains them all.</p>
  </>} />
}
