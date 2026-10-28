import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Read swipes', description: 'Convert each time to minutes since midnight.' },
    { id: 'group', label: 'Group by name', description: 'Collect each worker’s swipe times.' },
    { id: 'sort', label: 'Sort times', description: 'Order one worker’s swipes by time.' },
    { id: 'window', label: 'Check a window', description: 'Compare the first and third swipe of three in a row.' },
    { id: 'alert', label: 'Alert', description: 'Record the worker as flagged.' },
    { id: 'done', label: 'Sorted result', description: 'Return the alerted names in alphabetical order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Swipes as JSON: {"keyName": [...], "keyTime": [...]}',
  url: 'https://leetcode.com/problems/alert-using-same-key-card-three-or-more-times-in-a-one-hour-period/',
  complexity: 'O(n log n) time for sorting each worker’s swipes. The visualization caps input at 20 swipes.',
  examples: [
    { label: 'Example 1', input: '{"keyName":["daniel","daniel","daniel","luis","luis","luis","luis"],"keyTime":["10:00","10:40","11:00","09:00","11:00","13:00","15:00"]}' },
    { label: 'Example 3', input: '{"keyName":["john","john","john"],"keyTime":["23:58","23:59","00:01"]}' },
    { label: 'Example 4', input: '{"keyName":["leslie","leslie","leslie","clare","clare","clare","clare"],"keyTime":["13:00","13:20","14:00","18:00","18:51","19:30","19:49"]}' },
  ],
}

export default function KeyCardAlerts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <section aria-label="Swipe times">
      <h3>{step.name ? `Worker: ${step.name}` : 'All workers'}</h3>
      <ol className="algorithm-sequence__cells">
        {step.times.map((minute, i) => <li key={i} className="algorithm-sequence__cell" data-role={step.flagged >= 0 && i >= step.flagged && i <= step.flagged + 2 ? 'window' : ''}>
          <small>swipe {i + 1}</small><strong>{`${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`}</strong>
        </li>)}
      </ol>
      {step.span !== undefined && <p>{`Span of this window: ${step.span} minutes`}</p>}
    </section>
    <output aria-label="Alerted workers">{`Alerts so far: ${step.alerts.length ? step.alerts.join(', ') : 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Sorting a worker’s swipes puts any three swipes within an hour next to each other, so checking every run of three consecutive times is enough.</p>
    <p>The window is inclusive: swipes exactly sixty minutes apart still count as within one hour.</p>
  </>} />
}
