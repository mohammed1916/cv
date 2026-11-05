import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1361', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with n, leftChild and rightChild (JSON)',
  url: 'https://leetcode.com/problems/validate-binary-tree-nodes/',
  complexity: 'O(n) time and O(n) space for the parent counts and the walk.',
}

export default function BinaryTreeNodesVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const rows = Array.from({ length: run.input.n }, (_, v) => ({
      node: v, left: run.input.leftChild[v], right: run.input.rightChild[v], parents: s.parents[v], reached: s.seen?.includes(v) ? 'yes' : '',
    }))
    return <>
      <RecordStateTable label="Nodes: children and parent count" columns={['node', 'left', 'right', 'parents', 'reached']} rows={rows} activeRow={s.current ?? -1} />
      <StackLane title="Roots found" items={s.roots ? s.roots.map(String) : []} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Three checks:</strong> no node has two parents, exactly one node has no parent, and a walk from that root reaches every node once.</p>
    <p>{step.message}</p>
  </>} />
}
