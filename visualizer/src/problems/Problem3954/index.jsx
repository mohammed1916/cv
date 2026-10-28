import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Window', description: 'Only numbers within k of n are candidates.' },
    { id: 'add', label: 'Compatible', description: 'No set bit is shared with n, so add x.' },
    { id: 'skip', label: 'Shares a bit', description: 'x shares a set bit with n, so skip it.' },
    { id: 'done', label: 'Return', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"n": n, "k": k}',
  url: 'https://leetcode.com/problems/sum-of-compatible-numbers-in-range-i/',
  complexity: 'O(k) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"n":2,"k":3}' },
    { label: 'Example 2', input: '{"n":5,"k":1}' },
  ],
}

export default function SumCompatibleNumbers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Window">{`Window: ${step.range ? `[${step.range[0]}, ${step.range[1]}]` : '-'}. Current x: ${step.x ?? '-'}. Total: ${step.total}.`}</output>
    <output aria-label="Step message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The condition |n - x| at most k limits x to a window of width 2k + 1, so no larger range needs to be checked.</p>
    <p>A bitwise AND of n and x is zero exactly when they share no set bit.</p>
  </>} />
}
