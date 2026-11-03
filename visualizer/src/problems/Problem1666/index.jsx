import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RerootView from './RerootView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Leaf', description: 'The chosen leaf will become the root.' },
    { id: 'check', label: 'Check', description: 'Continue while a node remains on the old path.' },
    { id: 'pick', label: 'Pick', description: 'Find the old parent and the off-path child.' },
    { id: 'link', label: 'Relink', description: 'Old parent goes left; off-path child goes right.' },
    { id: 'advance', label: 'Advance', description: 'Walk one step up the old path.' },
    { id: 'done', label: 'Result', description: 'The leaf is the new root.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with root (level order, null for gaps) and leaf value',
  url: 'https://leetcode.com/problems/change-the-root-of-a-binary-tree/',
  complexity: 'O(h) time and O(1) extra space for a leaf at depth h, since only the path from the leaf to the root changes. The visualization caps the tree at 31 slots and values at 1 to 99; the input format here is a stand-in for the parent-pointer nodes.',
  examples: [
    { label: 'Deep leaf', input: '{"root":[10,6,14,3,8,null,20,1,null,null,9],"leaf":1}' },
    { label: 'Leaf beside a sibling', input: '{"root":[4,2,7,1,3,6,9],"leaf":6}' },
    { label: 'Long chain', input: '{"root":[8,3,12,null,5,null,null,4],"leaf":4}' },
  ],
}

export default function ChangeTreeRoot() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <RerootView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Each old parent becomes a left child, so every node keeps at most two children: its old parent and whatever off-path child it had.</p>
    </>}
  />
}
