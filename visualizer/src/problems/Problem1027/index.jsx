import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Integers (JSON array)',
  url: 'https://leetcode.com/problems/longest-arithmetic-subsequence/',
  complexity: 'O(n²) pairs with a map per index: O(n²) time and space in this trace.',
  examples: [
    { label: 'Run of four', input: '[2,4,7,10,13,5]' },
    { label: 'Descending', input: '[9,6,3,0,-4]' },
    { label: 'Mixed', input: '[1,1,1,4,7,2]' },
  ],
}

function LongestArithmetic() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <IndexedSequence label="Numbers" length={run.input.length} valueAt={k => run.input[k]} active={s.i} roleAt={k => (k === s.j ? 'j' : '')} />
      <p>Current pair: end index {s.i < 0 ? '—' : s.i}, earlier index {s.j < 0 ? '—' : s.j}. Best length so far: <strong>{s.best}</strong>.</p>
      <table>
        <caption>Best chain length for each end index and difference</caption>
        <thead><tr><th>End index</th><th>Value</th><th>Difference → length</th></tr></thead>
        <tbody>{s.table.map((entries, idx) => <tr key={idx} data-end={idx} aria-current={idx === s.i ? 'true' : undefined}>
          <th>{idx}</th><td>{run.input[idx]}</td>
          <td>{entries.length ? entries.map(e => `${e.diff} → ${e.len}`).join(', ') : 'none yet'}</td>
        </tr>)}</tbody>
      </table>
    </>
  }} renderReasoning={({ step }) => <>
    <p>Each end index keeps its own map from common difference to the longest chain that finishes there. A new pair can only extend chains with that same difference.</p>
    <p>The pair being checked is highlighted in the table; when a chain is extended, its length is one more than the stored value at the earlier index.</p>
    <p>{step.message}</p>
  </>} />
}

export default withProblemStory(LongestArithmetic, storyGuide);
