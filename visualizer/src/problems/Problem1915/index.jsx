import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1915',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Word of letters a to j (e.g. abab)',
  url: 'https://leetcode.com/problems/number-of-wonderful-substrings/',
  complexity: 'O(n · 10) time: each position checks its own mask and the ten masks one bit away. Space is 2^10 counters.',
  examples: [
    { label: 'Two letters', input: 'ab' },
    { label: 'Repeats', input: 'abab' },
  ],
}

export default function Problem1915Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <table aria-label="Prefix parity masks" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th>Position</th><th>Letter</th><th>Mask (bit 0 = a … bit 9 = j)</th><th>Equal</th><th>One bit apart</th><th>Total</th></tr></thead>
        <tbody>{run.input.word.split('').map((ch, i) => {
          const done = step.i >= i
          const current = step.i === i
          return <tr key={i} style={{ background: current ? 'color-mix(in srgb, var(--primary) 18%, transparent)' : 'transparent', opacity: done ? 1 : 0.5 }}>
            <td>{i + 1}</td><td>{ch}</td><td style={{ fontFamily: 'monospace' }}>{done && current ? step.mask : ''}</td><td>{current ? step.same : ''}</td><td>{current ? step.oneOff : ''}</td><td>{current ? step.answer : ''}</td>
          </tr>
        })}</tbody>
      </table>
      <p>A substring is wonderful when its letters have at most one odd count, which means two prefix masks differ in at most one bit.</p>
      {step.result !== undefined && <output aria-label="Total">Wonderful substrings: {step.result}</output>}
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
