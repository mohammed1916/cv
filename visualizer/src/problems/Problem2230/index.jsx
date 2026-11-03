import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with purchases ([user_id, time_stamp, amount] rows), start, end, minCount and minTotal',
  complexity: 'O(n + u) time and O(u) extra space for n purchases and u distinct users, because each purchase is read once and each user is checked once.',
  examples: [
    { label: 'Sample interval', input: '{"purchases":[[7,10,30],[3,12,15],[7,15,25],[3,40,90],[9,11,20],[7,33,5],[9,18,40],[3,22,10]],"start":10,"end":25,"minCount":2,"minTotal":50}' },
    { label: 'Nobody qualifies', input: '{"purchases":[[1,5,10]],"start":1,"end":9,"minCount":2,"minTotal":5}' },
  ],
}

export default function EligibleUsersForDiscount() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { purchases, start, end, minCount, minTotal } = run.input
    const current = step.snapshot.row
    const currentIndex = current ? purchases.findIndex(([user, time, amount]) => user === current.user && time === current.time && amount === current.amount) : -1
    return <>
      <p>{`Interval ${start} to ${end}; a user needs at least ${minCount} purchases and a total of ${minTotal}.`}</p>
      <table aria-label="Purchases">
        <thead><tr><th>user_id</th><th>time_stamp</th><th>amount</th><th>in interval</th></tr></thead>
        <tbody>{purchases.map(([user, time, amount], i) => <tr key={i}
          data-current={i === currentIndex ? 'true' : undefined}
          aria-current={i === currentIndex ? 'step' : undefined}>
          <td>{user}</td><td>{time}</td><td>{amount}</td><td>{time >= start && time <= end ? 'yes' : 'no'}</td>
        </tr>)}</tbody>
      </table>
      <table aria-label="User totals">
        <thead><tr><th>user_id</th><th>purchases</th><th>total</th></tr></thead>
        <tbody>{step.snapshot.totals.map(t => <tr key={t.user}><td>{t.user}</td><td>{t.count}</td><td>{t.total}</td></tr>)}</tbody>
      </table>
      <output aria-label="Eligible users">{`Eligible so far: ${step.snapshot.result.length ? step.snapshot.result.join(', ') : 'none'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Only purchases whose time_stamp lies inside the interval count, with both ends included.</p>
    <p>Each user keeps a running count and total. A user is listed only when both thresholds hold at the end, so the check happens after every purchase is read.</p>
  </>} />
}
