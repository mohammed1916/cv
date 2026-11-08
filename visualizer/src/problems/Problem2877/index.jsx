import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Columns', description: 'Name the two columns.' },
    { id: 'row', label: 'Row', description: 'One row joins the table in its original position.' },
    { id: 'done', label: 'Result', description: 'The table holds every row in order.' },
  ],
  parse: parseInput, build: buildTrace,
  code: code.map(c => c),
  python,
  inputLabel: 'JSON {"data": [[101, 18], [102, 22]]}',
  url: 'https://leetcode.com/problems/create-a-dataframe-from-list/',
  complexity: 'O(n) rows. pandas builds the frame in one call; the visualization adds one row per step.',
  examples: [
    { label: 'Three students', input: '{"data":[[101,18],[102,22],[103,19]]}' },
    { label: 'One student', input: '{"data":[[7,40]]}' },
    { label: "One row", input: "{\"data\":[[1,20]]}" },
    { label: "Equal ages", input: "{\"data\":[[1,20],[2,20],[3,20]]}" },
    { label: "Extreme ids and ages", input: "{\"data\":[[2147483647,150],[-1,0]]}" },
    { label: "Long run: 10 rows", input: "{\"data\":[[415,23],[752,16],[826,78],[493,41],[173,86],[248,94],[139,26],[912,47],[399,4],[469,91]]}" },
  ],
}

export default function CreateDataframeFromList() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RecordStateTable label="DataFrame rows" columns={['student_id', 'age']}
      rows={step.table} activeRow={step.at} />
    <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>The DataFrame is the list of rows with two named columns. Row order is kept, so the i-th row of the list is the i-th row of the frame.</p>
  </>} />
}
