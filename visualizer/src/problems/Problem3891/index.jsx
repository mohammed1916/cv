import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, costOf } from './algorithm'

const definition = {
  phases: [
    { id: 'cost', label: 'Costs', description: 'Price each interior index.' },
    { id: 'dp', label: 'Choose', description: 'Decide whether to make this index special.' },
    { id: 'done', label: 'Result', description: 'Report the minimum raises.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, a list of integers from 0 to 20',
  url: 'https://leetcode.com/problems/minimum-increase-to-maximize-special-indices/',
  complexity: 'O(n) time for the costs and the two-step DP. The visual caps nums at 12 values.',
  examples: [
    { label: 'Example A', input: '{"nums":[3,3,1,3]}' },
    { label: 'Example B', input: '{"nums":[4,4,1,2]}' },
    { label: 'Single zero', input: '{"nums":[0]}' },
    { label: 'Single maximum', input: '{"nums":[20]}' },
    { label: 'Equal values', input: '{"nums":[5,5,5]}' },
    { label: 'Long run: 12 values', input: '{"nums":[15,6,1,20,20,18,13,0,10,8,0,16]}' },
  ],
}

// The DP as a table: one row per interior index, the raise cost of making it special,
// and the best (special count, total cost) over the candidates so far.
function ChooseTable({ nums, frames, current }) {
  const rows = frames.filter(f => f.phase === 'dp' && (current === null || f.k <= current))
  return <table aria-label="Choices by index">
    <thead><tr><th scope="col">index</th><th scope="col">raise cost</th><th scope="col">best special count</th><th scope="col">best cost</th><th scope="col">choice</th></tr></thead>
    <tbody>{nums.map((_, i) => {
      if (i === 0 || i === nums.length - 1) return null
      const row = rows.find(f => f.k === i)
      return <tr key={i} data-current={current === i ? 'yes' : undefined}>
        <th scope="row">{i}</th><td>{costOf(nums, i)}</td>
        <td>{row ? row.best.count : ''}</td><td>{row ? row.best.cost : ''}</td>
        <td>{row ? (row.pickedTake ? 'make special' : 'skip') : ''}</td>
      </tr>
    })}</tbody>
  </table>
}

export default function MinimumIncreaseToMaximizeSpecialIndices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { frames } = buildTrace(run.input)
    const nums = run.input.nums
    return <>
      <section className="algorithm-sequence" aria-label="Values and raise costs">
        <h3>Values and raise cost</h3>
        <div className="algorithm-sequence__cells">{nums.map((v, i) => (
          <div key={i} className={`algorithm-sequence__cell ${i === step.k ? 'is-active' : ''}`} data-role={step.best && step.best.chosen.includes(i) ? 'window' : ''}>
            <small>[{i}]</small><strong>{v}</strong><span>{i > 0 && i < nums.length - 1 ? `cost ${costOf(nums, i)}` : 'edge'}</span>
          </div>))}</div>
      </section>
      <ChooseTable nums={nums} frames={frames} current={step.k >= 0 ? step.k : null} />
      <output aria-label="Best choice so far">{step.best ? `Special ${step.best.count}, cost ${step.best.cost}. ${step.message}` : step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Two special indices cannot be neighbours, because each would have to be larger than the other. So the choice is a set of interior positions with gaps between them.</p>
    <p>Raising a value only ever helps that position itself, so each chosen index is priced as the raise needed to beat its larger neighbour.</p>
  </>} />
}
