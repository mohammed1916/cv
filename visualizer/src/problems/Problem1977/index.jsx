import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1977',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Digit string (e.g. 1234)',
  url: 'https://leetcode.com/problems/number-of-ways-to-separate-numbers/',
  complexity: 'O(n²) table cells with prefix sums and one string comparison per cell. The visualization caps the string at 12 digits.',
  examples: [
    { label: 'Four digits', input: '1234' },
    { label: 'Leading zero inside', input: '1003' },
  ],
}

export default function Problem1977Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const num = run.input.num
      const n = num.length
      return <>
        <div aria-label="Digits" style={{ display: 'flex', gap: 4 }}>
          {[...num].map((d, i) => <span key={i} style={{ width: 28, textAlign: 'center', padding: '4px 0', fontFamily: 'monospace', borderRadius: 4, border: '1px solid var(--border)', background: step.start >= 0 && i >= step.start && i < step.start + Math.max(0, step.len) ? 'color-mix(in srgb, var(--primary) 22%, var(--surface2))' : 'var(--surface2)' }}>{d}</span>)}
        </div>
        {step.table && <table aria-label="Ways table (start by length)" style={{ borderCollapse: 'collapse', marginTop: 8 }}>
          <thead><tr><th>start \ length</th>{Array.from({ length: n }, (_, k) => <th key={k}>{k + 1}</th>)}</tr></thead>
          <tbody>{Array.from({ length: n }, (_, i) => <tr key={i}><th>{i}</th>{Array.from({ length: n }, (_, k) => {
            const len = k + 1
            const current = step.start === i && step.len === len
            const v = step.table[i] ? step.table[i][len] : 0
            return <td key={k} style={{ width: 36, height: 28, textAlign: 'center', border: '1px solid var(--border)', outline: current ? '2px solid var(--primary)' : 'none', background: v ? 'var(--surface2)' : 'transparent' }}>{i + len <= n && v ? v : ''}</td>
          })}</tr>)}</tbody>
        </table>}
        <p>Row = start of the last number, column = its length. A cell counts the ways to split everything before it.</p>
        {step.result !== undefined && <output aria-label="Ways">Ways: {step.result}</output>}
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
