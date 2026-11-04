import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order the unique words from shortest to longest.' },
    { id: 'word', label: 'Start word', description: 'Begin a chain of length one at this word.' },
    { id: 'predecessor', label: 'Predecessor', description: 'Extend the chain when deleting one letter gives a known word.' },
    { id: 'done', label: 'Complete', description: 'Report the longest chain.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with words (JSON array of strings)',
  url: 'https://leetcode.com/problems/longest-string-chain/',
  complexity: 'O(n * L^2) time with a map lookup per deletion, for n words of length L. The visualization caps input at 8 words of up to 6 letters.',
  examples: [
    { label: 'Example 1', input: '{"words":["a","b","ba","bca","bda","bdca"]}' },
    { label: 'Example 2', input: '{"words":["xbc","pcxbcf","xb","cxbc","pcxbc"]}' },
    { label: 'Two branches', input: '{"words":["t","tx","ty","txy","tyz"]}' },
  ],
}

// Each word's predecessors: the words obtained by deleting one letter that are also in the list.
function predecessorMap(words) {
  const unique = [...new Set(words)].sort((a, b) => a.length - b.length)
  const present = new Set(unique)
  return unique.map(word => ({
    word,
    preds: [...new Set(Array.from(word, (_, i) => word.slice(0, i) + word.slice(i + 1)).filter(w => present.has(w)))],
  }))
}

export default function LongestStringChain() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const map = predecessorMap(run.input.words)
    const order = map.map(row => row.word)
    const current = order.indexOf(step.word)
    return <>
      <IndexedSequence label="Words by length" length={order.length} valueAt={i => order[i]}
        active={current} roleAt={i => (i === current ? 'l' : i < current ? 'written' : '')} />
      <section aria-label="Prerequisite map" className="algorithm-sequence">
        <h3>Each word and the shorter words it extends (its predecessors)</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 4 }}>
          {map.map((row, i) => {
            const state = i === current ? 'current' : i < current ? 'processed' : 'pending'
            const chain = step.best[row.word]
            return <li key={row.word} data-state={state} style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, background: state === 'current' ? 'var(--surface2)' : 'transparent', color: state === 'pending' ? 'var(--text-muted)' : 'var(--text)' }}>
              <strong>{row.word}</strong> {'->'} {row.preds.length ? row.preds.join(', ') : 'no predecessor'}
              {' '}<span>{chain !== undefined ? `(chain ${chain})` : '(not yet)'}</span>
              {' '}<em>{state}</em>
            </li>
          })}
        </ul>
      </section>
      <output aria-label="Chain">{step.phase === 'done' ? `Longest chain: ${run.result}` : step.word ? `${step.word}: chain ${step.best[step.word]}` : 'Sorting the words'}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A word can extend the chain of the word obtained by deleting one of its letters, and that shorter word is always processed first.</p>
    <p>Each word stores the length of the longest chain that ends at it, so the answer is the largest stored value.</p>
  </>} />
}
