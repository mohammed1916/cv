import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'factor', label: 'Factor', description: 'Write t as powers of 2, 3, 5 and 7.' },
    { id: 'prefix', label: 'Prefix', description: 'Keep the first i digits of num.' },
    { id: 'raise', label: 'Raise', description: 'Put a larger digit at position i.' },
    { id: 'fill', label: 'Fill', description: 'Use the smallest digits that finish the product.' },
    { id: 'longer', label: 'Longer', description: 'No same-length answer exists.' },
    { id: 'done', label: 'Result', description: 'Report the number or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with num (digit string) and t',
  url: 'https://leetcode.com/problems/smallest-divisible-digit-product-ii/description/',
  complexity: 'Teaching model: prefix scan with memoised fewest-digit counts over exponent vectors. The visualization caps t at 1000000.',
  examples: [
    { label: 'Raise a digit', input: '{"num":"3579","t":30}' },
    { label: 'Already fits', input: '{"num":"2468","t":64}' },
    { label: 'Impossible', input: '{"num":"7","t":11}' },
  ],
}

const NAMES = ['2', '3', '5', '7']

export default function SmallestDivisibleDigitProduct() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const digits = String(step.digits ?? run.input.num)
    const keep = step.keep
    const raise = step.raise
    return <>
      <div aria-label="Digits" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[...digits].map((ch, i) => {
          const role = i === raise ? 'raised' : i < keep ? 'kept' : i > raise && raise >= 0 ? 'filler' : ''
          return <div key={i} data-role={role} style={{ minWidth: 40, padding: '0.5rem', textAlign: 'center', borderRadius: 6, border: `2px solid ${role === 'raised' ? 'var(--primary)' : 'var(--border)'}`, opacity: role === 'filler' ? 0.8 : 1 }}>
            <strong>{ch}</strong>
            <small style={{ display: 'block' }}>{role || (i === keep ? 'split' : ' ')}</small>
          </div>
        })}
      </div>
      <ul aria-label="Exponents still needed" style={{ listStyle: 'none', padding: 0, display: 'flex', gap: 12, marginTop: 12 }}>
        {step.need.map((x, i) => <li key={NAMES[i]}>{`${NAMES[i]}^${x}`}</li>)}
      </ul>
      <output aria-label="Digit check">{`${step.message}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The answer keeps the longest possible prefix of num. Raising one digit beats any longer-prefix choice only when it is the first difference, so the scan goes from the longest prefix down.</p>
    <p>Only the exponents of 2, 3, 5 and 7 matter, and a digit of 1 contributes nothing, so the rest can be filled greedily with the smallest digit that still leaves room.</p>
  </>} />
}
