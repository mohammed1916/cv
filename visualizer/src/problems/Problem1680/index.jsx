import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Upper limit n (whole number from 1 to 60)',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(n) time and O(1) space: one update per number, with the width kept as a single counter.',
  examples: [
    { label: 'Four', input: '4' },
    { label: 'Nine', input: '9' },
    { label: 'Twenty', input: '20' },
  ],
}

// Tape of appended pieces: each number is one block, its bits drawn in order.
export default function ConcatenatedBinary() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { i, width, result, bits } = step.snapshot
    const n = run.input
    const appended = i === null ? (step.phase === 'done' ? n : 0) : i
    const blocks = Array.from({ length: appended }, (_, k) => k + 1)
    return <>
      <p style={{ margin: '0 0 6px' }}>Each number is written after the bits already on the tape. The tape grows wider only at powers of two.</p>
      <div role="img" aria-label="Binary tape" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {blocks.map(v => {
          const isCurrent = v === i
          return <span key={v} title={`${v} = ${v.toString(2)}`} style={{
            padding: '3px 6px', borderRadius: 6, fontFamily: 'monospace', fontSize: 13,
            border: `2px solid ${isCurrent ? 'var(--primary)' : 'var(--border)'}`,
            background: isCurrent ? 'var(--primary)' : (v & (v - 1)) === 0 ? 'var(--surface2)' : 'var(--surface)',
            color: isCurrent ? 'var(--on-primary, #fff)' : 'var(--text)',
          }}>{v.toString(2)}</span>
        })}
      </div>
      <table aria-label="Binary state" style={{ fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <tbody>
          <tr><th scope="row">current number</th><td>{i ?? 'none yet'}</td></tr>
          <tr><th scope="row">binary of current</th><td>{bits ?? '-'}</td></tr>
          <tr><th scope="row">width (bits)</th><td>{width}</td></tr>
          <tr><th scope="row">result mod 1000000007</th><td>{result}</td></tr>
        </tbody>
      </table>
      <p>{i === null ? 'Shaded blocks are powers of two, where the width grows.' : `Shift the result left by ${width} bit${width === 1 ? '' : 's'}, then add ${i}.`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Width only changes at powers of two:</strong> a number has one more bit than the previous number exactly when it is a power of two.</p>
    <p><strong>Modulo at every step:</strong> shifting and adding before reducing gives the same remainder as reducing the full concatenation at the end.</p>
  </>} />
}
