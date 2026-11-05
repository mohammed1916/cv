import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import EmployeeFreeTimeView from './EmployeeFreeTimeView'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const definition = {
  number: '759',
  phases: [
    { id: 'flatten', label: 'Collect', description: 'Gather every busy interval.' },
    { id: 'sort', label: 'Sort', description: 'Order the intervals by start.' },
    { id: 'compare', label: 'Compare', description: 'Check the next interval against reach.' },
    { id: 'gap', label: 'Gap', description: 'A start after reach opens a free gap.' },
    { id: 'extend', label: 'Extend', description: 'Move reach to the latest end seen.' },
    { id: 'done', label: 'Result', description: 'Report the finite free gaps.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'List of employees, each a sorted list of [start, end] busy intervals',
  url: 'https://leetcode.com/problems/employee-free-time/description/',
  complexity: 'O(N log N) time for N total intervals, from the sort; O(N) extra space. The visualization caps input at 4 employees, 5 intervals each and times 0 to 50; the official bounds are not verified.',
  examples: [
    { label: 'Three employees', input: '[[[2,4],[9,10]],[[3,5]],[[7,8]]]' },
    { label: 'Overlapping busy time', input: '[[[0,2],[6,7]],[[1,3],[11,12]]]' },
    { label: 'Touching busy time', input: '[[[1,2]],[[2,3]]]' },
  ],
}

export default function EmployeeFreeTime() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <EmployeeFreeTimeView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Sweeping the sorted intervals while tracking reach shows every gap that starts after all earlier work has ended.</p>}
    />
  )
}
