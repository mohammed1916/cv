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
    const ops = ['*', '/', '+', '-']
    const n = run.input.n
    const tokens = []
    for (let x = n; x >= 1; x--) tokens.push({ x, before: x === n ? null : ops[(n - x - 1) % 4] })
    return <>
      <p style={{ fontFamily: 'monospace', color: 'var(--text)', overflowWrap: 'anywhere' }} aria-label="Expression so far">{tokens.map(({ x, before }) => <span key={x} style={{ color: next !== null && x < next ? 'var(--text)' : next === x ? 'var(--primary)' : 'var(--muted, var(--text))', fontWeight: next === x ? 700 : 400 }}>{before ? ` ${before} ` : ''}{x}</span>)}</p>
      <div aria-label="Signed terms" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontFamily: 'monospace' }}>
        {terms.map((t, i) => <span key={i} style={{ border: '1px solid var(--border)', padding: '4px 8px', color: 'var(--text)', background: t < 0 ? 'var(--surface2)' : 'transparent' }}>{t < 0 ? '-' : '+'} {Math.abs(t)}</span>)}
        {term !== null && <span style={{ border: '2px solid var(--primary)', padding: '4px 8px', color: 'var(--text)', background: 'var(--surface2)' }}>current {term}</span>}
      </div>
      <p>{next !== null ? `Next number ${next}, operation ${op}.` : 'All numbers are consumed; the terms are added.'}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Precedence:</strong> multiply and divide bind to the term they touch, so the chain is resolved before any addition or subtraction.</p>
    <p><strong>Signs:</strong> a subtraction starts a negative term. Each multiply or divide acts on the current term, which stays positive until a subtraction.</p>
  </>} />
}
