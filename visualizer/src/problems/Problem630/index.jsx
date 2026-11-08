import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HeapView from '../../components/shared/HeapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort by deadline', description: 'Start with an empty schedule.' },
    { id: 'take', label: 'Take course', description: 'Add the course and check its finish time.' },
    { id: 'drop', label: 'Drop longest', description: 'Remove the longest taken course to meet the deadline.' },
    { id: 'done', label: 'Complete', description: 'Report the number of courses kept.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Courses (JSON array of [duration, lastDay])',
  url: 'https://leetcode.com/problems/course-schedule-iii/',
  complexity: 'O(n log n) time with a heap (the visualization scans for the maximum, so it is O(n²) for display). O(n) space.',
  examples: [
    { label: 'Classic', input: '[[100,200],[200,1300],[1000,1250],[2000,3200]]' },
    { label: 'One fits', input: '[[1,2]]' },
    { label: 'Drop longest', input: '[[3,2],[4,3]]' },
    { label: 'Single course that fits', input: '[[5,5]]' },
    { label: 'Equal deadlines tie on the same day', input: '[[2,4],[2,4],[2,4]]' },
    { label: 'Maximum values at the limits', input: '[[10000,10000000]]' },
    { label: 'Long run: 40 courses', input: '[[198,3960],[80,1907],[19,2567],[51,4746],[16,2294],[123,76],[3,4070],[149,4913],[112,1636],[115,934],[187,4008],[182,2038],[41,3039],[134,974],[160,4976],[153,1521],[137,2326],[93,1976],[131,809],[182,2747],[182,4603],[176,3300],[107,3168],[14,2083],[131,3651],[198,4976],[77,851],[74,3728],[25,934],[98,3521],[107,2208],[90,3494],[119,272],[189,3711],[50,2316],[133,1856],[71,422],[62,735],[65,2783],[7,3839]]' },
  ],
}

export default function CourseScheduleIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    {step.heapState && <HeapView {...step.heapState} />}
    <p>Finish time {step.time}</p>
    <output aria-label="Courses kept">Courses kept: {step.taken.length}{step.result !== undefined ? ` · final ${step.result}` : ''}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Exchange argument:</strong> when a deadline is missed, removing the longest course taken so far is never worse than removing the newest one, and keeps the count unchanged.</p>
  </>} />
}
