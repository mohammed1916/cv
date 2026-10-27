import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Table', description: 'Set up the border values of the table.' },
    { id: 'fill', label: 'Fill cell', description: 'Each cell uses its diagonal or its smaller neighbour.' },
    { id: 'walk', label: 'Walk', description: 'Emit characters from the top-left corner along shortest moves.' },
    { id: 'done', label: 'Complete', description: 'Report the supersequence.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two strings as JSON: str1, str2',
  url: 'https://leetcode.com/problems/shortest-common-supersequence/',
  complexity: 'O(n * m) time and O(n * m) space for the table. The visualization caps each string at 8 letters.',
  examples: [
    { label: 'Example 1', input: '{"str1":"abac","str2":"cab"}' },
    { label: 'Example 2', input: '{"str1":"aaaa","str2":"aa"}' },
  ],
}

export default function ShortestCommonSupersequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { str1, str2 } = run.input
    return <>
      <table aria-label="Supersequence table">
        <thead><tr><th>i \ j</th>{[...str2, ''].map((ch, j) => <th key={j}>{ch || 'end'}</th>)}</tr></thead>
        <tbody>{[...str1, ''].map((ch, i) => (
          <tr key={i}><th>{ch || 'end'}</th>{step.dp[i].map((value, j) => {
            const current = step.cell && step.cell[0] === i && step.cell[1] === j
            return <td key={j} className={current ? 'is-current' : ''} aria-current={current ? 'step' : undefined}>{value === null ? '' : value}</td>
          })}</tr>
        ))}</tbody>
      </table>
      <output aria-label="Answer so far">{`Answer so far: ${step.answer || '(empty)'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The table counts the shortest supersequence of each suffix pair, so the top-left cell is the answer length.</p>
    <p>Walking from the corner, a matching pair of letters is emitted once; otherwise the walk moves toward the smaller neighbour, which keeps the total length minimal.</p>
  </>} />
}
