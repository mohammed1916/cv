import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import StageStrip from './StageStrip'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Arrays (JSON array of arrays of distinct integers)',
  url: 'https://leetcode.com/problems/intersection-of-multiple-arrays/',
  complexity: 'O(total elements + V log V) time, where V is the number of distinct kept values. The visualization caps input at 6 arrays.',
  examples: [
    { label: 'Example 1', input: '[[3,1,2,4,5],[1,2,3,4],[3,4,5,6]]' },
    { label: 'Empty', input: '[[1,2],[3,4]]' },
    { label: 'Single array', input: '[[9]]' },
    { label: 'Equal values across arrays', input: '[[4,8],[4,8]]' },
    { label: 'Longest arrays', input: '[[1,2,3,4,5,6,7,8],[8,7,6,5,4,3,2,1],[10,20,30,40,50,25,35,45],[2,4,6,8,10,12,14,16],[49,48,47,46,45,44,43,42],[1,50,2,49,3,48,4,47]]' },
  ],
}

const chip = (active, all) => ({
  display: 'inline-block', minWidth: 30, textAlign: 'center', padding: '3px 7px', margin: 2, borderRadius: 6,
  border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
  background: all ? 'var(--primary-glow)' : 'var(--surface2)', color: 'var(--text)',
})

export default function MultiIntersection() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const values = Object.keys(step.counts).map(Number).sort((x, y) => x - y)
    const arrays = run.input
    return <>
      <StageStrip phases={phases} step={step} />
      <div aria-label="Input arrays" style={{ display: 'grid', gap: 6, color: 'var(--text)' }}>
        {arrays.map((arr, a) => (
          <div key={a} aria-current={step.array === a ? 'step' : undefined} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
            <strong style={{ minWidth: 72 }}>Array {a}</strong>
            {arr.map(v => <span key={v} style={chip(step.array === a, step.counts[v] === arrays.length)}>{v}</span>)}
          </div>
        ))}
      </div>
      <table aria-label="Tally of values" style={{ borderCollapse: 'collapse', color: 'var(--text)' }}><thead><tr><th style={chip()}>Value</th><th style={chip()}>Arrays containing it</th><th style={chip()}>In all arrays</th></tr></thead><tbody>
        {values.map(v => <tr key={v} data-value={v}>
          <th style={chip()}>{v}</th><td style={chip()}>{step.counts[v]}</td><td style={chip()}>{step.counts[v] === arrays.length ? 'yes' : 'no'}</td>
        </tr>)}
      </tbody></table>
      <output aria-label="Intersection state">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Within one array the values are distinct, so a count of how many arrays contain a value is exactly the number of arrays it appears in.</p>
    <p>A value belongs to the intersection when that count equals the number of arrays.</p>
  </>} />
}
