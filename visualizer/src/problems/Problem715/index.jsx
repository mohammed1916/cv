import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IntervalView from '../../components/shared/IntervalView'
import { intervalView } from '../../components/shared/intervalModel.js'
import SegtreeView from '../../components/shared/SegtreeView'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'No ranges tracked.' },
    { id: 'addRange', label: 'addRange', description: 'Merge overlapping or touching intervals.' },
    { id: 'removeRange', label: 'removeRange', description: 'Split any interval that the removal cuts.' },
    { id: 'queryRange', label: 'queryRange', description: 'A query holds only if one interval covers it.' },
    { id: 'done', label: 'Complete', description: 'All operations complete.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Operations (JSON array of [name, left, right))',
  url: 'https://leetcode.com/problems/range-module/',
  complexity: 'O(n) per operation for this list version; a balanced ordered set gives O(log n) plus interval work.',
  examples: [
    { label: 'Merge and split', input: '[["addRange",3,9],["removeRange",5,6],["queryRange",3,5],["queryRange",4,7],["queryRange",6,9]]' },
    { label: 'Single range', input: '[["addRange",0,1],["queryRange",0,1]]' },
    { label: 'Touching ranges merge', input: '[["addRange",2,4],["addRange",4,6],["queryRange",2,6],["removeRange",3,5],["queryRange",2,6]]' },
    { label: 'Whole span', input: '[["addRange",0,50],["queryRange",0,50],["removeRange",0,50],["queryRange",0,50]]' },
    { label: 'Long run: 300 operations', input: '[["queryRange",25,29],["addRange",6,46],["addRange",26,43],["queryRange",32,36],["addRange",3,24],["addRange",38,41],["queryRange",43,48],["queryRange",48,50],["queryRange",47,48],["queryRange",3,27],["addRange",23,49],["queryRange",47,48],["queryRange",2,46],["addRange",16,49],["removeRange",34,47],["removeRange",26,49],["queryRange",13,39],["addRange",46,50],["queryRange",42,47],["removeRange",6,28],["removeRange",38,42],["removeRange",26,40],["addRange",43,49],["addRange",37,40],["addRange",11,12],["removeRange",33,44],["removeRange",28,49],["addRange",49,50],["removeRange",35,44],["removeRange",15,49],["queryRange",20,32],["removeRange",19,22],["addRange",12,35],["queryRange",5,40],["queryRange",12,46],["addRange",27,46],["addRange",37,49],["queryRange",15,43],["queryRange",11,41],["addRange",26,35],["removeRange",29,49],["queryRange",45,46],["queryRange",40,43],["addRange",29,39],["removeRange",39,47],["removeRange",12,30],["queryRange",40,48],["addRange",22,34],["addRange",3,24],["addRange",3,22],["removeRange",37,47],["queryRange",13,27],["addRange",40,50],["removeRange",1,40],["queryRange",39,50],["removeRange",23,30],["addRange",46,48],["addRange",47,50],["addRange",21,48],["addRange",35,40],["removeRange",8,25],["removeRange",16,38],["queryRange",14,50],["queryRange",42,50],["addRange",5,8],["addRange",49,50],["addRange",1,43],["removeRange",34,48],["addRange",12,49],["removeRange",38,40],["addRange",1,30],["queryRange",39,50],["addRange",35,44],["addRange",41,48],["queryRange",16,20],["addRange",26,44],["queryRange",20,44],["queryRange",32,49],["removeRange",15,20],["addRange",26,41],["removeRange",46,47],["removeRange",4,19],["addRange",21,23],["addRange",41,44],["queryRange",13,14],["queryRange",6,17],["removeRange",42,49],["addRange",21,42],["removeRange",10,36],["removeRange",35,42],["addRange",3,30],["removeRange",18,33],["removeRange",10,13],["addRange",12,32],["queryRange",13,28],["removeRange",5,27],["addRange",35,38],["addRange",38,49],["queryRange",46,47],["addRange",5,48],["removeRange",20,28],["removeRange",11,14],["removeRange",31,36],["removeRange",37,43],["queryRange",4,48],["queryRange",0,47],["queryRange",35,46],["addRange",8,43],["addRange",42,46],["removeRange",23,41],["queryRange",26,36],["queryRange",19,28],["queryRange",34,43],["queryRange",39,48],["removeRange",47,48],["removeRange",48,49],["removeRange",1,30],["addRange",2,24],["queryRange",8,40],["removeRange",11,46],["removeRange",40,43],["addRange",33,44],["removeRange",39,48],["addRange",16,48],["removeRange",31,45],["removeRange",46,48],["queryRange",11,18],["queryRange",7,35],["addRange",29,48],["removeRange",24,44],["addRange",20,35],["queryRange",32,33],["removeRange",36,43],["removeRange",25,37],["removeRange",25,48],["removeRange",5,42],["queryRange",49,50],["addRange",9,14],["queryRange",16,21],["removeRange",14,33],["queryRange",13,20],["removeRange",45,47],["removeRange",17,37],["addRange",39,49],["removeRange",5,23],["addRange",47,50],["addRange",30,40],["queryRange",39,50],["addRange",38,46],["queryRange",36,50],["removeRange",49,50],["addRange",5,25],["removeRange",46,50],["queryRange",1,21],["queryRange",33,38],["addRange",15,47],["queryRange",20,23],["addRange",21,28],["queryRange",29,37],["queryRange",1,3],["removeRange",13,36],["addRange",9,19],["removeRange",9,50],["addRange",6,42],["addRange",24,37],["queryRange",9,50],["removeRange",7,34],["queryRange",7,40],["removeRange",2,4],["addRange",29,38],["removeRange",24,28],["addRange",4,43],["addRange",0,21],["addRange",22,27],["queryRange",13,25],["addRange",30,45],["queryRange",46,47],["addRange",17,33],["queryRange",3,7],["removeRange",12,28],["queryRange",39,43],["queryRange",45,47],["removeRange",32,35],["queryRange",47,48],["addRange",12,37],["addRange",27,38],["addRange",33,40],["removeRange",23,40],["removeRange",38,46],["addRange",5,46],["removeRange",18,36],["queryRange",48,49],["queryRange",9,15],["queryRange",45,46],["queryRange",18,48],["removeRange",9,27],["queryRange",29,36],["addRange",31,39],["queryRange",9,34],["addRange",40,42],["addRange",20,49],["queryRange",48,50],["queryRange",14,26],["queryRange",6,41],["removeRange",30,33],["queryRange",41,48],["removeRange",18,40],["removeRange",46,50],["removeRange",41,45],["removeRange",41,49],["removeRange",16,21],["addRange",9,26],["removeRange",8,47],["addRange",2,36],["queryRange",25,37],["addRange",13,43],["addRange",42,50],["removeRange",24,30],["queryRange",26,35],["removeRange",14,27],["queryRange",4,18],["addRange",28,38],["addRange",9,44],["addRange",18,29],["removeRange",38,46],["removeRange",37,45],["removeRange",16,46],["addRange",18,39],["removeRange",34,35],["queryRange",47,48],["removeRange",14,50],["addRange",35,38],["removeRange",34,36],["removeRange",29,34],["queryRange",32,33],["queryRange",18,34],["removeRange",41,49],["addRange",1,12],["addRange",11,19],["removeRange",46,49],["queryRange",23,33],["queryRange",10,14],["queryRange",36,38],["queryRange",19,27],["queryRange",30,50],["removeRange",21,43],["removeRange",3,21],["queryRange",10,32],["addRange",15,49],["addRange",31,46],["addRange",42,44],["queryRange",35,44],["addRange",49,50],["addRange",36,43],["queryRange",10,44],["addRange",35,46],["removeRange",19,39],["removeRange",39,46],["removeRange",41,48],["addRange",6,45],["queryRange",5,50],["removeRange",2,19],["addRange",10,48],["addRange",2,21],["addRange",44,50],["queryRange",10,30],["queryRange",15,27],["queryRange",9,13],["removeRange",32,50],["queryRange",16,17],["removeRange",6,9],["queryRange",46,48],["removeRange",21,37],["queryRange",16,22],["removeRange",43,49],["queryRange",23,46],["queryRange",28,30],["queryRange",3,36],["removeRange",42,45],["queryRange",28,39],["addRange",33,45],["addRange",11,50],["removeRange",1,31],["queryRange",0,35],["removeRange",13,35],["queryRange",36,48],["addRange",9,36],["removeRange",31,36],["queryRange",17,20],["removeRange",5,42],["addRange",45,48],["addRange",41,42],["addRange",46,49],["addRange",29,31],["removeRange",39,47],["removeRange",36,46],["queryRange",26,36],["queryRange",7,20],["queryRange",42,43],["addRange",16,47]]' },
  ],
}

