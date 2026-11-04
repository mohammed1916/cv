import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import StageStrip from './StageStrip'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with purchases ([user_id, time_stamp, amount] rows), start, end and minAmount',
  url: 'https://leetcode.com/problems/the-users-that-are-eligible-for-discount/',
  complexity: 'O(n) time and O(u) space for n purchases and u distinct users, since each purchase is read once. The sample caps the input at 12 rows.',
  examples: [
    { label: 'Sample interval', input: '{"purchases":[[7,10,30],[3,12,15],[7,15,25],[3,40,90],[9,11,20],[7,33,5],[9,18,40],[3,22,10]],"start":10,"end":25,"minAmount":30}' },
    { label: 'Nobody qualifies', input: '{"purchases":[[1,5,10]],"start":1,"end":9,"minAmount":11}' },
  ],
}

const cell = { border: '1px solid var(--border)', padding: '4px 8px', color: 'var(--text)' }

export default function EligibleUsersForDiscount() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { purchases, start, end, minAmount } = run.input
    const current = step.snapshot.row
    const currentIndex = current ? purchases.findIndex(([user, time, amount]) => user === current.user && time === current.time && amount === current.amount) : -1
    return <>
      <StageStrip phases={phases} step={step} />
      <p>{`Interval ${start} to ${end}; a purchase needs an amount of at least ${minAmount}.`}</p>
      <table aria-label="Purchases" style={{ borderCollapse: 'collapse', color: 'var(--text)' }}>
        <thead><tr><th style={cell}>user_id</th><th style={cell}>time_stamp</th><th style={cell}>amount</th><th style={cell}>in interval</th><th style={cell}>meets minAmount</th></tr></thead>
        <tbody>{purchases.map(([user, time, amount], i) => <tr key={i}
          data-current={i === currentIndex ? 'true' : undefined}
          aria-current={i === currentIndex ? 'step' : undefined}
          style={{ background: i === currentIndex ? 'var(--primary-glow)' : undefined }}>
          <td style={cell}>{user}</td><td style={cell}>{time}</td><td style={cell}>{amount}</td>
          <td style={cell}>{time >= start && time <= end ? 'yes' : 'no'}</td>
          <td style={cell}>{amount >= minAmount ? 'yes' : 'no'}</td>
        </tr>)}</tbody>
      </table>
      <output aria-label="Eligible users">{`Eligible so far: ${step.snapshot.result.length ? step.snapshot.result.join(', ') : 'none'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A purchase counts only when its time lies inside the interval, with both ends included.</p>
    <p>Among those, a purchase whose amount reaches minAmount makes its user eligible. A user with several such purchases is listed once.</p>
  </>} />
}
