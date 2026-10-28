import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the count for the range.' },
    { id: 'hit', label: 'In range', description: 'This power lies inside the range and is counted.' },
    { id: 'skip', label: 'Below range', description: 'This power is still below l, so it is not counted.' },
    { id: 'one', label: 'k = 1', description: 'Every integer is a first power.' },
    { id: 'done', label: 'Return', description: 'Report the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"l": l, "r": r, "k": k}',
  url: 'https://leetcode.com/problems/count-k-th-roots-in-a-range/',
  complexity: 'O(r^(1/k)) time for k at least 2, and O(1) for k = 1. The visualization caps r at 200.',
  examples: [
    { label: 'Example 1', input: '{"l":1,"r":9,"k":3}' },
    { label: 'Example 2', input: '{"l":8,"r":30,"k":2}' },
  ],
}

export default function CountKthRoots() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Current base">{`Base x = ${step.x ?? '-'}, power = ${step.power ?? '-'}, count = ${step.count}`}</output>
    <output aria-label="Step message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Powers of a non-negative base grow, so the loop can stop as soon as a power exceeds r.</p>
    <p>Only the non-negative bases are needed: a negative base gives the same power for even k, and a negative power for odd k cannot lie in a range starting at 0.</p>
  </>} />
}
