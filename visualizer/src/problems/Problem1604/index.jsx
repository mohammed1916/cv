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
    { label: 'Morning run', input: '{"keyName":["ava","ava","ava","ben","ben"],"keyTime":["08:05","08:30","09:04","12:00","12:30"]}' },
    { label: 'Exactly an hour', input: '{"keyName":["mia","mia","mia","mia"],"keyTime":["07:00","08:01","08:59","09:01"]}' },
    { label: 'Two alerts', input: '{"keyName":["kai","kai","kai","eli","eli","eli"],"keyTime":["18:00","18:45","18:59","06:00","06:20","06:40"]}' },
    { label: "Single swipe", input: "{\"keyName\":[\"ana\"],\"keyTime\":[\"10:00\"]}" },
    { label: "Three swipes, one hour exactly", input: "{\"keyName\":[\"bo\",\"bo\",\"bo\"],\"keyTime\":[\"10:00\",\"10:30\",\"11:00\"]}" },
    { label: "Twenty swipes, one name", input: "{\"keyName\":[\"cy\",\"cy\",\"cy\",\"cy\",\"cy\",\"cy\",\"cy\",\"cy\",\"cy\",\"cy\",\"cy\",\"cy\",\"cy\",\"cy\",\"cy\",\"cy\",\"cy\",\"cy\",\"cy\",\"cy\"],\"keyTime\":[\"00:00\",\"01:07\",\"02:14\",\"03:21\",\"04:28\",\"05:35\",\"06:42\",\"07:49\",\"08:56\",\"09:03\",\"10:10\",\"11:17\",\"12:24\",\"13:31\",\"14:38\",\"15:45\",\"16:52\",\"17:59\",\"18:06\",\"19:13\"]}" },
    { label: "Long run: 20 swipes", input: "{\"keyName\":[\"userd\",\"userb\",\"usera\",\"userb\",\"userc\",\"userc\",\"usere\",\"userd\",\"userb\",\"userd\",\"userc\",\"usere\",\"usera\",\"userd\",\"userd\",\"userd\",\"usera\",\"userb\",\"userc\",\"userb\"],\"keyTime\":[\"06:48\",\"07:06\",\"08:55\",\"09:45\",\"06:49\",\"07:40\",\"08:13\",\"09:02\",\"06:43\",\"07:56\",\"08:45\",\"09:04\",\"06:13\",\"07:30\",\"08:45\",\"09:25\",\"06:36\",\"07:45\",\"08:07\",\"09:33\"]}" },
  ],
}

export default function KeyCardAlerts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <section aria-label="Swipe times">
      <h3>{step.name ? `Worker: ${step.name}` : 'All workers'}</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {step.times.map((minute, i) => {
          const inWindow = step.flagged >= 0 && i >= step.flagged && i <= step.flagged + 2
          const pointer = i === step.flagged ? 'l' : i === step.flagged + 2 ? 'r' : ''
          return <div key={i} data-index={i} style={{ display: 'grid', justifyItems: 'center', gap: 2 }}>
            <small style={{ minHeight: 16, color: 'var(--text)', fontWeight: 700 }}>{pointer}</small>
            <div style={{ minWidth: 72, padding: '6px 8px', textAlign: 'center', boxSizing: 'border-box', borderRadius: 6, fontFamily: 'monospace', color: 'var(--text)',
              border: `${pointer ? 2 : 1}px solid ${pointer ? 'var(--primary)' : 'var(--border)'}`,
              background: inWindow ? 'color-mix(in srgb, var(--primary) 20%, transparent)' : 'var(--surface2)' }}>
              <div>{`${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`}</div>
              <small>swipe {i + 1}</small>
            </div>
          </div>
        })}
      </div>
      {step.span !== undefined && <p>{`Window from l to r spans ${step.span} minutes. Alert when it is at most 60.`}</p>}
    </section>
    <output aria-label="Alerted workers">{`Alerts so far: ${step.alerts.length ? step.alerts.join(', ') : 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Sorting a worker’s swipes puts any three swipes within an hour next to each other, so checking every run of three consecutive times is enough.</p>
    <p>The window is inclusive: swipes exactly sixty minutes apart still count as within one hour.</p>
  </>} />
}
