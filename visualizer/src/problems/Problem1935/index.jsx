import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1935',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with text (words separated by single spaces) and broken (distinct letters)',
  url: 'https://leetcode.com/problems/maximum-number-of-words-you-can-type/',
  complexity: 'O(total length) time using a set of broken letters.',
  examples: [
    { label: 'Mixed words', input: '{"text":"tree sun gold","broken":"xq"}' },
    { label: 'All broken', input: '{"text":"red blue","broken":"e"}' },
  ],
}

export default function Problem1935Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <p>Broken letters: <strong>{run.input.broken || 'none'}</strong></p>
      <ul aria-label="Words checked" style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 6 }}>
        {step.verdicts.map((v, i) => <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: v.ok ? 'color-mix(in srgb, var(--success, #16a34a) 18%, var(--surface2))' : 'var(--surface2)' }}>
          <strong style={{ fontFamily: 'monospace' }}>{v.word}</strong>
          <span>{v.ok ? 'typable' : `blocked by ${v.bad}`}</span>
        </li>)}
      </ul>
      <output aria-label="Typable count">Typable so far: {step.typable}</output>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
