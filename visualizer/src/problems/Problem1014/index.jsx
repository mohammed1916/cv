import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import authoredExamples from '../../config/examples/collection--1014.js'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Seed the best left contribution from the first spot.' },
    { id: 'score', label: 'Score pair', description: 'Score the current spot as the right endpoint using the best earlier left spot.' },
    { id: 'left', label: 'Update left', description: 'Let the current spot serve as a left endpoint for later spots if it is stronger.' },
    { id: 'done', label: 'Complete', description: 'Return the best pair score found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with values (JSON)',
  url: 'https://leetcode.com/problems/best-sightseeing-pair/',
  complexity: 'O(n) time and O(1) auxiliary space: one pass keeps only the best left contribution.',
  examples: authoredExamples,
}

export default function BestSightseeingPair() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.state
    return <>
      <div aria-label="Spots" role="img" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, fontFamily: 'monospace' }}>
        {run.input.values.map((v, i) => <div key={i} data-spot={i} style={{
          minWidth: 52, padding: '6px 4px', boxSizing: 'border-box', textAlign: 'center',
          borderWidth: i === s.j || i === s.leftIndex ? 2 : 1, borderStyle: 'solid',
          borderColor: i === s.j ? 'var(--text)' : i === s.leftIndex ? 'var(--primary)' : 'var(--border)',
          background: bestSpot(s, i) ? 'var(--surface2)' : 'transparent', color: 'var(--text)',
        }}><div>{v}</div><small style={{ color: 'var(--text-dim)' }}>{i}{i === s.j ? ' j' : ''}{i === s.leftIndex ? ' best i' : ''}</small></div>)}
      </div>
      <output aria-label="Sightseeing state">{`Left contribution ${s.left} (spot ${s.leftIndex}) · best ${s.best ?? '-'}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Split the score:</strong> a pair (i, j) scores (values[i] + i) + (values[j] - j), so the best left part can be kept while scanning.</p>
    <p><strong>Order matters:</strong> score the current spot before it becomes a left candidate, so the pair always has i &lt; j.</p>
  </>} />
}

function bestSpot(s, i) {
  return s.bestPair !== null && (i === s.bestPair[0] || i === s.bestPair[1])
}
