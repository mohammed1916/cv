import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'The empty prefix has zero vowels and zero consonants.' },
    { id: 'scan', label: 'Balance', description: 'Each prefix gets a key from its vowel-minus-consonant balance and its vowel count modulo m.' },
    { id: 'done', label: 'Result', description: 'Report the number of beautiful substrings.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase letters) and k (integer from 1 to 1000)',
  url: 'https://leetcode.com/problems/count-beautiful-substrings-ii/',
  complexity: 'O(n) expected time with a hash map of prefix keys. The visualization caps s at 20 letters.',
  examples: [
    { label: 'Vowels and consonants', input: '{"s":"xaybe","k":2}' },
    { label: 'Balanced run', input: '{"s":"aeibc","k":1}' },
    { label: 'Single vowel', input: '{"s":"a","k":1}' },
    { label: 'Only consonants', input: '{"s":"bcdfg","k":2}' },
    { label: 'Upper length', input: '{"s":"aeiouaeiouaeiouaeiou","k":1000}' },
    { label: 'Long run: 20 letters', input: '{"s":"przmapyfldqohpoifsaq","k":3}' },
  ],
}

// Prefix table: each prefix has a balance key (vowels minus consonants, vowels modulo m); equal keys bound a substring.
function prefixRows(s, k, upTo) {
  let m = 1
  while ((m * m) % k !== 0) m += 1
  const rows = [{ prefix: 0, v: 0, c: 0, key: '0,0' }]
  let v = 0, c = 0
  for (let i = 0; i <= upTo && i < s.length; i++) {
    if ('aeiou'.includes(s[i])) v += 1
    else c += 1
    rows.push({ prefix: i + 1, v, c, key: `${v - c},${v % m}` })
  }
  return { rows, m }
}

export default function CountBeautifulSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { rows, m } = prefixRows(run.input.s, run.input.k, step.at)
    const current = rows[rows.length - 1]
    const matches = rows.slice(0, -1).filter(r => r.key === current.key).map(r => r.prefix)
    return <>
      <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.at >= 0 ? step.at : 0}
        roleAt={i => (i === step.at ? 'r' : matches.includes(i) ? 'l' : '')} />
      <RecordStateTable label={`Prefixes (m = ${m})`} columns={['prefix', 'vowels', 'consonants', 'key']}
        rows={rows.map(r => ({ prefix: r.prefix, vowels: r.v, consonants: r.c, key: r.key }))} activeRow={rows.length - 1} />
      <output aria-label="Prefix balance">{`vowels ${step.v}, consonants ${step.c}, earlier matches ${step.found}, total ${step.answer}`}</output>
      <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>Two prefixes bound a beautiful substring when they have the same vowel-minus-consonant balance, so its vowels equal its consonants.</p>
    <p>The product of equal counts is their square, so the vowel count only needs to be a multiple of the smallest m whose square is divisible by k. r is the prefix being read; l marks earlier prefixes with the same key.</p>
  </>} />
}
