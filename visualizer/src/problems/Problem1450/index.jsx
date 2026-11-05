import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, codeLines, python, pythonLineMap, phases, examples } from './algorithm'

const definition = {
  number: '1450', phases, parse: parseInput, build: buildTrace, code: codeLines, python, pythonLineMap, examples,
  inputLabel: 'Object with start, end and query (JSON)',
  url: 'https://leetcode.com/problems/number-of-students-doing-homework-at-a-given-time/',
  complexity: 'O(n) time for n students, and O(1) extra space.',
}

export default function HomeworkTimeVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <RecordStateTable label={`Students checked at time ${s.query}`} columns={['student', 'start', 'end', 'busy']} rows={s.rows} activeRow={s.current ?? -1} />
      <StackLane title="Students doing homework" items={[`${s.count} of ${run.input.start.length}`]} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Interval check:</strong> each student is an interval, and the query time is either inside it or not, so one comparison per student decides.</p>
    <p>{step.message}</p>
  </>} />
}
