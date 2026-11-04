import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

const cell = { border: '1px solid var(--border)', padding: '4px 8px', fontFamily: 'monospace', color: 'var(--text)', textAlign: 'center' }

// One column per bit: the bit read, the remainder of the prefix mod 5, and whether the prefix is divisible by 5.
export default function PrefixRemainderVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const current = run.frames.indexOf(step)
      const done = run.frames.slice(0, current + 1).filter(f => f.phase === 'update').map(f => f.snapshot)
      const nums = step.snapshot.nums
      return <section aria-label="Prefix remainders">
        <table aria-label="Prefix remainders by position" style={{ borderCollapse: 'collapse' }}>
          <thead><tr><th style={cell}>position</th>{nums.map((_, i) => <th key={i} style={cell}>{i}</th>)}</tr></thead>
          <tbody>
            <tr><th style={cell}>bit</th>{nums.map((b, i) => <td key={i} style={{ ...cell, background: i === step.snapshot.index ? 'var(--surface2)' : 'transparent' }}>{b}</td>)}</tr>
            <tr><th style={cell}>remainder</th>{nums.map((_, i) => <td key={i} style={cell}>{done[i] ? done[i].remainder : ''}</td>)}</tr>
            <tr><th style={cell}>divisible</th>{nums.map((_, i) => <td key={i} style={cell}>{step.snapshot.answer[i] === undefined ? '' : step.snapshot.answer[i] ? 'yes' : 'no'}</td>)}</tr>
          </tbody>
        </table>
        <p style={{ color: 'var(--text)' }}>Remainder modulo five so far: <strong>{step.snapshot.remainder}</strong></p>
      </section>
    }}
    renderReasoning={() => <p>The full prefix can be far too large to store. Keeping only its remainder works, because appending a bit doubles the old value and adds the bit, and both steps respect remainders modulo five.</p>} />
}
