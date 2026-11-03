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

export default function ConsistentStrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { allowed, word, wordIndex, charIndex, outcome, count } = step.snapshot
    return <>
      <div role="img" aria-label="Allowed letters" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {allowed.map(letter => <span key={letter} style={{
          padding: '4px 8px', fontFamily: 'monospace', border: '1px solid var(--border)', background: 'var(--surface2)', color: '#1c1917',
        }}>{letter}</span>)}
      </div>
      {word !== null && <div role="img" aria-label="Current word" style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        {[...word].map((letter, i) => <span key={i} style={{
          minWidth: 32, padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box',
          border: `${i === charIndex ? 2 : 1}px solid ${i === charIndex ? 'var(--text)' : 'var(--border)'}`,
          background: i === charIndex && outcome === 'rejected' ? '#fecaca' : i === charIndex && outcome === 'counted' ? '#bbf7d0' : 'transparent',
          color: 'var(--text)',
        }}>{letter}</span>)}
      </div>}
      <output aria-label="Consistent count">Consistent words so far: {count} of {run.input.words.length}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Set lookup:</strong> put the allowed letters in a set once, so each letter of each word is a constant-time check.</p>
    <p><strong>Stop early:</strong> one disallowed letter settles the word, so the rest of that word is not read.</p>
    {step.snapshot.word !== null && <p>Current word: {step.snapshot.word}</p>}
  </>} />
}
