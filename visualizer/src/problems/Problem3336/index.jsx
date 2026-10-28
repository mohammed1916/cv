import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty pair', description: 'Both sequences are empty.' },
    { id: 'element', label: 'Next number', description: 'Each number joins the first sequence, the second, or neither.' },
    { id: 'done', label: 'Complete', description: 'Report the pairs with equal non-empty gcds.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers from 1 to 40 (JSON)',
  url: 'https://leetcode.com/problems/find-the-number-of-subsequences-with-equal-gcd/',
  complexity: 'O(n * G^2) time where G is the largest gcd state (at most 40 here), and O(G^2) space. The visualization caps input at 8 numbers.',
  examples: [
    { label: 'Example 1', input: '[1,2,3,4]' },
    { label: 'Example 2', input: '[10,20,30]' },
  ],
}

export default function EqualGcdSubsequences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers in order" length={run.input.length} valueAt={index => run.input[index]} active={step.index} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Two disjoint subsequences can be built together by giving each number to one side, to the other side, or to neither.</p>
    <p>The state keeps the gcd of each side, and only pairs whose two gcds finish equal are counted.</p>
  </>} />
}