function IntervalViewFor({ run, step }) {
  const op = step.op === null || step.op === undefined ? null : run.input[step.op]
  const role = !op ? null : op[0] === 'addRange' ? 'current' : op[0] === 'removeRange' ? 'rejected' : step.returned ? 'merged' : 'rejected'
  const intervals = [
    ...step.intervals.map(([start, end]) => ({ start, end, group: 'Tracked ranges', role: 'kept' })),
    ...(op ? [{ start: op[1], end: op[2], group: `Operation: ${op[0]}`, role, label: op[0] === 'queryRange' ? (step.returned ? 'fully covered' : 'not fully covered') : undefined }] : []),
  ]
  const { interval } = intervalView({ title: 'Tracked ranges after each operation (half-open)', intervals, note: step.message })
  return interval ? <IntervalView {...interval} /> : null
}

export default function RangeModule() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IntervalViewFor run={run} step={step} />
    {step.seg && <SegtreeView {...step.seg} />}
    <table aria-label="Tracked intervals">
      <thead><tr><th>Interval</th></tr></thead>
      <tbody>{step.intervals.length === 0 ? <tr><td>none</td></tr> : step.intervals.map(([a, b]) => <tr key={`${a}-${b}`}><td>[{a}, {b})</td></tr>)}</tbody>
    </table>
    <OperationLog title="Operations" ops={step.log ?? []} current={step.op ?? -1} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Half-open:</strong> [l, r) touching at a shared end counts as adjacent, so addRange merges intervals that meet exactly.</p>
  </>} />
}
