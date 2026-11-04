import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

const ALPHABET = [...'abcdefghijklmnopqrstuvwxyz']

// One cell per letter: lit when that letter has an odd count inside the query substring.
function ParityRow({ letters }) {
  return <ol aria-label="Letters with an odd count" style={{ display: 'flex', flexWrap: 'wrap', gap: 3, listStyle: 'none', padding: 0, margin: '8px 0' }}>
    {ALPHABET.map(letter => {
      const odd = letters.includes(letter)
      return <li key={letter} style={{
        width: 26, textAlign: 'center', padding: '3px 0', borderRadius: 4, fontFamily: 'var(--mono, monospace)',
        border: '1px solid var(--border)', background: odd ? 'var(--primary-glow)' : 'var(--surface2)',
        color: odd ? 'var(--text)' : 'var(--text-muted)', fontWeight: odd ? 700 : 400,
      }}>{letter}</li>
    })}
  </ol>
}

export default function CanMakePalindromeFromSubstring() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { text, query, letters, need, k, answer, answers, index } = step.snapshot
    const [l, r] = query ?? [-1, -2]
    const chars = [...text]
    const marks = {}
    if (query) for (let i = l; i <= r; i++) marks[i] = 'window'
    const pointers = query ? { l, r } : {}
    if (index !== null && index !== undefined) pointers.index = index
    return <>
      <Sequence label={query ? `Substring ${l}..${r} (k = ${k})` : 'Input string (prefix masks being built)'} values={chars} pointers={pointers} marks={marks} />
      <ParityRow letters={query ? letters : []} />
      <Vars vars={{ 'odd letters': query ? letters.length : null, 'replacements needed': need, k, 'palindrome possible': answer === null ? null : answer ? 'true' : 'false' }} />
      <output aria-label="Answers">{`Answers: [${answers.map(a => (a ? 'true' : 'false')).join(', ')}]`}</output>
      <p>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Parity mask:</strong> XOR of two prefix masks leaves a bit for each letter with an odd count in the substring.</p>
    <p><strong>Palindrome test:</strong> one odd letter may sit in the center, so floor(odd / 2) replacements are needed. The answer is true when that number is at most k.</p>
  </>} />
}
