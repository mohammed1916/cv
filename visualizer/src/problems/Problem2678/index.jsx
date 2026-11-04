import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The count starts at 0.' },
    { id: 'scan', label: 'Read', description: 'Take the next passenger record.' },
    { id: 'age', label: 'Age', description: 'The age is the two characters at positions 11 and 12.' },
    { id: 'check', label: 'Check', description: 'Ages above 60 are counted.' },
    { id: 'add', label: 'Count', description: 'Add one to the count for a senior.' },
    { id: 'done', label: 'Result', description: 'The number of seniors.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with details: a list of 15-character passenger strings (at most 8)',
  url: 'https://leetcode.com/problems/number-of-senior-citizens/',
  complexity: 'O(n) time, one pass over the records with constant work each.',
  examples: [
    { label: 'Three passengers', input: '{"details":["7868190130M7522","5303914400F9211","9273338290F4010"]}' },
    { label: 'Only young riders', input: '{"details":["1234567890M0010","1234567891F5959"]}' },
  ],
}

export default function NumberOfSeniorCitizens() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    // One row per record: the age slice is read from positions 11 and 12, and the senior check runs on that number.
    const rows = run.input.details.map((detail, index) => {
      const age = Number(detail.slice(11, 13))
      return { record: index, detail, age, senior: age > 60 ? 'yes' : 'no' }
    })
    return <section aria-label="Passenger records" style={{ display: 'grid', gap: 10 }}>
      <RecordStateTable label="Records" columns={['record', 'detail', 'age', 'senior']} rows={rows} activeRow={step.index ?? -1} />
      <p style={{ margin: 0, color: 'var(--text)' }}>Seniors counted so far: <code>{step.count}</code></p>
    </section>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
