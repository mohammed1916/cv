import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'People as [costA, costB] pairs (JSON)',
  url: 'https://leetcode.com/problems/two-city-scheduling/',
  complexity: 'O(n log n) time for the sort and O(n) for the assignment.',
  examples: [
    { label: 'Sample', input: '[[10,30],[400,50],[30,200],[90,20]]' },
    { label: 'Ties', input: '[[5,5],[5,5],[5,5],[5,5]]' },
    { label: 'One pair each', input: '[[1,2],[3,4]]' },
    { label: 'Equal costs in both cities', input: '[[7,7],[7,7],[7,7],[7,7],[7,7],[7,7]]' },
    { label: 'Forty people, largest costs', input: '[[1000,1],[1,1000],[1000,1],[1,1000],[1000,1],[1,1000],[1000,1],[1,1000],[1000,1],[1,1000],[1000,1],[1,1000],[1000,1],[1,1000],[1000,1],[1,1000],[1000,1],[1,1000],[1000,1],[1,1000],[1000,1],[1,1000],[1000,1],[1,1000],[1000,1],[1,1000],[1000,1],[1,1000],[1000,1],[1,1000],[1000,1],[1,1000],[1000,1],[1,1000],[1000,1],[1,1000],[1000,1],[1,1000],[1000,1],[1,1000]]' },
    { label: 'Long run: 40 people', input: '[[174,93],[256,222],[939,297],[912,845],[698,933],[514,718],[597,597],[604,286],[498,261],[225,160],[597,546],[253,688],[936,679],[701,347],[281,872],[324,900],[451,593],[542,271],[770,799],[367,736],[930,917],[876,259],[640,687],[688,157],[151,473],[519,201],[675,464],[173,819],[41,847],[543,760],[91,850],[775,403],[527,237],[116,344],[913,373],[615,395],[699,165],[125,97],[523,529],[787,628]]' },
  ],
}

function TwoCityScheduling() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <IndexedSequence label="People (cost A / cost B)" length={run.input.length} valueAt={k => `${run.input[k][0]}/${run.input[k][1]}`} active={-1} />
      <p>Each city receives {s.n} people. Running total: <strong>{s.total}</strong>.</p>
      <table>
        <caption>People ordered by A minus B</caption>
        <thead><tr><th>Person</th><th>Cost A</th><th>Cost B</th><th>A − B</th><th>City</th></tr></thead>
        <tbody>{s.ordered.map((p, idx) => <tr key={p.index} data-active={idx === s.k ? 'true' : undefined} aria-current={idx === s.k ? 'step' : undefined}>
          <td>{p.index + 1}</td><td>{p.a}</td><td>{p.b}</td><td>{p.diff}</td><td>{p.city ?? '—'}</td>
        </tr>)}</tbody>
      </table>
      {step.phase === 'done' && <output aria-label="Minimum total cost">Minimum total cost: {run.result}</output>}
    </>
  }} renderReasoning={() => <>
    <p>Sending a person to A instead of B costs A − B more, so the people with the smallest differences are the best candidates for city A.</p>
    <p>After sorting, the first half goes to A and the second half goes to B. Equal differences do not change the total.</p>
  </>} />
}

export default withProblemStory(TwoCityScheduling, storyGuide);
