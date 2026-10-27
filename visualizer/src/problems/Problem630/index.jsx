import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HeapView from '../../components/shared/HeapView'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort by deadline', description: 'Start with an empty schedule.' },
    { id: 'take', label: 'Take course', description: 'Add the course and check its finish time.' },
    { id: 'drop', label: 'Drop longest', description: 'Remove the longest taken course to meet the deadline.' },
    { id: 'done', label: 'Complete', description: 'Report the number of courses kept.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Courses (JSON array of [duration, lastDay])',
  url: 'https://leetcode.com/problems/course-schedule-iii/',
  complexity: 'O(n log n) time with a heap (the visualization scans for the maximum, so it is O(n²) for display). O(n) space.',
  examples: [
    { label: 'Classic', input: '[[100,200],[200,1300],[1000,1250],[2000,3200]]' },
    { label: 'One fits', input: '[[1,2]]' },
    { label: 'Drop longest', input: '[[3,2],[4,3]]' },
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
