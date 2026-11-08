import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1268',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with products and searchWord (JSON)',
  url: 'https://leetcode.com/problems/search-suggestions-system/',
  complexity: 'Sorting costs O(n log n). Each prefix scans the sorted list until three matches are found.',
  examples: [
    { label: 'Shared start', input: '{"products":["bear","bell","beach","bead"],"searchWord":"be"}' },
    { label: 'Dead end', input: '{"products":["cat","car"],"searchWord":"cow"}' },
    { label: 'Cut at three', input: '{"products":["a","ab","abc","abd","abe"],"searchWord":"ab"}' },
    { label: 'Single product', input: '{"products":["a"],"searchWord":"a"}' },
    { label: 'Duplicate words', input: '{"products":["bat","bat","bag"],"searchWord":"ba"}' },
    { label: 'Long search word', input: '{"products":["abcdef","abcdeg"],"searchWord":"abcdefgh"}' },
    { label: 'Long run: 12 products', input: '{"products":["caabb","cbba","cc","dcaabc","c","c","ccbbab","bacdd","cc","abba","dd","adbdad"],"searchWord":"ab"}' },
  ],
}

export default function SearchSuggestions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { sorted, prefix, matches, scan, result } = step.snapshot
    return <>
      <div role="img" aria-label="Sorted products" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {sorted.map((word, i) => <div key={i} style={{
          padding: '6px 8px', fontFamily: 'monospace', border: `${i === scan ? 2 : 1}px solid ${i === scan ? 'var(--text)' : 'var(--border)'}`,
          background: matches.includes(word) ? 'color-mix(in srgb, var(--primary) 25%, transparent)' : 'transparent', color: 'var(--text)',
        }}>{word}</div>)}
      </div>
      <p>{prefix === null ? 'No prefix is active yet.' : `Active prefix: "${prefix}"`}</p>
      <table aria-label="Suggestion lists" style={{ fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <thead><tr><th>prefix</th><th>suggestions</th></tr></thead>
        <tbody>{result.length === 0 ? <tr><td colSpan={2}>none yet</td></tr> : result.map((list, k) => <tr key={k}><td>{run.input.searchWord.slice(0, k + 1)}</td><td>{list.join(', ') || '(none)'}</td></tr>)}</tbody>
      </table>
    </>
  }} renderReasoning={() => <>
    <p><strong>Sort first:</strong> once the names are sorted, every prefix's matches are consecutive in that order, so the first three found are the answer.</p>
    <p><strong>Stop early:</strong> a prefix scan ends as soon as three suggestions are collected.</p>
  </>} />
}
