import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1006',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (JSON)',
  url: 'https://leetcode.com/problems/clumsy-factorial/',
  complexity: 'O(n) time and O(n) space for the stored signed terms, with n capped at 60 in this view.',
  examples: [
    { label: 'Seven', input: '{"n":7}' },
    { label: 'Four', input: '{"n":4}' },
    { label: 'Ten', input: '{"n":10}' },
  ],
}

export default function ClumsyFactorial() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { terms, term, next, op } = step.snapshot
    return <>
      <div aria-label="Signed terms" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontFamily: 'monospace' }}>
        {terms.map((t, i) => <span key={i} style={{ border: '1px solid var(--border)', padding: '4px 8px', color: '#1c1917', background: t < 0 ? '#fecaca' : '#bbf7d0' }}>{t}</span>)}
        {term !== null && <span style={{ border: '2px solid var(--text)', padding: '4px 8px', color: '#1c1917', background: 'var(--surface2)' }}>current {term}</span>}
      </div>
      <p>{next !== null ? `Next number ${next}, operation ${op}.` : 'All numbers are consumed.'}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Precedence:</strong> multiply and divide bind to the term they touch, so the chain is resolved before any addition or subtraction.</p>
    <p><strong>Signs:</strong> a subtraction starts a negative term. Truncating a product with a negative sign keeps the rounding toward zero consistent.</p>
  </>} />
}
