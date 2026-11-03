import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Tally how often each letter appears.' },
    { id: 'rank', label: 'Rank', description: 'Take the k letters with the largest counts.' },
    { id: 'tie', label: 'Ties', description: 'Letters sharing the k-th count can be swapped in.' },
    { id: 'done', label: 'Result', description: 'Multiply the choices, modulo 1e9+7.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s and k',
  url: 'https://leetcode.com/problems/count-k-subsequences-of-a-string-with-maximum-beauty/',
  complexity: 'O(n + sigma log sigma) time for n characters over an alphabet of size sigma.',
  examples: [
    { label: 'Example', input: '{"s":"wwwtxxyy","k":2}' },
    { label: 'Tied letters', input: '{"s":"gggeeff","k":2}' },
  ],
}

function letterCounts(s) {
  const counts = new Map()
  for (const c of s) counts.set(c, (counts.get(c) || 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
}

export default function CountKSubsequencesMaximumBeauty() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <ul aria-label="Letter counts">
      {letterCounts(run.input.s).map(([c, f]) => <li key={c} data-chosen={step.chosen?.includes(c) ? 'yes' : 'no'}>
        {`${c}: ${f}${step.chosen?.includes(c) ? ' (chosen)' : ''}`}</li>)}
    </ul>
    <output aria-label="Count status">{`k = ${run.input.k}. ${step.message ?? ''}`}</output>
  </>} renderReasoning={() => <>
    <p>A k-subsequence with distinct letters has a beauty equal to the sum of the letter counts it uses, so the best choice takes the k largest counts.</p>
    <p>Letters that tie with the k-th count are interchangeable. Choose how many of them are needed, then one index from each chosen letter.</p>
  </>} />
}
