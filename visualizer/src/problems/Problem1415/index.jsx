import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1415',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Length n and rank k, separated by a space',
  url: 'https://leetcode.com/problems/the-k-th-lexicographical-string-of-all-happy-strings-of-length-n/',
  complexity: 'O(n) time and O(n) space: the answer is built letter by letter, with no enumeration of earlier strings.',
  examples: [
    { label: 'Rank 4 of 3', input: '3 4' },
    { label: 'Last of 3', input: '3 12' },
    { label: 'Beyond the end', input: '2 7' },
    { label: 'Smallest case: length 1', input: '1 1' },
    { label: 'First of length 2', input: '2 1' },
    { label: 'Largest rank allowed', input: '10 200' },
    { label: 'Long run: length 10', input: '10 139' },
  ],
}

const tile = { padding: '4px 8px', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', background: 'var(--surface2)' }

// All happy strings of length n, in order, as one bar. The current prefix splits its share of the bar into one block per letter.
function RankBar({ total, k, base, block, options, chosen }) {
  const pct = v => `${(v / total) * 100}%`
  return <div style={{ margin: '8px 0 12px' }}>
    <div role="img" aria-label={`Ranks 1 to ${total}; rank ${k} is marked`} style={{ position: 'relative', height: 44, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', overflow: 'hidden' }}>
      {options && options.map((letter, j) => {
        const from = base + j * block
        return <div key={letter} style={{
          position: 'absolute', top: 0, bottom: 0, left: pct(from), width: pct(block), boxSizing: 'border-box',
          borderLeft: '1px solid var(--border)', display: 'grid', placeItems: 'center', fontFamily: 'monospace', fontSize: 13,
          color: 'var(--text)', background: letter === chosen ? 'var(--primary)' : 'transparent', opacity: letter === chosen ? 0.35 : 1,
        }}>{letter} · {from + 1}–{from + block}</div>
      })}
      <div style={{ position: 'absolute', top: -4, bottom: -4, left: pct(k - 1), width: 3, background: 'var(--text)' }} />
    </div>
    <small style={{ color: 'var(--text)' }}>The marker is rank {k} of {total}.</small>
  </div>
}

export default function HappyStringRank() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n, k } = run.input
    const { total, chars, options, block, offset, chosen } = step.snapshot
    const base = options && block !== null && offset !== null ? k - 1 - offset : 0
    return <>
      <p style={{ color: 'var(--text)' }}>Built so far: <code style={tile}>{chars.join('') || '(empty)'}</code> · Length {n} · Total happy strings: {total}</p>
      {options && block !== null && <RankBar total={total} k={k} base={base} block={block} options={options} chosen={chosen} />}
      {options && <p style={{ color: 'var(--text)' }}>Each option starts a block of {block} strings. Offset inside the current block: {offset}.</p>}
      <p style={{ color: 'var(--text)' }}>{step.message}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Blocks in order:</strong> strings with the same prefix are contiguous, so the first letter chosen is the block that contains rank k.</p>
    <p><strong>Shrink the offset:</strong> inside the chosen block the rank is reduced by the earlier blocks, and the same test repeats for the next position.</p>
    <p>{step.message}</p>
  </>} />
}
