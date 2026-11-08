import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStageStrip from './SqlStageStrip'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Airings', description: 'Start from the TV program rows.' },
    { id: 'content', label: 'Content', description: 'Keep kid-friendly movies only.' },
    { id: 'window', label: 'June', description: 'Keep airings inside June 2020.' },
    { id: 'output', label: 'Join', description: 'Match airings to the kept movies.' },
    { id: 'done', label: 'Result', description: 'Distinct titles in order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with content and tv_program lists',
  url: 'https://leetcode.com/problems/friendly-movies-streamed-last-month/',
  complexity: 'O(n log n) time for sorting the airings; n is the number of airing rows.',
  examples: [
    { label: 'Example', input: '{"content":[{"content_id":1,"title":"Dragon Quest","Kids_content":"Y","content_type":"Movies"},{"content_id":2,"title":"Night Shift","Kids_content":"N","content_type":"Movies"},{"content_id":3,"title":"Little Paws","Kids_content":"Y","content_type":"Series"},{"content_id":4,"title":"Ocean Tales","Kids_content":"Y","content_type":"Movies"},{"content_id":5,"title":"Late Show","Kids_content":"Y","content_type":"Movies"}],"tv_program":[{"program_date":"2020-06-02","content_id":1,"channel":"A"},{"program_date":"2020-06-02","content_id":2,"channel":"B"},{"program_date":"2020-06-10","content_id":1,"channel":"B"},{"program_date":"2020-05-31","content_id":4,"channel":"A"},{"program_date":"2020-06-15","content_id":4,"channel":"C"},{"program_date":"2020-06-20","content_id":3,"channel":"A"},{"program_date":"2020-07-01","content_id":5,"channel":"A"},{"program_date":"2020-06-30","content_id":5,"channel":"B"}]}' },
    { label: 'Single airing', input: '{"content":[{"content_id":1,"title":"Solo","Kids_content":"N","content_type":"Movies"}],"tv_program":[{"program_date":"2021-05-05","content_id":1,"channel":"C"}]}' },
    { label: 'No kids content', input: '{"content":[{"content_id":1,"title":"Night Watch","Kids_content":"N","content_type":"Movies"},{"content_id":2,"title":"Quiet Hour","Kids_content":"N","content_type":"Series"}],"tv_program":[{"program_date":"2021-06-01","content_id":1,"channel":"A"},{"program_date":"2021-06-01","content_id":2,"channel":"B"}]}' },
    { label: 'Long run: 12 titles, 30 airings', input: '{"content":[{"content_id":1,"title":"Show 1","Kids_content":"N","content_type":"Movies"},{"content_id":2,"title":"Show 2","Kids_content":"N","content_type":"Series"},{"content_id":3,"title":"Show 3","Kids_content":"N","content_type":"Series"},{"content_id":4,"title":"Show 4","Kids_content":"Y","content_type":"Movies"},{"content_id":5,"title":"Show 5","Kids_content":"N","content_type":"Series"},{"content_id":6,"title":"Show 6","Kids_content":"Y","content_type":"Series"},{"content_id":7,"title":"Show 7","Kids_content":"N","content_type":"Movies"},{"content_id":8,"title":"Show 8","Kids_content":"Y","content_type":"Movies"},{"content_id":9,"title":"Show 9","Kids_content":"Y","content_type":"Series"},{"content_id":10,"title":"Show 10","Kids_content":"Y","content_type":"Movies"},{"content_id":11,"title":"Show 11","Kids_content":"N","content_type":"Series"},{"content_id":12,"title":"Show 12","Kids_content":"Y","content_type":"Movies"}],"tv_program":[{"program_date":"2021-07-04","content_id":6,"channel":"A"},{"program_date":"2021-07-04","content_id":9,"channel":"B"},{"program_date":"2021-07-04","content_id":11,"channel":"A"},{"program_date":"2021-07-04","content_id":3,"channel":"C"},{"program_date":"2021-07-02","content_id":9,"channel":"B"},{"program_date":"2021-07-05","content_id":3,"channel":"A"},{"program_date":"2021-07-02","content_id":2,"channel":"A"},{"program_date":"2021-07-03","content_id":2,"channel":"C"},{"program_date":"2021-07-02","content_id":8,"channel":"B"},{"program_date":"2021-07-01","content_id":12,"channel":"C"},{"program_date":"2021-07-02","content_id":8,"channel":"A"},{"program_date":"2021-07-05","content_id":10,"channel":"B"},{"program_date":"2021-07-04","content_id":1,"channel":"A"},{"program_date":"2021-07-03","content_id":5,"channel":"C"},{"program_date":"2021-07-03","content_id":11,"channel":"B"},{"program_date":"2021-07-04","content_id":9,"channel":"C"},{"program_date":"2021-07-04","content_id":10,"channel":"B"},{"program_date":"2021-07-04","content_id":11,"channel":"C"},{"program_date":"2021-07-02","content_id":4,"channel":"A"},{"program_date":"2021-07-02","content_id":10,"channel":"B"},{"program_date":"2021-07-02","content_id":8,"channel":"C"},{"program_date":"2021-07-04","content_id":8,"channel":"A"},{"program_date":"2021-07-03","content_id":8,"channel":"B"},{"program_date":"2021-07-02","content_id":12,"channel":"B"},{"program_date":"2021-07-03","content_id":5,"channel":"C"},{"program_date":"2021-07-04","content_id":1,"channel":"A"},{"program_date":"2021-07-05","content_id":7,"channel":"A"},{"program_date":"2021-07-04","content_id":3,"channel":"C"},{"program_date":"2021-07-02","content_id":12,"channel":"C"},{"program_date":"2021-07-04","content_id":3,"channel":"B"}]}' },
  ],
}

