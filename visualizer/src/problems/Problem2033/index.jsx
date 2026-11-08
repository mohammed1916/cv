import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2033',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid rows and step x (JSON)',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-a-uni-value-grid/',
  complexity: 'O(m * n log(m * n)) time for the sort; the median is read in O(1).',
  examples: [
    { label: 'Sorted median', input: '{"grid":[[3,9],[15,21]],"x":3}' },
    { label: 'Unit step', input: '{"grid":[[4,8,2]],"x":2}' },
    { label: 'Remainder mismatch', input: '{"grid":[[1,3],[4,6]],"x":2}' }, { label: "Single cell", input: "{\"grid\":[[5]],\"x\":1}" }, { label: "Equal cells", input: "{\"grid\":[[2,2],[2,2]],\"x\":2}" }, { label: "Largest values", input: "{\"grid\":[[1000,1000,1000,1000,1000,1000],[1000,1000,1000,1000,1000,1000],[1000,1000,1000,1000,1000,1000],[1000,1000,1000,1000,1000,1000],[1000,1000,1000,1000,1000,1000],[1000,1000,1000,1000,1000,1000]],\"x\":100}" }, { label: "Long run: 6 by 6", input: "{\"grid\":[[619,273,669,578,426,597],[990,9,576,746,298,294],[816,94,173,539,159,703],[378,83,624,163,607,298],[210,43,682,540,326,589],[500,508,102,570,333,540]],\"x\":50}" },
  ],
}

export default function MinimumOperationsUniValueGrid() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { values, x, residue, ordered, median, distances } = step.snapshot
    return <>
      <p>Remainder every value must share: <strong>{residue}</strong> (mod {x}).</p>
      {ordered && <div aria-label="Sorted quotients" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {ordered.map((q, i) => {
          const isMid = i === Math.floor(ordered.length / 2)
          return <span key={i} style={{
            border: `${isMid ? 2 : 1}px solid ${isMid ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 4, padding: '2px 8px', fontFamily: 'monospace', color: 'var(--text)',
            background: isMid ? 'var(--primary-glow)' : 'transparent',
          }}>{q}{isMid ? ' median' : ''}{distances ? <small style={{ display: 'block', color: 'var(--text-muted)' }}>|{q} - {median}| = {distances[i]}</small> : null}</span>
        })}
      </div>}
      {median !== null && median !== undefined && <p>Median quotient: <strong>{median}</strong>. Each move changes a quotient by one.</p>}
      {!ordered && <p>Values: {values.join(', ')}</p>}
    </>
  }} renderReasoning={() => <p>Every operation changes a value by x, so after checking the remainders the problem is to move all quotients to one target with the fewest unit steps. The median is the best target for that sum.</p>} />
}
