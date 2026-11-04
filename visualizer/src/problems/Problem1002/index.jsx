import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1002',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'List of lowercase words (JSON)',
  url: 'https://leetcode.com/problems/find-common-characters/',
  complexity: 'O(W * L + 26) time for W words of length L at most, and O(26) counting space.',
  examples: [
    { label: 'Repeats kept', input: '["pepper","paper","reap"]' },
    { label: 'Two words', input: '["ab","ba"]' },
    { label: 'Nothing shared', input: '["abc","xyz"]' },
  ],
}

const cell = { border: '1px solid var(--border)', padding: '3px 7px', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text)' }

// Letter-by-word matrix: one row per word processed so far, then the running minimum.
export default function CommonCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const words = run.input
    const letters = [...new Set(words.join(''))].sort()
    const processed = step.snapshot.index ?? (step.phase === 'done' ? words.length - 1 : -1)
    const shownCount = processed + 1
    const common = new Map(step.snapshot.common ?? [])
    const countIn = (word, ch) => word.split(ch).length - 1
    return <>
      <div style={{ overflowX: 'auto' }}>
        <table aria-label="Letter counts per word and shared minimum" style={{ borderCollapse: 'collapse' }}>
          <thead><tr><th style={cell}>word</th>{letters.map(ch => <th key={ch} style={cell}>{ch}</th>)}</tr></thead>
          <tbody>
            {words.slice(0, shownCount).map((w, i) => <tr key={i} style={{ background: i === processed ? 'var(--surface2)' : 'transparent' }}>
              <td style={cell}>{w}</td>{letters.map(ch => <td key={ch} style={cell}>{countIn(w, ch) || ''}</td>)}
            </tr>)}
            <tr style={{ fontWeight: 700 }}>
              <td style={cell}>shared</td>{letters.map(ch => <td key={ch} style={cell}>{common.get(ch) ?? ''}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ color: 'var(--text)' }}>{step.snapshot.word === null ? 'No word is being counted yet.' : `Counting "${step.snapshot.word}"`}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Per letter:</strong> a letter can appear only as often as it appears in the word that contains it least. Taking the minimum across words captures this.</p>
    <p><strong>Repeats:</strong> the result repeats each surviving letter by its final minimum count.</p>
  </>} />
}
