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
    { label: 'Own case 1', input: '{"positive_feedback":["studious","brilliant","smart"],"negative_feedback":["not"],"report":["the student is smart","this student is studious"],"student_id":[2,1],"k":2}' },
    { label: 'Negative word', input: '{"positive_feedback":["smart","brilliant","studious"],"negative_feedback":["not"],"report":["this student is not studious","the student is smart"],"student_id":[1,2],"k":2}' },
    { label: 'Single student', input: '{"positive_feedback":["smart"],"negative_feedback":["not"],"report":["the smart one"],"student_id":[1],"k":1}' },
    { label: 'Equal scores', input: '{"positive_feedback":["smart"],"negative_feedback":["not"],"report":["smart","smart"],"student_id":[7,3],"k":2}' },
    { label: 'Largest feedback, six students', input: '{"positive_feedback":["alpha","beta","gamma","delta","omega"],"negative_feedback":["zeta"],"report":["alpha beta gamma","zeta","omega omega","beta","delta alpha beta gamma","gamma"],"student_id":[99,1,50,12,88,2],"k":6}' },
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
