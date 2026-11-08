import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

function Chips({ label, values, tone }) {
  return <section aria-label={label}>
    <h4>{label}</h4>
    <ol style={{ display: 'flex', gap: 6, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
      {values.length ? values.map((v, i) => <li key={i} style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '4px 8px', background: tone === 'best' ? 'var(--primary)' : 'var(--surface2)', color: tone === 'best' ? 'var(--on-primary, #fff)' : 'var(--text)' }}>{v}</li>) : <li>none yet</li>}
    </ol>
  </section>
}

const definition = {
  phases: [
    { id: 'start', label: 'Divisors', description: 'List the divisors of n; each factor comes from this list.' },
    { id: 'try', label: 'Candidate', description: 'A full split was built; compare its max-min gap.' },
    { id: 'done', label: 'Result', description: 'The split with the smallest gap is returned.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and k',
  url: 'https://leetcode.com/problems/balanced-k-factor-decomposition/',
  complexity: 'Search over non-decreasing divisor lists, pruned by the product bound. The visualization caps n at 1000.',
  examples: [
    { label: 'Example', input: '{"n":60,"k":3}' },
    { label: 'Square', input: '{"n":36,"k":2}' },
    { label: 'Smallest n', input: '{"n":4,"k":2}' },
    { label: 'Twelve divisors', input: '{"n":12,"k":5}' },
    { label: 'Largest n', input: '{"n":1000,"k":5}' },
    { label: 'Long run: n = 840', input: '{"n":840,"k":3}' },
  ],
}

export default function BalancedKFactorDecomposition() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Chips label="Candidate factors" values={step.parts ?? []} />
    <Chips label="Best factors so far" values={step.best ?? []} tone="best" />
    <output aria-label="Factor split">{`n = ${run.input.n}, k = ${run.input.k}; candidate [${(step.parts ?? []).join(', ')}], best [${(step.best ?? []).join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>Every factor divides n, so the search only tries divisors. Keeping factors in non-decreasing order avoids testing the same multiset twice.</p>
    <p>Once k - 1 factors are chosen, the last factor is forced to be what remains, so the spread is known immediately.</p>
  </>} />
}
