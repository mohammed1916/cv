import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  number: '990',
  title: 'Satisfiability of Equality Equations',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with equations: strings such as "a==b" or "c!=d" using lowercase letters',
  url: 'https://leetcode.com/problems/satisfiability-of-equality-equations/',
  complexity: 'O(n) union-find work over the equations, with an almost-constant cost per merge and lookup.',
  examples: [
    { label: 'Chain of equalities', input: JSON.stringify({ equations: ['p==q', 'q==r', 'p!=s'] }) },
    { label: 'Conflict through a chain', input: JSON.stringify({ equations: ['m==n', 'n==o', 'm!=o'] }) },
    { label: 'Two separate groups', input: JSON.stringify({ equations: ['a==b', 'c!=d', 'd==e'] }) },
  ],
}

function groupsOf(step) {
  return step.groups.map(group => `{${group.join(', ')}}`).join('  ')
}

export default function Problem990() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <section aria-label="Groups of variables that must be equal" style={{ display: 'grid', gap: 6 }}>
      <h3 style={{ margin: 0 }}>Groups of equal variables</h3>
      <p data-groups style={{ margin: 0, color: 'var(--text)', fontFamily: 'var(--mono, monospace)' }}>{groupsOf(step) || 'none yet'}</p>
    </section>
    {step.equation && <section aria-label="Equation being processed" style={{
      border: `2px solid ${step.status === 'conflict' ? 'var(--danger)' : 'var(--primary)'}`,
      borderRadius: 8, padding: 10, color: 'var(--text)', background: 'var(--surface)',
    }}>
      <strong>{step.equation}</strong> · {step.status === 'merged' ? 'merged into a group' : step.status === 'conflict' ? 'conflict: the two variables are already in one group' : 'holds'}
    </section>}
    <p style={{ margin: 0, color: 'var(--text-muted)' }}>First every "==" joins a group. Then every "!=" must connect two different groups.</p>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
