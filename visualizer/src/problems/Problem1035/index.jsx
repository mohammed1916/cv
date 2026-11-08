import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Two arrays [a, b] (JSON)',
  url: 'https://leetcode.com/problems/uncrossed-lines/',
  complexity: 'O(n × m) time and space for the table.',
  examples: [
    { label: 'Sample', input: '[[6,2,7],[2,6,7,1]]' },
    { label: 'Longer', input: '[[2,5,1,2,5],[9,5,2,1,5,2]]' },
    { label: 'Single matching pair', input: '[[4],[4]]' },
    { label: 'No shared values', input: '[[1,2],[3,4]]' },
    { label: 'Largest arrays: all nines', input: '[[9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],[9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9]]' },
    { label: 'Long run: 20 values each', input: '[[9,0,4,0,5,8,6,0,1,8,2,0,0,5,0,6,9,9,5,9],[3,5,9,5,9,2,6,0,0,3,5,6,6,8,7,6,7,7,9,6]]' },
  ],
}

function UncrossedLines() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <IndexedSequence label="First array a" length={run.input[0].length} valueAt={k => run.input[0][k]} active={s.i > 0 ? s.i - 1 : -1} />
      <IndexedSequence label="Second array b" length={run.input[1].length} valueAt={k => run.input[1][k]} active={s.j > 0 ? s.j - 1 : -1} />
      <p>Comparing a[{s.i > 0 ? s.i - 1 : '—'}] with b[{s.j > 0 ? s.j - 1 : '—'}]: {s.match === null ? 'not compared yet' : s.match ? 'equal, so the link extends a diagonal' : 'different, so one side is skipped'}.</p>
      <table>
        <caption>Best links for each pair of prefixes</caption>
        <thead><tr><th />{s.b.map((v, j) => <th key={j}>b{j}={v}</th>)}</tr></thead>
        <tbody>{s.dp.map((row, i) => <tr key={i}>
          <th>{i === 0 ? '∅' : `a${i - 1}=${s.a[i - 1]}`}</th>
          {row.map((v, j) => <td key={j} data-current={i === s.i && j === s.j ? 'true' : undefined}
            style={i === s.i && j === s.j ? { outline: '2px solid var(--primary)' } : undefined}>{v}</td>)}
        </tr>)}</tbody>
      </table>
    </>
  }} renderReasoning={() => <>
    <p>A link pairs two equal values, and links never cross, so their positions keep the same order in both arrays. The table extends the best answer from smaller prefixes.</p>
    <p>If the final values match, linking them adds one to the diagonal; otherwise the better of skipping either final value is kept.</p>
  </>} />
}

export default withProblemStory(UncrossedLines, storyGuide);
