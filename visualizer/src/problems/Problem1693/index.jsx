import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import { buildTrace, parseInput, code, python, sql, phases, pythonLineMap } from './algorithm';

const row = (date_id, make_name, lead_id, partner_id) => ({ date_id, make_name, lead_id, partner_id })
const sample = (rows) => JSON.stringify({ rows })

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, sql, phases,
  inputLabel: 'Event rows as a JSON object with a "rows" array',
  url: 'https://leetcode.com/problems/daily-leads-and-partners/',
  complexity: 'O(r) time and O(r) space for r rows, plus sorting the groups for the report.',
  examples: [
    { label: 'Repeats inside one group', input: sample([row('2021-04-08', 'cedar', 7, 40), row('2021-04-08', 'cedar', 7, 41), row('2021-04-08', 'cedar', 8, 40)]) },
    { label: 'Same IDs, two makes', input: sample([row('2021-04-08', 'cedar', 7, 40), row('2021-04-08', 'birch', 7, 40)]) },
    { label: 'Two dates', input: sample([row('2021-04-09', 'alder', 3, 9), row('2021-04-08', 'alder', 3, 9), row('2021-04-08', 'alder', 4, 9)]) },
    { label: 'No rows', input: sample([]) },
  ],
}

function DailyGroups() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { rowIndex, groups, result } = step.snapshot
    const rows = run.input.rows
    return <>
      <IndexedSequence label="Event rows" length={rows.length} active={Math.max(0, rowIndex)}
        valueAt={index => `${rows[index].date_id} ${rows[index].make_name} L${rows[index].lead_id} P${rows[index].partner_id}`}
        roleAt={index => (index === rowIndex ? 'current' : index < rowIndex ? 'seen' : '')} />
      <table>
        <caption>Groups so far (distinct sets)</caption>
        <thead><tr><th>Date</th><th>Make</th><th>Leads</th><th>Partners</th></tr></thead>
        <tbody>{groups.map(group => <tr key={`${group.date_id}|${group.make_name}`}>
          <th>{group.date_id}</th><td>{group.make_name}</td>
          <td>{group.leads.length} ({group.leads.join(', ')})</td>
          <td>{group.partners.length} ({group.partners.join(', ')})</td>
        </tr>)}</tbody>
      </table>
      {step.phase === 'done' && <output aria-label="Report">{result.length} groups reported</output>}
    </>
  }} renderReasoning={() => <>
    <p>A group is the pair of date and make. Leads and partners are counted separately, because a lead can repeat with different partners.</p>
    <p>Sets remove repeated IDs inside each group. The report sorts groups for display; the counts do not depend on that order.</p>
  </>} />
}

export default withProblemStory(DailyGroups, storyGuide);
