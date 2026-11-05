import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1980',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Unique binary strings of length n (JSON)',
  url: 'https://leetcode.com/problems/find-unique-binary-string/',
  complexity: 'O(n) time and O(n) extra space for the answer, with n strings of length n.',
  examples: [
    { label: 'Two rows', input: '["10","11"]' },
    { label: 'Three rows', input: '["000","111","010"]' },
    { label: 'Four rows', input: '["0110","1011","0001","1100"]' },
  ],
}

export default function FindUniqueBinaryString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { nums, index, answer } = step.snapshot
    const n = nums.length
    return <>
      <table aria-label="Diagonal of the input grid" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <tbody>{nums.map((row, r) => <tr key={row}>
          {[...row].map((bit, c) => <td key={c} style={{
            border: '1px solid var(--border)', padding: '4px 8px', textAlign: 'center',
            background: r === c ? 'var(--surface2)' : 'transparent',
            color: 'var(--text)', fontWeight: r === c && r === index ? 700 : 400,
          }}>{bit}</td>)}
        </tr>)}</tbody>
      </table>
      <p>Diagonal cell <strong>{index >= 0 ? `[${index}][${index}]` : 'none yet'}</strong> is flipped into the answer.</p>
      <p>Answer so far: <strong>{answer || '(empty)'}</strong> of length {n}</p>
    </>
  }} renderReasoning={() => <p>Bit i of the answer differs from bit i of row i, so the answer cannot equal row i for any i.</p>} />
}
