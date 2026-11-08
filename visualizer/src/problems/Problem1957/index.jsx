import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1957',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Lowercase string (e.g. aaaabbcc)',
  url: 'https://leetcode.com/problems/delete-characters-to-make-fancy-string/',
  complexity: 'O(n) time and O(n) space for the kept characters.',
  examples: [
    { label: 'Run of four', input: 'aaaabbcc' },
    { label: 'Mixed run', input: 'xxxyzzzz' },
    { label: 'Single letter', input: 'a' },
    { label: 'Equal letters', input: 'aaaa' },
    { label: 'Long run: 30 letters', input: 'kzingdmvatghebijcfqrufutefyjar' },
  ],
}

export default function Problem1957Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <div aria-label="Input characters" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {[...run.input.s].map((ch, i) => {
          const st = step.status[i]
          const current = i === step.i
          return <span key={i} style={{
            width: 34, height: 40, display: 'grid', placeItems: 'center', fontFamily: 'monospace', borderRadius: 6,
            border: current ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: st === 'deleted' ? 'color-mix(in srgb, var(--danger, #dc2626) 16%, var(--surface2))' : st === 'kept' ? 'var(--surface2)' : 'var(--surface)',
            textDecoration: st === 'deleted' ? 'line-through' : 'none', opacity: st === undefined ? 0.5 : 1,
          }}>{ch}</span>
        })}
      </div>
      <p>Kept so far: <code>{step.out || '(empty)'}</code></p>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
