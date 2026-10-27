import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'build', label: 'Build table', description: 'Fill each level with ANDs of blocks twice as long as the level below.' },
    { id: 'search', label: 'Search r', description: 'For each left end, binary search the first right end whose AND reaches the target.' },
    { id: 'record', label: 'Record', description: 'Compare the closest candidates on both sides of the target.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest distance to the target.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with "arr" (0 to 1023, up to 12 values) and "target"',
  url: 'https://leetcode.com/problems/find-a-value-of-a-mysterious-function-closest-to-target/',
  complexity: 'O(n log n) to build the sparse table and O(n log n) binary-search queries; each AND range query is O(1).',
  examples: [
    { label: 'Example 1', input: '{"arr":[9,12,3,7,1],"target":5}' },
    { label: 'Powers of two', input: '{"arr":[1,2,4,8,16],"target":0}' },
    { label: 'Single value', input: '{"arr":[7],"target":2}' },
  ],
}

export default function ClosestToTarget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const arr = run.input.arr
    const l = step.l ?? -1
    const inRange = index => l >= 0 && step.lo !== undefined && index >= l && index <= (step.mid ?? step.first ?? l)
    const roleAt = index => {
      if (index === step.mid) return 'probe'
      if (step.first !== undefined && step.first !== -1 && index === step.first) return 'first r'
      if (inRange(index)) return 'range'
      return ''
    }
    return <>
      <IndexedSequence label="Array" length={arr.length} valueAt={index => arr[index]} active={l >= 0 ? l : -1} roleAt={roleAt} />
      <section aria-label="Sparse table">
        <h3>Sparse table (AND of blocks of 2^level)</h3>
        <table>
          <tbody>{step.table.map((row, level) => <tr key={level}>
            <th scope="row">level {level}</th>
            {row.map((value, index) => <td key={index}>{value}</td>)}
          </tr>)}</tbody>
        </table>
      </section>
      <output aria-label="Best distance">{`Best distance so far: ${Number.isFinite(step.best) ? step.best : '∞'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Taking AND over a longer subarray can only clear bits, so the value falls as r grows. Binary search finds the first r where it is at most the target.</p>
    <p>The sparse table answers any AND range in constant time, because the two overlapping power-of-two blocks cover the range and AND is idempotent.</p>
  </>} />
}
