import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1085',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of integers from 1 to 999',
  url: 'https://leetcode.com/problems/sum-of-digits-in-the-minimum-number/',
  complexity: 'O(n) time for the minimum scan and O(d) for the digits of the minimum, with O(1) extra space.',
  examples: [
    { label: 'Even digit sum', input: '[42,17,8]' },
    { label: 'Odd digit sum', input: '[123,45,67]' },
    { label: 'Single value', input: '[7]' },
  ],
}

export default function MinimumDigitSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { values, smallest, index, digits, total } = step.state
    return <div>
      <div role="img" aria-label="Values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontFamily: 'monospace' }}>
        {values.map((value, position) => <span key={position} data-value={position} style={{
          padding: '4px 8px',
          border: `2px solid ${position === index ? 'var(--accent, #0891b2)' : 'var(--border)'}`,
          fontWeight: value === smallest ? 700 : 400,
        }}>{value}</span>)}
      </div>
      <p aria-label="Minimum">{`Minimum so far: ${smallest}`}</p>
      {digits.length > 0 && <p aria-label="Digit sum">{`Digits ${digits.join(' + ')} = ${total}`}</p>}
    </div>
  }} renderReasoning={() => <>
    <p><strong>Order matters:</strong> the minimum is chosen first, and only its digits are summed. Summing digits of every value would answer a different question.</p>
    <p><strong>Parity:</strong> the answer is one when the digit total is even and zero when it is odd.</p>
  </>} />
}
