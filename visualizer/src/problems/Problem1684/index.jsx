import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with allowed and words (JSON)',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(total length of the words) time with a set of allowed letters; each letter is checked once.',
  examples: [
    { label: 'Mixed', input: '{"allowed":"ab","words":["ab","ba","aab","abc","ca"]}' },
    { label: 'All allowed', input: '{"allowed":"xyz","words":["zyx","xyzz"]}' },
    { label: 'None allowed', input: '{"allowed":"q","words":["ab","cd"]}' },
  ],
}

const letterTile = (state) => ({
  minWidth: 32, padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box', borderRadius: 6,
  border: `2px solid ${state === 'current' ? 'var(--primary)' : 'var(--border)'}`,
  background: state === 'rejected' ? 'var(--surface2)' : state === 'allowed' ? 'var(--primary)' : 'var(--surface)',
  color: state === 'allowed' ? 'var(--on-primary, #fff)' : 'var(--text)',
})

export default function ConsistentStrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { allowed, word, wordIndex, charIndex, outcome, count } = step.snapshot
    return <>
      <div role="img" aria-label="Allowed letters" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <span style={{ alignSelf: 'center' }}>Allowed set:</span>
        {allowed.map(letter => <span key={letter} style={{
          padding: '4px 8px', fontFamily: 'monospace', borderRadius: 999, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)',
        }}>{letter}</span>)}
      </div>
      <table aria-label="Words" style={{ borderCollapse: 'collapse', fontFamily: 'monospace', marginBottom: 10 }}>
        <thead><tr><th>word</th><th>status</th></tr></thead>
        <tbody>{run.input.words.map((w, i) => {
          const resolved = step.phase === 'done' || (wordIndex !== null && (i < wordIndex || (i === wordIndex && (step.phase === 'accept' || step.phase === 'reject'))))
          const status = resolved ? (isCounted(run, i) ? 'consistent' : 'not consistent')
            : i === wordIndex ? 'checking' : 'waiting'
          return <tr key={i} style={{ fontWeight: i === wordIndex ? 700 : 400 }}>
            <td>{w}</td><td>{status}</td>
          </tr>
        })}</tbody>
      </table>
      {word !== null && <div role="img" aria-label="Current word" style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {[...word].map((letter, i) => {
          const state = i === charIndex ? (outcome === 'rejected' ? 'rejected' : 'current') : i < charIndex ? 'allowed' : 'waiting'
          return <span key={i} style={letterTile(state)}>{letter}</span>
        })}
      </div>}
      <output aria-label="Consistent count">Consistent words so far: <strong>{count}</strong> of {run.input.words.length}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Set lookup:</strong> put the allowed letters in a set once, so each letter of each word is a constant-time check.</p>
    <p><strong>Stop early:</strong> one disallowed letter settles the word, so the rest of that word is not read.</p>
    {step.snapshot.word !== null && <p>Current word: {step.snapshot.word}</p>}
  </>} />
}

// A word is consistent when its counted frame exists in the trace.
function isCounted(run, wordIndex) {
  return run.frames.some(frame => frame.phase === 'accept' && frame.snapshot.wordIndex === wordIndex)
}
