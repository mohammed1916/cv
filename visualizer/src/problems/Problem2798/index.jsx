import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Setup', description: 'Start the count at 0.' },
    { id: 'scan', label: 'Scan', description: "Read each employee's hours." },
    { id: 'check', label: 'Check', description: 'Compare hours with the target.' },
    { id: 'count', label: 'Count', description: 'Count an employee who met the target.' },
    { id: 'done', label: 'Result', description: 'Report the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with hours and target (JSON), e.g. {"hours":[0,1,2,3,4],"target":2}',
  url: 'https://leetcode.com/problems/number-of-employees-who-met-the-target/',
  complexity: 'O(n) time and O(1) space for n employees. The visualization caps input at 50 employees, the official limit.',
  examples: [
    { label: 'Own case 1', input: '{"hours":[1,2,3,4,5],"target":3}' },
    { label: 'Own case 2', input: '{"hours":[6,2,5,3,3],"target":7}' },
    { label: 'Single hour', input: '{"hours":[5],"target":5}' },
    { label: 'Equal hours', input: '{"hours":[7,7,7,7],"target":7}' },
    { label: 'Boundary: largest hour value', input: '{"hours":[100000,0,100000],"target":100000}' },
    { label: 'Long run: 50 hours', input: '{"hours":[25965,8463,1352,24933,27246,21608,8062,14362,20075,2283,5282,2341,19011,28905,23003,12411,15394,20812,30385,17160,3742,28808,10126,1406,30100,2111,11256,993,7361,9655,15500,5583,9247,9468,25786,23440,1541,13012,15426,32738,17149,359,15474,19073,28516,7083,11548,20344,32452,913],"target":50000}' },
  ],
}

export default function NumberOfEmployeesWhoMetTheTargetVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Hours worked" length={run.input.hours.length} valueAt={i => run.input.hours[i]} active={step.index}
      roleAt={i => (i === step.index ? 'current' : i < step.index && run.input.hours[i] >= step.target ? 'met' : '')} />
    <output aria-label="Count">{`Target ${step.target}, count ${step.count}`}</output>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
