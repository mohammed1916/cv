import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PreorderStackView from './PreorderStackView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2764',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'List of [node, parent] pairs; the root pair has parent -1',
  url: 'https://leetcode.com/problems/is-array-a-preorder-of-some-binary-tree/',
  complexity: 'O(n) time and O(n) space for n pairs. Each node is pushed once and popped at most once. The visualization caps the input at 12 pairs with node values from 1 to 99; the rules for distinct nodes and at most two children are checked as the pairs are read.',
  examples: [
    { label: 'Balanced sample', input: '[[5,-1],[3,5],[1,3],[4,3],[8,5],[9,8]]' },
    { label: 'Split subtree', input: '[[7,-1],[2,7],[6,2],[9,7],[4,6],[1,2]]' },
    { label: 'Three children', input: '[[1,-1],[2,1],[3,1],[4,1]]' },
    { label: 'Chain down', input: '[[4,-1],[9,4],[2,9],[7,2],[5,7]]' },
    { label: 'Child before parent', input: '[[3,-1],[6,4],[4,3]]' },
  ],
}

export default function IsArrayPreorderOfBinaryTree() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PreorderStackView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <>
          <p>{step.message}</p>
          <p>The stack always holds the path from the root to the last pair read. A new node must hang from a node on that path, and every node passed over on the way is closed for good.</p>
        </>
      )}
    />
  )
}
