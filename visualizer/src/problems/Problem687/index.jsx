import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Tree', description: 'Measure arms bottom-up.' },
    { id: 'node', label: 'Combine arms', description: 'Add the two same-valued arms at this node.' },
    { id: 'done', label: 'Complete', description: 'Return the longest univalue path.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Tree (LeetCode level-order JSON array)',
  url: 'https://leetcode.com/problems/longest-univalue-path/',
  complexity: 'O(n) time and O(h) recursion depth.',
  examples: [
    { label: 'Five', input: '[5,4,5,1,1,null,5]' },
    { label: 'Four ones', input: '[1,4,5,4,4,null,5]' },
    { label: 'Single', input: '[1]' },
  ],
}

export default function LongestUnivaluePath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    Object.keys(step.arms ?? {}).forEach(id => { roles[id] = 'visited' })
    if (step.current !== null && step.current !== undefined) roles[step.current] = 'active'
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} tags={Object.fromEntries(Object.entries(step.arms ?? {}).map(([id, a]) => [id, `arm ${a}`]))} />
      <output aria-label="Best path">Best so far: {step.best} edge{step.best === 1 ? '' : 's'}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Arms:</strong> an arm continues only while values match the parent, so a path through a node uses its two best matching arms.</p>
  </>} />
}
