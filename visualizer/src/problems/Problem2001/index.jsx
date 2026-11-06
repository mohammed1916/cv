import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2001',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Rectangles as [width, height] (JSON)',
  url: 'https://leetcode.com/problems/number-of-pairs-of-interchangeable-rectangles/',
  complexity: 'O(n log C) time for the gcd of each rectangle and O(n) map operations.',
  examples: [
    { label: 'Three pairs', input: '[[2,4],[1,2],[3,6],[5,7]]' },
    { label: 'No match', input: '[[4,5],[7,8]]' },
  ],
}

export default function NumberOfInterchangeableRectangles() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { rects, index, key, groups, pairs } = step.snapshot
    return <>
      <table aria-label="Rectangles and their ratio keys" style={{ borderCollapse: 'collapse', fontFamily: 'monospace', color: 'var(--text)' }}>
        <tbody>{rects.map(([w, h], i) => <tr key={i} style={{ background: i === index ? 'var(--primary-glow)' : 'transparent' }}>
          <td style={{ border: '1px solid var(--border)', padding: '2px 8px', color: 'var(--text-muted)' }}>[{i}]</td>
          <td style={{ border: '1px solid var(--border)', padding: '2px 8px' }}>{w} x {h}</td>
          <td style={{ border: '1px solid var(--border)', padding: '2px 8px' }}>{i <= index ? (() => { const g = gcdOf(w, h); return `${w / g}/${h / g}` })() : ''}</td>
        </tr>)}</tbody>
      </table>
      <p>Counts by ratio: {groups.length ? groups.map(([k, c]) => `${k}: ${c}`).join(' · ') : 'none yet'}</p>
      <p>Pairs so far: <strong>{pairs}</strong>{key ? `, current ratio ${key}` : ''}.</p>
    </>
  }} renderReasoning={() => <p>Two rectangles are interchangeable when their width-to-height ratios match. Reducing each pair by its gcd gives a key that is equal exactly when the ratios are equal.</p>} />
}

function gcdOf(a, b) { return b === 0 ? a : gcdOf(b, a % b) }
