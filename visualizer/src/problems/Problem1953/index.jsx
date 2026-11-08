import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1953',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of milestone counts (e.g. [4,1,1])',
  url: 'https://leetcode.com/problems/maximum-number-of-weeks-for-which-you-can-work/',
  complexity: 'O(n) time and O(1) extra space for the sum and maximum.',
  examples: [
    { label: 'Capped by the largest', input: '[4,1,1]' },
    { label: 'Balanced', input: '[1,2,3]' },
    { label: 'Single project at the limit', input: '[30]' },
    { label: 'Equal projects', input: '[5,5,5]' },
    { label: 'Long run: eight projects', input: '[17,2,7,28,1,26,19,24]' },
  ],
}

export default function Problem1953Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const max = Math.max(...run.input.milestones)
      return <>
        <div aria-label="Milestones per project" style={{ display: 'grid', gap: 6 }}>
          {run.input.milestones.map((m, i) => <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 80 }}>Project {i}</span>
            <div style={{ height: 16, width: m * 18, borderRadius: 4, background: m === max && step.largest !== null ? 'var(--primary)' : 'var(--surface2)', border: '1px solid var(--border)' }} />
            <span>{m}</span>
          </div>)}
        </div>
        {step.rest !== null && <p>Largest: <strong>{step.largest}</strong>; rest: <strong>{step.rest}</strong></p>}
        {step.result !== null && <output aria-label="Weeks">Weeks: {step.result}</output>}
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
