import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HighFiveView from './HighFiveView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1086',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'List of [studentId, score] records (e.g. [[1,91],[1,92],...])',
  url: 'https://leetcode.com/problems/high-five/',
  complexity: 'O(n log k) time and O(n) space for n records, with k = 5 scores kept per student. The visualization caps the input at 30 records, 6 students, and integer scores from 0 to 1000; the official numeric bounds were not verified.',
  examples: [
    { label: 'Two students', input: '[[1,91],[1,92],[2,93],[2,97],[1,60],[2,77],[1,95],[1,88],[2,100],[2,95],[1,70],[2,80],[1,99],[2,88]]' },
    { label: 'Exactly five records', input: '[[1,10],[1,20],[1,30],[1,40],[1,50],[2,1],[2,1],[2,1],[2,1],[2,1]]' },
    { label: 'Single student, five records', input: '[[4,0],[4,0],[4,0],[4,0],[4,0]]' },
    { label: 'Tied scores all count', input: '[[3,50],[3,50],[3,50],[3,50],[3,50],[3,50]]' },
    { label: 'Maximum and zero scores', input: '[[1,1000],[1,1000],[1,1000],[1,1000],[1,1000],[1,0],[2,1000],[2,1000],[2,1000],[2,1000],[2,1000]]' },
    { label: 'Long run: 6 students, 30 records', input: '[[1,566],[3,923],[6,262],[2,883],[4,446],[1,381],[2,384],[3,952],[4,109],[5,813],[5,667],[2,517],[6,378],[6,509],[1,896],[6,526],[2,220],[3,476],[2,409],[1,930],[3,644],[5,962],[4,941],[4,154],[6,20],[3,817],[5,40],[1,450],[4,289],[5,810]]' },
  ],
}

export default function HighFiveProblem() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <HighFiveView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          Each student keeps a min-heap of five scores, so the smallest kept score is always at the top.
          {run ? ` The answer lists ${run.answer.length} student${run.answer.length === 1 ? '' : 's'}.` : ''} {step.decision === 'replace' ? 'A higher score pushes out the smallest one.' : ''}
        </p>
      )}
    />
  )
}
