import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty tally', description: 'Start with no counts.' },
    { id: 'tally', label: 'Tally arrays', description: 'Add one to each value an array contains.' },
    { id: 'select', label: 'Keep all', description: 'Keep values whose count equals the number of arrays.' },
    { id: 'done', label: 'Sort', description: 'Return the kept values in ascending order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Arrays (JSON array of arrays of distinct integers)',
  url: 'https://leetcode.com/problems/intersection-of-multiple-arrays/',
  complexity: 'O(total elements + V log V) time, where V is the number of distinct kept values. The visualization caps input at 6 arrays.',
  examples: [
    { label: 'Example 1', input: '[[3,1,2,4,5],[1,2,3,4],[3,4,5,6]]' },
    { label: 'Empty', input: '[[1,2],[3,4]]' },
  ],
}

export default function MultiIntersection() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const values = Object.keys(step.counts).map(Number).sort((x, y) => x - y)
    return <>
      <table aria-label="Tally of values"><thead><tr><th>Value</th><th>Arrays containing it</th><th>In all arrays</th></tr></thead><tbody>
        {values.map(v => <tr key={v} data-value={v}>
          <th>{v}</th><td>{step.counts[v]}</td><td>{step.counts[v] === run.input.length ? 'yes' : 'no'}</td>
        </tr>)}
      </tbody></table>
      <output aria-label="Intersection state">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Within one array the values are distinct, so a count of how many arrays contain a value is exactly the number of arrays it appears in.</p>
    <p>A value belongs to the intersection when that count equals the number of arrays.</p>
  </>} />
}
