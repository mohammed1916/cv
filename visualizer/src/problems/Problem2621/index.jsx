import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  number: '2621',
  phases: [
    { id: 'start', label: 'Start timers', description: 'All sleeps start at time zero.' },
    { id: 'sort', label: 'Order by time', description: 'Sort by fire time, then start order.' },
    { id: 'fire', label: 'Fire', description: 'Record each timer as it fires.' },
    { id: 'done', label: 'Result', description: 'The completion order.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'JSON object with durations (whole milliseconds, 1 to 8 values)',
  url: 'https://leetcode.com/problems/sleep/',
  complexity: 'O(n log n) time to order n timers, O(n) extra space.',
  examples: [
    { label: 'Distinct', input: '{"durations":[300,100,200]}' },
    { label: 'Ties', input: '{"durations":[50,50,10]}' },
  ],
}

export default function Sleep() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <section aria-label="Visual state">
      <h3>{step.view.title}</h3>
      <ol>{step.view.rows.map((row, index) => <li key={index} aria-current={index === step.view.focus ? 'step' : undefined}>{row}</li>)}</ol>
      {step.view.summary && <output>{step.view.summary}</output>}
    </section>}
    renderReasoning={() => <>
      <p>A sleep is a timer that resolves its promise when its delay has passed. Several timers started together finish in delay order.</p>
      <p>Equal delays resolve in the order they were started, which is what the tie rule records.</p>
    </>} />
}
