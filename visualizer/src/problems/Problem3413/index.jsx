import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'collect', label: 'Edges', description: 'Gather the window starts that line up with a bag edge.' },
    { id: 'candidate', label: 'Window', description: 'Count the coins inside one candidate window.' },
    { id: 'done', label: 'Complete', description: 'Report the best window.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with bags [start, end, coins] and k (JSON)',
  url: 'https://leetcode.com/problems/maximum-coins-from-k-consecutive-bags/',
  complexity: 'O(b^2) time for b bags, because each candidate window scans every bag. The visualization caps the input size.',
  examples: [
    { label: 'Example 1', input: '{"bags":[[8,10,1],[1,3,2],[5,6,4]],"k":4}' },
    { label: 'Example 2', input: '{"bags":[[1,10,3]],"k":2}' },
  ],
}

export default function MaximumCoinsFromKConsecutiveBags() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const active = step.start === null ? -1 : run.starts.indexOf(step.start)
    return <>
      <table aria-label="Bags">
        <thead><tr><th>Start</th><th>End</th><th>Coins each</th></tr></thead>
        <tbody>{run.input.bags.map(([l, r, c]) => <tr key={`${l}-${r}`}><td>{l}</td><td>{r}</td><td>{c}</td></tr>)}</tbody>
      </table>
      <IndexedSequence label="Candidate window starts" length={run.starts.length} valueAt={i => run.starts[i]} active={active} />
      <output aria-label="Window">{step.start === null ? 'Collecting candidate starts' : `Window ${step.start} to ${step.end}: ${step.coins} coins, best ${step.best}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Coins in a window change only when a window edge crosses a bag edge, so the best start is one of those edge positions.</p>
    <p>For each candidate, every bag contributes its overlap with the window times its coin value.</p>
  </>} />
}
