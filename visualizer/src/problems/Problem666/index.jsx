import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Index nodes', description: 'Each node is looked up by depth and position.' },
    { id: 'visit', label: 'Walk down', description: 'Each node extends the number from its parent by one digit.' },
    { id: 'leaf', label: 'Add a leaf', description: 'A leaf’s full number joins the total.' },
    { id: 'done', label: 'Total', description: 'The sum of every root-to-leaf number.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Nodes (JSON array of three-digit strings DPV)',
  url: 'https://leetcode.com/problems/path-sum-iv/',
  complexity: 'O(n) time for n nodes and O(depth) recursion space.',
  examples: [
    { label: 'Small tree', input: '["113","215","221"]' },
    { label: 'Chain', input: '["111","222","333"]' },
    { label: 'Two leaves', input: '["114","215","227","325"]' },
    { label: 'Root only', input: '["111"]' },
    { label: 'Equal path sums', input: '["110","211","221"]' },
    { label: 'Largest values down a chain', input: '["119","219","319","419"]' },
    { label: 'Long run: fifteen nodes', input: '["111","210","226","315","328","336","343","419","420","430","441","456","462","477","481"]' },
  ],
}

// Rebuild the linked tree from the DPV strings, so the lane draws the same shape the walk uses.
function toTree(items) {
  const byKey = new Map()
  let nextId = 0
  for (const s of items) byKey.set(`${s[0]}-${s[1]}`, { id: nextId++, key: `${s[0]}-${s[1]}`, value: Number(s[2]), left: null, right: null })
  for (const node of byKey.values()) {
    const [depth, pos] = node.key.split('-').map(Number)
    node.left = byKey.get(`${depth + 1}-${2 * pos - 1}`) ?? null
    node.right = byKey.get(`${depth + 1}-${2 * pos}`) ?? null
  }
  return byKey.get('1-1') ?? null
}

export default function PathSumIV() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const root = toTree(run.input)
    const roles = {}
    const find = (node, key) => (!node ? null : node.key === key ? node : find(node.left, key) ?? find(node.right, key))
    const current = step.path[0] ? find(root, step.path[0]) : null
    if (current) roles[current.id] = 'current'
    return <>
      <BinaryTreeLane title="Tree by depth and position" root={root} roles={roles} note={step.phase === 'done' ? 'total computed' : 'walking'} />
      <RecordStateTable label="Leaves found" columns={['leaf number']} rows={step.leaves.map(v => ({ 'leaf number': v }))} activeRow={step.leaves.length - 1} />
      <output aria-label="Running total">{`Total so far: ${step.total}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why depth and position:</strong> a node at position p on depth d has children at positions 2p − 1 and 2p, so the tree never needs pointers in the input.</p>
  </>} />
}
