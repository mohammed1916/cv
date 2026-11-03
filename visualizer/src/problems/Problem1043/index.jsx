import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with arr and k (JSON), such as {"arr":[4,1,7,2],"k":2}',
  url: 'https://leetcode.com/problems/partition-array-for-maximum-sum/',
  complexity: 'O(n * k) time and O(n) space: each prefix tries every block length up to k.',
  examples: [
    { label: 'Mixed blocks', input: '{"arr":[4,1,7,2],"k":2}' },
    { label: 'Peak inside', input: '{"arr":[1,9,2,8,3],"k":3}' },
    { label: 'Single value', input: '{"arr":[5],"k":1}' },
  ],
}

function Blocks({ run, step }) {
  const { arr } = run.input
  const { blockStart, blockEnd, i } = step.snapshot
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
    {arr.map((value, index) => {
      const inBlock = blockStart !== null && index >= blockStart && index <= blockEnd
      const inPrefix = index < i
      return <div key={index} data-index={index} style={{
        minWidth: 44, padding: '8px 6px', textAlign: 'center', fontFamily: 'monospace',
        border: `${inBlock ? 2 : 1}px solid ${inBlock ? '#0891b2' : 'var(--border)'}`,
        background: inBlock ? 'rgba(8,145,178,.18)' : inPrefix ? 'var(--surface2)' : 'transparent',
        color: 'var(--text)',
      }}>
        <div>{value}</div>
        <div style={{ fontSize: '.7rem', color: 'var(--text-dim)' }}>{index}</div>
      </div>
    })}
  </div>
}

export default function PartitionWorkspace() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <Blocks run={run} step={step} />
      <output aria-label="Best totals">{`best = [${step.snapshot.best.join(', ')}]`}</output>
    </>}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>The last block of a prefix ending at i has some length L. Its replaced sum is L times its maximum, added to the best total for the prefix before it. Trying every L up to k and keeping the largest total gives the answer.</p>
    </>}
  />
}
