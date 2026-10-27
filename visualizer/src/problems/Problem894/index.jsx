import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, toNode, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Seed memo[1] with a single node.' },
    { id: 'call', label: 'Compute size', description: 'Enter build(m) for a size not yet memoised.' },
    { id: 'memo', label: 'Split sizes', description: 'Choose odd left and right sizes and reuse memoised lists.' },
    { id: 'combine', label: 'Create tree', description: 'Attach one left tree and one right tree to a new root.' },
    { id: 'store', label: 'Memoise', description: 'Store all trees of this size.' },
    { id: 'done', label: 'Complete', description: 'Return every full binary tree with n nodes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'n (JSON integer, 1–11)',
  url: 'https://leetcode.com/problems/all-possible-full-binary-trees/',
  complexity: 'Output-sensitive: O(2^(n/2)/sqrt(n)) trees (Catalan numbers); memoisation shares subtrees between results.',
  examples: [
    { label: 'n = 7', input: '7' },
    { label: 'n = 3', input: '3' },
    { label: 'n = 11', input: '11' },
  ],
}

export default function AllPossibleFullBinaryTrees() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label="memo: number of trees for each size" length={step.memo.length} valueAt={i => `${step.memo[i][0]} → ${step.memo[i][1]}`}
        active={step.memo.findIndex(([size]) => size === step.size)} />
      {step.shown !== null && <BinaryTreeLane title={step.phase === 'done' ? 'First returned tree' : 'Tree just created'} root={toNode(step.shown)}
        note={step.pair ? `${step.pair[0]} left + ${step.pair[1]} right` : undefined} />}
      {step.phase === 'done' && <output aria-label="Result">{run.trees.length} tree(s); first: [{(run.result[0] ?? []).map(v => (v === null ? 'null' : v)).join(', ')}]</output>}
    </>}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p><strong>Why odd sizes?</strong> A full binary tree's root has two subtrees that are themselves full; the node count is 1 + odd + odd, which is odd. Counts follow the Catalan numbers.</p>
      <p>Memoised lists are shared by reference, so reusing a subtree list is free. The trace logs the first lookup of each left/right size pair; later repeated lookups are not shown.</p>
    </>} />
}
