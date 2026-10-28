import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Start at the root with no digit parities set.' },
    { id: 'flip', label: 'Flip digit', description: 'Toggle this node digit in the set of odd-count digits.' },
    { id: 'count', label: 'Palindrome', description: 'At a leaf, at most one odd-count digit means the path counts.' },
    { id: 'reject', label: 'Not palindrome', description: 'At a leaf with two or more odd-count digits, the path does not count.' },
    { id: 'done', label: 'Complete', description: 'Report the number of pseudo-palindromic paths.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with values: level-order digits 1-9 (null = missing)',
  url: 'https://leetcode.com/problems/pseudo-palindromic-paths-in-a-binary-tree/',
  complexity: 'O(n) time and O(h) stack space, using a 10-bit parity mask. The visualization caps input at 15 entries.',
  examples: [
    { label: 'Example 1', input: '{"values":[2,3,1,3,1,null,1]}' },
    { label: 'Example 2', input: '{"values":[2,1,1,1,3,null,null,null,null,null,1]}' },
  ],
}

export default function PseudoPalindromicPaths() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.node !== null) roles[step.node] = 'active'
    return <>
      <BinaryTreeLane title="Tree (digits)" root={run.root} roles={roles} />
      <output aria-label="Odd-count digits">{`Odd-count digits on this path: ${step.odd.join(', ') || 'none'}`}</output>
      <output aria-label="Palindrome paths">{`Pseudo-palindromic paths so far: ${step.count}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A multiset of digits can be arranged as a palindrome when at most one digit appears an odd number of times.</p>
    <p>A 10-bit mask records the parity of each digit along the path, so toggling a digit is one XOR and the test is a single bit check.</p>
  </>} />
}
