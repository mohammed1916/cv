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
    { label: 'Single passenger', input: '{"details":["1111111111F0000"]}' },
    { label: 'Equal ages tie', input: '{"details":["2222222222M3030","3333333333F3030"]}' },
    { label: 'Oldest age 99', input: '{"details":["4444444444M9900"]}' },
    { label: 'Long run: 50 passengers', input: '{"details":["8034751474F1904","7769238264M4239","0050441427F7921","3386064611M6256","6077187761F9548","9303764565M2273","8684988714F5464","1210491968M8790","4501614768F7081","7837831912M0717","0528314101F3008","9854537965M6334","2145150155F9025","5871268319M8351","8162881068F1542","1397064252M4268","0029587416F7599","3314704206M9885","6646917459F8516","9331430659M1801","2663614403F4133","1958237653M7828","4280354856F0050","7875967006M9345","9101180790F2077","2492663950M5362","1118880143F8694","4409003903M1389","7735517197F0611","0426730341M3806","3751317100F6538","2943430394M9823","5678053544F2155","8960266348M1840","1295743497F4161","4987967681M7457","3212180441F0188","6504603695M3374","9139820884F2605","2421493648M5991","5756516838F8626","4448139092M1918","7773357285F4243","0064870035M3935","3790043239F6260","2081266389M9452","5207783132M2187","8998906332F5478","1224529586M4704","4515692376F7495"]}' },
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
