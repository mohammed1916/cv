import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1310', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Array and queries (JSON object)',
  url: 'https://leetcode.com/problems/xor-queries-of-a-subarray/',
  complexity: 'O(n + q) time: one pass for the prefix XORs and one constant-time lookup per query. O(n) extra space.',
}

export default function XorRangeVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <IndexedSequence label="arr" length={run.input.arr.length} valueAt={i => run.input.arr[i]} active={-1}
        roleAt={i => (s.l !== undefined && i === s.l ? 'l' : s.r !== undefined && i === s.r ? 'r' : (s.l !== undefined && i >= s.l && i <= s.r ? 'in range' : ''))} />
      <IndexedSequence label="Prefix XOR (index 0 is the empty prefix)" length={s.pre.length} valueAt={i => s.pre[i]} active={s.pre.length - 1}
        roleAt={i => (s.l !== undefined && i === s.l ? 'l' : s.r !== undefined && i === s.r + 1 ? 'r+1' : '')} />
      <p>Answers so far: {s.answer.length ? s.answer.join(', ') : 'none yet'}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Prefix trick:</strong> XOR-ing the prefix up to r+1 with the prefix up to l removes everything before l, leaving exactly arr[l] through arr[r].</p>
    <p>{step.message}</p>
  </>} />
}
