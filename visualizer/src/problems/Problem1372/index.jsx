import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a best length of zero.' },
    { id: 'measure', label: 'Runs', description: 'For each node, measure zigzags that start left and that start right.' },
    { id: 'done', label: 'Complete', description: 'Report the longest zigzag in edges.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Level-order binary tree (JSON object with tree)',
  url: 'https://leetcode.com/problems/longest-zigzag-path-in-a-binary-tree/',
  complexity: 'O(n) time and O(h) recursion space. The visualization caps the tree at 15 nodes.',
  examples: [
    { label: 'Example 1', input: '{"tree":[1,null,1,1,1,null,null,1,1,null,1]}' },
    { label: 'Example 2', input: '{"tree":[1,1,1,null,1,null,null,1,1,null,1]}' },
  ],
}

export default function LongestZigZagPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.current !== null) roles[step.current] = 'active'
    const tags = {}
    Object.entries(step.runs).forEach(([id, run2]) => { tags[id] = `L${run2.leftRun} R${run2.rightRun}` })
    return <>
      <BinaryTreeLane title="Tree (zigzag lengths)" root={run.root} roles={roles} tags={tags} />
      <output aria-label="Best zigzag">{`Best zigzag so far: ${step.best} edges`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A zigzag path alternates directions, so the best path through a node either starts with a left move or with a right move. Each run is one plus the opposite run of the child it enters.</p>
    <p>Combining these two runs at every node in one bottom-up pass gives the longest zigzag without retracing any path.</p>
  </>} />
}
