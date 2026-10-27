import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Focus on the point that the path must contain.' },
    { id: 'visit', label: 'Explore', description: 'Look for points beyond this one in the chosen direction.' },
    { id: 'reuse', label: 'Memo hit', description: 'Reuse the chain length already stored for this point.' },
    { id: 'store', label: 'Store', description: 'Save the longest chain for this point and direction.' },
    { id: 'done', label: 'Complete', description: 'Join the two chains through the chosen point.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with coordinates (1 to 10 distinct [x, y] points) and k',
  url: 'https://leetcode.com/problems/length-of-the-longest-increasing-path/',
  complexity: 'O(n^2) time for the two memoized searches over n points. The visualization caps input at 10 points.',
  examples: [
    { label: 'Example 1', input: '{"coordinates":[[3,1],[2,2],[4,1],[0,0],[5,3]],"k":1}' },
    { label: 'Example 2', input: '{"coordinates":[[2,1],[7,0],[5,6]],"k":2}' },
  ],
}

export default function LongestIncreasingPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { coordinates, k } = run.input
    const values = new Map(step.memo.map(e => [e.index, e]))
    return <>
      <table aria-label="Points">
        <thead><tr><th>Index</th><th>Point</th><th>Rising</th><th>Falling</th></tr></thead>
        <tbody>{coordinates.map((p, i) => {
          const row = values.get(i)
          return <tr key={i} className={`${i === k ? 'is-kth ' : ''}${step.index === i ? 'is-active' : ''}`.trim()}>
            <td>{i}{i === k ? ' (required)' : ''}</td><td>({p[0]}, {p[1]})</td>
            <td>{row?.rising ?? '-'}</td><td>{row?.falling ?? '-'}</td>
          </tr>
        })}</tbody>
      </table>
      <output aria-label="Current step">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>A path is strictly increasing in both coordinates, so the path through a fixed point splits into a chain rising from it and a chain falling into it.</p>
    <p>Each direction is memoized per point. Adding the two chains and subtracting one counts the required point once.</p>
  </>} />
}
