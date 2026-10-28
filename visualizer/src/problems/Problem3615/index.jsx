import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Centers', description: 'Start from single nodes and from edges whose ends share a letter.' },
    { id: 'grow', label: 'Grow', description: 'Extend both ends outward with unused neighbours that share a letter.' },
    { id: 'done', label: 'Complete', description: 'Report the longest palindrome found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n, edges [[a, b]] and label',
  url: 'https://leetcode.com/problems/longest-palindromic-path-in-graph/',
  complexity: 'Each state is (end, end, visited set), so the work is O(n^2 * 2^n * n^2) in the worst case. The official limit is n <= 14.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"edges":[[0,1],[1,2]],"label":"aba"}' },
    { label: 'Example 3', input: '{"n":4,"edges":[[0,2],[0,3],[3,1]],"label":"bbac"}' },
  ],
}

export default function LongestPalindromicPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Label">{`Labels: ${run.input.label}`}</output>
    <output aria-label="Search">{`States: ${step.states}. Best so far: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A palindrome is grown from its centre outward. Each step adds one node at each end, so the two ends must carry the same letter.</p>
    <p>A bitmask records the nodes already on the path, so no node is reused and the result is a simple path.</p>
  </>} />
}
