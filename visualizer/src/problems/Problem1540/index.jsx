import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1540', phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s, t and k (JSON)',
  url: 'https://leetcode.com/problems/can-convert-string-in-k-moves/',
  complexity: 'O(n) time and O(1) extra space: one pass with a counter for each of the 25 possible shifts.',
  examples: [
    { label: 'Spread moves', input: '{"s":"abc","t":"bcd","k":60}' },
    { label: 'Budget too small', input: '{"s":"aaaa","t":"bbbb","k":3}' },
    { label: 'Already equal', input: '{"s":"ab","t":"ab","k":0}' },
    { label: 'Empty strings', input: '{"s":"","t":"","k":0}' },
    { label: 'Single letter, exact budget', input: '{"s":"a","t":"b","k":1}' },
    { label: 'Equal strings', input: '{"s":"zz","t":"zz","k":0}' },
    { label: 'Largest: 40 letters, big budget', input: '{"s":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","t":"zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz","k":1000000000}' },
    { label: 'Long run: 40 letters', input: '{"s":"mqizoinaahbfoszgkacatcxlqwddkwxitaacvcia","t":"obdtmkcncldpbnevnolgesvffpaigpshharsiitk","k":500}' },
  ],
}

export default function ShiftMoves() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s, t, k } = run.input
    const { i, move } = step.snapshot
    const counts = step.snapshot.counts ?? {}
    return <>
      <table aria-label="Positions and shifts" style={{ fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <thead><tr><th>position</th><th>s</th><th>t</th><th>shift</th></tr></thead>
        <tbody>{[...s].map((ch, index) => {
          const shift = (t.charCodeAt(index) - ch.charCodeAt(0) + 26) % 26
          return <tr key={index} style={{ background: index === i ? 'var(--surface2)' : 'transparent' }}>
            <td>{index}{index === i ? ' (i)' : ''}</td><td>{ch}</td><td>{t[index]}</td><td>{shift}</td>
          </tr>
        })}</tbody>
      </table>
      <p>{i === null || i === undefined ? `Budget k = ${k}.` : `Current move number: ${move ?? 'none needed'} against budget k = ${k}.`}</p>
      <p>{`Moves claimed so far: ${Object.keys(counts).length ? Object.entries(counts).map(([sh, c]) => `shift ${sh} x${c}`).join(', ') : 'none'}.`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Same residue, same lane:</strong> a character that needs shift d can use move d, d + 26, d + 52, and so on.</p>
    <p><strong>Greedy assignment:</strong> give the j-th character of the same shift the j-th lane. If that lane is above k, no assignment can succeed.</p>
  </>} />
}
