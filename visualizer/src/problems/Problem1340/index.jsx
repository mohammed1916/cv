import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare to find the longest chain from every index.' },
    { id: 'visit', label: 'Visit', description: 'List the indices this one can jump to.' },
    { id: 'reuse', label: 'Memo hit', description: 'Reuse the chain length already computed for this index.' },
    { id: 'store', label: 'Store', description: 'Save the longest chain that starts at this index.' },
    { id: 'done', label: 'Complete', description: 'Report the most indices visited.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr (1 to 12 values) and d',
  url: 'https://leetcode.com/problems/jump-game-v/',
  complexity: 'O(n * d) time and O(n) memory with memoization. The visualization caps input at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"arr":[6,4,14,6,8,13,9,7,10,6,12],"d":2}' },
    { label: 'Flat', input: '{"arr":[3,3,3,3,3],"d":3}' },
  ],
}

export default function JumpGameV() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { arr } = run.input
    const computed = new Map(step.memo.map(e => [e.index, e.value]))
    const targets = new Set(step.targets)
    return <>
      <IndexedSequence label="Array" length={arr.length} valueAt={i => arr[i]} active={step.index ?? -1}
        roleAt={i => (i === step.index ? 'current' : targets.has(i) ? 'jump target' : computed.has(i) ? `chain ${computed.get(i)}` : '')} />
      <table aria-label="Memo table">
        <thead><tr><th>Index</th><th>Longest chain</th></tr></thead>
        <tbody>{step.memo.map(e => <tr key={e.index}><td>{e.index}</td><td>{e.value}</td></tr>)}</tbody>
      </table>
      <output aria-label="Current step">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>From an index, a jump may go up to d steps left or right, but only onto a smaller value and only if every index it passes over is smaller than the start.</p>
    <p>The longest chain from an index depends only on that index, so each one is computed once and reused.</p>
  </>} />
}
