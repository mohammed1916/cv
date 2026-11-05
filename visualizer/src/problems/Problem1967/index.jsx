import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1967',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with patterns and word (e.g. {"patterns":["ab","cd","a"],"word":"xaby"})',
  url: 'https://leetcode.com/problems/number-of-strings-that-appear-as-substrings-in-word/',
  complexity: 'O(p * m * n) with a naive substring test, where p patterns of length up to m are searched in a word of length n. The visualization caps sizes at 8 patterns and 30 characters.',
  examples: [
    { label: 'Two found', input: '{"patterns":["ab","cd","a"],"word":"xaby"}' },
    { label: 'None found', input: '{"patterns":["z"],"word":"abc"}' },
  ],
}

export default function Problem1967Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <p style={{ fontFamily: 'monospace' }}>word: {run.input.word}</p>
      <ul aria-label="Patterns checked" style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 6 }}>
        {run.input.patterns.map((p, i) => {
          const check = step.checks[i]
          return <li key={i} style={{ display: 'flex', gap: 10, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: check ? (check.hit ? 'color-mix(in srgb, var(--success, #16a34a) 18%, var(--surface2))' : 'var(--surface2)') : 'var(--surface2)', opacity: check ? 1 : 0.5 }}>
            <code>{p}</code><span>{check ? (check.hit ? 'found' : 'not found') : 'not checked yet'}</span>
          </li>
        })}
      </ul>
      <output aria-label="Found count">Found: {step.found}</output>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
