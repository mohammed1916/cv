import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1961',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with s and words (e.g. {"s":"catdog","words":["cat","dog","bird"]})',
  url: 'https://leetcode.com/problems/check-if-string-is-a-prefix-of-array/',
  complexity: 'O(total characters) time. Each word is appended once and the build is compared with s.',
  examples: [
    { label: 'Matches after two words', input: '{"s":"catdog","words":["cat","dog","bird"]}' },
    { label: 'Overshoots', input: '{"s":"catdo","words":["cat","dog"]}' },
    { label: 'Single letter', input: '{"s":"a","words":["a"]}' },
    { label: 'Duplicate words', input: '{"s":"abab","words":["ab","ab"]}' },
    { label: 'Long run: eight words', input: '{"s":"ecdijk","words":["ab","cd","e","fgh","ij","k","lm","n"]}' },
  ],
}

export default function Problem1961Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <p>Target s: <strong style={{ fontFamily: 'monospace' }}>{run.input.s}</strong></p>
      <div aria-label="Build so far" style={{ fontFamily: 'monospace', display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {[...run.input.s].map((ch, i) => <span key={i} style={{ padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 4, background: i < step.built.length ? (step.stop ? 'color-mix(in srgb, var(--danger, #dc2626) 20%, var(--surface2))' : 'color-mix(in srgb, var(--primary) 18%, var(--surface2))') : 'var(--surface2)' }}>{ch}</span>)}
      </div>
      <p>Built so far: <code>{step.built || '(empty)'}</code></p>
      <ol aria-label="Words" style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, flexWrap: 'wrap' }}>
        {run.input.words.map((w, i) => <li key={i} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', background: step.word === w && i === run.input.words.indexOf(step.word) ? 'var(--primary)' : 'var(--surface2)' }}>{w}</li>)}
      </ol>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
