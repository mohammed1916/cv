import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SpecialTreeHeightView from './SpecialTreeHeightView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2773',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Nested object {"v", "l", "r"}; leaves have no l or r',
  url: 'https://leetcode.com/problems/height-of-special-binary-tree/',
  complexity: 'O(n) time and O(h) stack space for n nodes and height h; the leaf chain is never traversed, so it adds no work. The visualization caps the tree at 12 nodes with values from 1 to 99. Height is counted in nodes, so a single node has height 1.',
  examples: [
    { label: 'Lopsided oak', input: '{"v":8,"l":{"v":3,"l":{"v":1},"r":{"v":6,"l":{"v":4}}},"r":{"v":9}}' },
    { label: 'Single node', input: '{"v":5}' },
    { label: 'Right-leaning chain', input: '{"v":2,"r":{"v":7,"r":{"v":1,"r":{"v":4}}}}' },
    { label: 'Perfect small tree', input: '{"v":10,"l":{"v":5},"r":{"v":15,"l":{"v":12},"r":{"v":20}}}' },
  ],
}

export default function HeightOfSpecialBinaryTree() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SpecialTreeHeightView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <>
          <p>{step.message}</p>
          <p>The leaf chain looks like extra edges, but following it would revisit leaves and never end. Only real child pointers count toward depth.</p>
        </>
      )}
    />
  )
}
