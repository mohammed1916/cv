import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import StageStrip from './StageStrip'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const inputLabel = 'Object with purchases (user_id, time_stamp, amount), startDate, endDate and minAmount'
const complexity = 'O(n) time for n purchase rows, with O(d) space for the d distinct eligible users. The sample caps the input at 10 rows.'
const examples = [
  { label: 'Interval with a boundary day', input: '{"purchases":[{"user_id":7,"time_stamp":"2024-05-01","amount":25},{"user_id":8,"time_stamp":"2024-05-31","amount":40},{"user_id":9,"time_stamp":"2024-06-01","amount":90},{"user_id":7,"time_stamp":"2024-05-15","amount":30}],"startDate":"2024-05-01","endDate":"2024-05-31","minAmount":30}' },
  { label: 'Repeat purchases', input: '{"purchases":[{"user_id":3,"time_stamp":"2024-02-10","amount":60},{"user_id":3,"time_stamp":"2024-02-11","amount":70},{"user_id":4,"time_stamp":"2024-02-12","amount":5}],"startDate":"2024-02-01","endDate":"2024-02-28","minAmount":50}' },
  { label: 'Smallest input', input: '{"purchases":[{"user_id":5,"time_stamp":"2024-03-01","amount":0}],"startDate":"2024-03-01","endDate":"2024-03-01","minAmount":0}' },
  { label: 'Equal totals tie', input: '{"purchases":[{"user_id":1,"time_stamp":"2024-04-10","amount":50},{"user_id":2,"time_stamp":"2024-04-11","amount":50}],"startDate":"2024-04-01","endDate":"2024-04-30","minAmount":50}' },
  { label: 'Leap day and largest values', input: '{"purchases":[{"user_id":99,"time_stamp":"2024-02-29","amount":100},{"user_id":98,"time_stamp":"2024-03-01","amount":100}],"startDate":"2024-02-29","endDate":"2024-03-01","minAmount":100}' },
  { label: 'Long run: ten rows', input: '{"purchases":[{"user_id":11,"time_stamp":"2024-01-05","amount":30},{"user_id":12,"time_stamp":"2024-01-19","amount":45},{"user_id":11,"time_stamp":"2024-02-02","amount":25},{"user_id":13,"time_stamp":"2024-01-27","amount":60},{"user_id":12,"time_stamp":"2024-02-14","amount":15},{"user_id":14,"time_stamp":"2024-02-20","amount":70},{"user_id":13,"time_stamp":"2024-03-03","amount":20},{"user_id":11,"time_stamp":"2024-03-09","amount":55},{"user_id":14,"time_stamp":"2024-01-31","amount":5},{"user_id":12,"time_stamp":"2024-03-15","amount":90}],"startDate":"2024-01-15","endDate":"2024-03-10","minAmount":50}' },
]
const reasoning = <>
  <p>A user counts once if at least one purchase satisfies both tests: the date lies inside the interval (both ends included) and the amount is at least minAmount.</p>
  <p>A set keeps each user id once, so repeated qualifying purchases by the same user do not change the answer.</p>
  <p>The SQL form asks the same question directly: filter the rows, then count distinct user_id values. The sample uses calendar dates, which read as midnight.</p>
</>

const definition = {
  number: meta.number,
  title: meta.title,
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  sql,
  inputLabel,
  url: 'https://leetcode.com/problems/the-number-of-users-that-are-eligible-for-discount/',
  complexity,
  examples,
}

export default function UsersEligibleForDiscount() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageStrip phases={phases} step={step} />
    <p>Interval {run.input.startDate} to {run.input.endDate}, minAmount {run.input.minAmount}.</p>
    <table aria-label="Purchase rows">
      <thead><tr><th>Row</th><th>user_id</th><th>time_stamp</th><th>amount</th><th>Status</th></tr></thead>
      <tbody>{step.rows.map((row, index) => <tr key={index} data-status={row.status}
        aria-current={step.at === index ? 'step' : undefined}>
        <td>{index + 1}</td><td>{row.user_id}</td><td>{row.time_stamp}</td><td>{row.amount}</td><td>{row.status}</td>
      </tr>)}</tbody>
    </table>
    <output aria-label="Distinct users so far">{`Distinct users: ${step.users.length ? step.users.join(', ') : 'none'}`}</output>
  </>} renderReasoning={() => reasoning} />
}
