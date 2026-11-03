import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1323',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with num (JSON)',
  url: 'https://leetcode.com/problems/maximum-69-number/',
  complexity: 'O(d) time and O(d) space for d digits, where the number is short enough to scan once.',
  examples: [
    { label: 'First six', input: '{"num":9669}' },
    { label: 'Only nines', input: '{"num":9996}' },
    { label: 'Leading six', input: '{"num":6666}' },
  ],
}

const cell = { minWidth: 40, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', fontSize: 18 }

export default function Maximum69Number() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { digits, index, changedAt } = step.snapshot
    return <>
      <div role="img" aria-label="Digits of the number" style={{ display: 'flex', gap: 6 }}>
        {digits.map((d, i) => <div key={i} style={{ ...cell,
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
          background: i === changedAt ? '#bbf7d0' : i === index ? 'var(--surface2)' : 'transparent', color: i === changedAt ? '#1c1917' : undefined,
        }}><div>{d}</div><small>{i}</small></div>)}
      </div>
      <p>{changedAt !== null ? `Changed position ${changedAt} from 6 to 9.` : index === null ? 'Reading digits from the left.' : 'Looking for the first 6.'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Place value:</strong> the leftmost digit carries the most weight, so the first 6 is the best change.</p>
    <p><strong>One change:</strong> later digits change less of the total value, so no further edit is needed.</p>
  </>} />
}
