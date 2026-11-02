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
