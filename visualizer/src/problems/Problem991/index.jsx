import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  number: '991',
  title: 'Broken Calculator',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with startValue and target: whole numbers from 1 to 1000000000',
  url: 'https://leetcode.com/problems/broken-calculator/',
  complexity: 'O(log target) backward steps, plus one subtraction for the final gap.',
  examples: [
    { label: 'Double, then drop one', input: JSON.stringify({ startValue: 3, target: 7 }) },
    { label: 'Small target', input: JSON.stringify({ startValue: 6, target: 2 }) },
    { label: 'Several halvings', input: JSON.stringify({ startValue: 2, target: 50 }) },
  ],
}

export default function Problem991() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { startValue, target } = run.input
    return <section aria-label="Undo chain from the target" style={{ display: 'grid', gap: 8 }}>
      <p style={{ margin: 0, color: 'var(--text)' }}>Start <strong>{startValue}</strong> · target <strong>{target}</strong></p>
      <ol aria-label="Values, working back from the target" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: 0, alignItems: 'center' }}>
        {step.chain.map((value, index) => <li key={index} data-value={value} style={{
          padding: '6px 10px', borderRadius: 6, color: 'var(--text)',
          border: `2px solid ${index === step.chain.length - 1 ? 'var(--primary)' : 'var(--border)'}`,
          background: index === 0 ? 'var(--surface2)' : 'var(--surface)',
        }}>
          <strong>{value}</strong>{index === 0 ? <small style={{ color: 'var(--text-muted)' }}> target</small> : null}
        </li>)}
      </ol>
      {step.gap > 0 && step.phase !== 'back' && <p style={{ margin: 0, color: 'var(--text)' }}>
        Final gap: {step.gap} subtraction{step.gap === 1 ? '' : 's'} from {step.after} down to {startValue}.
      </p>}
      <p style={{ margin: 0, color: 'var(--text-muted)' }}>Each value follows from the one before by undoing one operation. Odd values are raised by one, even values are halved.</p>
    </section>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
