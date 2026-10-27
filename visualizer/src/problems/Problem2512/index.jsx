import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Words', description: 'Mark the positive and negative feedback words.' },
    { id: 'score', label: 'Score', description: 'Score one student from the words in the report.' },
    { id: 'push', label: 'Push', description: 'Add the student to the heap.' },
    { id: 'pop', label: 'Trim', description: 'Remove the weakest student when the heap is over size k.' },
    { id: 'sort', label: 'Sort', description: 'Order the survivors from best to worst.' },
    { id: 'done', label: 'Complete', description: 'Report the top k ids.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with positive_feedback, negative_feedback, report, student_id and k (JSON)',
  url: 'https://leetcode.com/problems/reward-top-k-students/',
  complexity: 'O(n * w * log k) time for n reports with w words each. The visualization caps the input at 6 students.',
  examples: [
    { label: 'Example 1', input: '{"positive_feedback":["smart","brilliant","studious"],"negative_feedback":["not"],"report":["this student is studious","the student is smart"],"student_id":[1,2],"k":2}' },
    { label: 'Negative word', input: '{"positive_feedback":["smart","brilliant","studious"],"negative_feedback":["not"],"report":["this student is not studious","the student is smart"],"student_id":[1,2],"k":2}' },
  ],
}

export default function RewardTopKStudents() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Score by student" length={run.input.report.length} valueAt={i => step.scores[i] ?? '-'}
      active={step.index} roleAt={i => `id ${run.input.student_id[i]}`} />
    <output aria-label="Heap">{`Heap (worst on top): ${step.heap.map(item => `${item.id}:${item.score}`).join(', ') || 'empty'}`}</output>
  </>} renderReasoning={() => <>
    <p>A min-heap of size k keeps the k best students seen so far. Its top is the weakest survivor, so a newcomer only needs to beat that one student.</p>
    <p>Ties in score go to the smaller id, so the heap compares the id in reverse on equal scores.</p>
  </>} />
}