const KEPT = 'color-mix(in srgb, var(--success) 30%, var(--surface2))'
const SKIPPED = 'color-mix(in srgb, var(--warning) 30%, var(--surface2))'

function RowTable({ caption, stage, rows, isCurrent = () => false, rowTone = () => null }) {
  const columns = rows.length ? Object.keys(rows[0]) : []
  return (
    <section aria-label={caption}>
      <h3>{caption}</h3>
      {stage && <p>{stage}</p>}
      {columns.length === 0 ? <p>No rows at this stage.</p> : (
        <table>
          <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => {
            const current = isCurrent(row)
            return <tr key={index} data-current={current ? 'yes' : undefined}
              style={{ background: rowTone(row) ?? (current ? 'var(--surface2)' : undefined), fontWeight: current ? 600 : undefined }}>
              {columns.map(column => <td key={column}>{String(row[column])}</td>)}
            </tr>
          })}</tbody>
        </table>
      )}
    </section>
  )
}

export default function FriendlyMovies() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const airing = step.airing
    const sameAiring = row => airing && row.content_id === airing.content_id && row.program_date === airing.program_date
    const stage = {
      load: 'FROM TVProgram: every airing row, in the order given.',
      content: "WHERE Kids_content = 'Y' AND content_type = 'Movies': the content rows that qualify.",
      window: 'WHERE program_date is in June 2020: the highlighted airing is tested now; green rows are kept.',
      output: 'JOIN on content_id: each kept airing already carries its title.',
      done: 'SELECT DISTINCT title, sorted: one row per movie.',
    }[step.phase]
    return <>
      <SqlStageStrip phases={definition.phases} current={step.phase} />
      <RowTable caption={step.phase === 'load' || step.phase === 'window' ? 'Airings (date order)' : 'Working rows'}
        stage={stage} rows={step.rows} isCurrent={sameAiring} rowTone={row => (sameAiring(row) ? (airing.kept ? KEPT : SKIPPED) : null)} />
      {airing && <p>Testing airing on {airing.program_date} for content {airing.content_id}: {airing.kept ? 'kept' : 'skipped'}.</p>}
      <RowTable caption="Result" stage="The distinct titles appear once each." rows={run.result} />
    </>
  }} renderReasoning={() => <>
    <p>A movie qualifies only when both its content flags match and at least one airing falls between June 1 and June 30, 2020.</p>
    <p>Each kept airing is joined to its title, and repeated titles collapse to one row in the final list.</p>
  </>} />
}
