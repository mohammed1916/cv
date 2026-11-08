import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare to answer the queries.' },
    { id: 'search', label: 'Block search', description: 'Binary search for the last block that fits, with lo and hi narrowing.' },
    { id: 'exponent', label: 'Exponent sum', description: 'Sum the exponents of the range using block counts.' },
    { id: 'power', label: 'Power mod', description: 'Raise 2 to the exponent sum, modulo the query modulus.' },
    { id: 'done', label: 'Complete', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with queries: triples [from, to, mod] with 0 <= from <= to <= 300 and 1 <= mod <= 1000, e.g. {"queries":[[1,3,7]]}',
  url: 'https://leetcode.com/problems/find-products-of-elements-of-big-array/',
  complexity: 'O(q * log^2 N) time, where N is the largest index. The visualization caps indices at 300.',
  examples: [
    { label: 'Example 1', input: '{"queries":[[1,3,7]]}' },
    { label: 'Example 2', input: '{"queries":[[2,5,3],[7,7,4]]}' },
    { label: "Same start and end", input: "{\"queries\":[[5,5,7]]}" },
    { label: "Single index, mod one", input: "{\"queries\":[[0,0,1]]}" },
    { label: "Full range, largest mod", input: "{\"queries\":[[0,300,1000]]}" },
    { label: "Long run: six queries", input: "{\"queries\":[[258,282,217],[263,291,897],[124,225,297],[14,33,209],[187,195,777],[16,88,617]]}" },
  ],
}

// The first 302 entries of big_nums as exponents of two: block x lists the set bits of x, lowest first.
const EXPONENTS = (() => {
  const out = []
  for (let x = 1; out.length < 302; x++) {
    for (let b = 0; (1 << b) <= x && out.length < 302; b++) if ((x >> b) & 1) out.push(b)
  }
  return out
})()

export default function ProductsOfBigArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="big_nums exponents (entry i is 2 to the power shown)" length={EXPONENTS.length}
      valueAt={i => EXPONENTS[i]} active={step.query >= 0 ? run.input.queries[step.query][0] : -1}
      roleAt={i => { if (step.query < 0) return ''; const [from, to] = run.input.queries[step.query]; return i === from ? 'l' : i === to ? 'r' : i > from && i < to ? 'in range' : '' }} />
    {step.phase === 'search' && <AnswerRangeBar title="Block search range for exponentBefore" min={0} max={step.top} low={step.lo} high={step.hi} probe={step.mid} verdict={step.ok} />}
    <table aria-label="Queries">
    <thead><tr><th>Query</th><th>[from, to, mod]</th><th>Exponent sum</th><th>Answer</th></tr></thead>
    <tbody>{run.input.queries.map((q, i) => (
      <tr key={i} data-current={step.query === i ? 'yes' : undefined}>
        <td>{i}</td>
        <td>{`[${q.join(', ')}]`}</td>
        <td>{step.query === i && step.total !== null ? step.total : '-'}</td>
        <td>{step.query === i && step.value !== null ? step.value : '-'}</td>
      </tr>))}</tbody>
  </table>
  </>} renderReasoning={() => <>
    <p>Each element of the big array is a power of two, so a range product is 2 raised to the sum of the exponents in that range.</p>
    <p>Consecutive powerful arrays appear in blocks of known size, so the exponent sum up to any index comes from a closed formula plus one partial block.</p>
  </>} />
}
