import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm'

function Supply({ snapshot }) {
  const { words, supply, wordIndex, used, position, verdicts, total } = snapshot
  return <div>
    <p>Supply per letter (each word starts fresh): {Object.keys(supply).sort().map(c => `${c}×${supply[c]}`).join('  ')}</p>
    <ol style={{ listStyle: 'none', padding: 0 }}>
      {words.map((word, i) => {
        const verdict = verdicts[i]
        const active = i === wordIndex
        return <li key={i} style={{ padding: '4px 0', fontWeight: active ? 700 : 400 }}>
          {word}{' '}
          {[...word].map((ch, p) => <span key={p} style={{ textDecoration: active && p === position ? 'underline' : 'none' }}>{ch}</span>)}
          {' — '}{verdict ? (verdict.ok ? `accepted (+${word.length})` : 'skipped') : active ? 'checking' : 'waiting'}
          {active && used && Object.keys(used).length ? ` · used ${Object.entries(used).map(([c, n]) => `${c}${n}`).join(' ')}` : ''}
        </li>
      })}
    </ol>
    <p>Total: {total}</p>
  </div>
}

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON: {"words":[...],"chars":"..."}',
  complexity: 'O(total word length + chars) time with O(26) counts. The trace accepts up to 6 words of up to 6 letters and 20 supply letters.',
  examples: [
    { label: 'Three words', input: '{"words":["ab","bc","abc"],"chars":"abcc"}' },
    { label: 'Missing copy', input: '{"words":["aa","b"],"chars":"a"}' },
    { label: 'Exact fit', input: '{"words":["xyz","xyzz"],"chars":"xyzy"}' },
  ],
}

export default function FormableWordsWorkspace() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <Supply snapshot={step.snapshot} />}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
