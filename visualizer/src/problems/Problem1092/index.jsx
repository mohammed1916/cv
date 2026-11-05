import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DPDependencyView from '../../components/shared/DPDependencyView'
import { buildTrace, parseInput, code, python, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel,
  url: 'https://leetcode.com/problems/shortest-common-supersequence/',
  complexity,
  examples,
}

export default function ShortestCommonSupersequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { str1, str2 } = run.input
    const cell = step.cell
    const [i, j] = cell ?? [0, 0]
    const filling = step.phase === 'fill' && cell
    const same = filling && str1[i] === str2[j]
    const sources = filling && i < str1.length && j < str2.length
      ? same
        ? [{ cell: [i + 1, j + 1], note: 'diagonal, plus the shared letter', chosen: true }]
        : [
          { cell: [i + 1, j], note: 'skip a letter of str1', chosen: step.dp[i + 1][j] <= step.dp[i][j + 1] },
          { cell: [i, j + 1], note: 'skip a letter of str2', chosen: step.dp[i][j + 1] < step.dp[i + 1][j] },
        ]
      : []
    return <>
      <DPDependencyView title="Supersequence table (suffix lengths)"
        shape="grid" values={step.dp} target={cell ?? [0, 0]} sources={sources}
        labels={{ rows: [...str1, 'end'], columns: [...str2, 'end'] }}
        recurrence={filling && same ? 'dp[i][j] = 1 + dp[i+1][j+1] when the letters match' : 'dp[i][j] = 1 + min(dp[i+1][j], dp[i][j+1]) otherwise'}
        why="Each cell is the shortest supersequence of one suffix pair; the walk from the corner reads the answer off these cells." />
      <output aria-label="Answer so far">{`Answer so far: ${step.answer || '(empty)'}`}</output>
      <p>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>The table counts the shortest supersequence of each suffix pair, so the top-left cell is the answer length.</p>
    <p>Walking from the corner, a matching pair of letters is emitted once; otherwise the walk moves toward the smaller neighbour, which keeps the total length minimal.</p>
  </>} />
}
