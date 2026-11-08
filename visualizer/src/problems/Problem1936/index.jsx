import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1936',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with rungs (strictly increasing) and dist (e.g. {"rungs":[2,5,9],"dist":3})',
  url: 'https://leetcode.com/problems/add-minimum-number-of-rungs/',
  complexity: 'O(n) time: one pass over the rungs with a constant-time division for each gap.',
  examples: [
    { label: 'One gap too wide', input: '{"rungs":[2,5,9],"dist":3}' },
    { label: 'Already reachable', input: '{"rungs":[3,6,8,10],"dist":3}' },
    { label: 'Single rung', input: '{"rungs":[5],"dist":1}' },
    { label: 'Gap exactly reachable', input: '{"rungs":[1,3,5],"dist":2}' },
    { label: 'Largest span: ten rungs', input: '{"rungs":[10,20,30,40,50,60,70,80,90,100],"dist":50}' },
  ],
}

export default function Problem1936Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const top = Math.max(...run.input.rungs, 1)
      return <>
        <div aria-label="Ladder" style={{ position: 'relative', height: 220, width: 120, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface2)' }}>
          {run.input.rungs.map(r => <div key={r} style={{ position: 'absolute', left: 10, right: 10, bottom: `${(r / (top + 1)) * 200}px`, borderTop: '3px solid var(--text)' }}>
            <small style={{ position: 'absolute', right: 0, top: -16 }}>{r}</small>
          </div>)}
          {step.from >= 0 && <div aria-label="Current climb" style={{ position: 'absolute', left: 50, width: 4, bottom: `${(step.from / (top + 1)) * 200}px`, height: `${((step.to - step.from) / (top + 1)) * 200}px`, background: step.need ? 'var(--danger, #dc2626)' : 'var(--primary)' }} />}
        </div>
        <p>Dist per climb: <strong>{run.input.dist}</strong>. Climb from {step.from < 0 ? '-' : step.from} to {step.to < 0 ? '-' : step.to}, gap {step.gap}.</p>
        <output aria-label="Rungs added">Added so far: {step.added}</output>
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
