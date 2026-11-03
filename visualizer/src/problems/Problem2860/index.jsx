import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count', description: 'Start counting how many students have each value.' },
    { id: 'count', label: 'Count', description: 'Add one student to its value bucket.' },
    { id: 'check', label: 'Check', description: 'Test whether a group of size k makes everyone happy.' },
    { id: 'done', label: 'Result', description: 'Report the number of valid group sizes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (student values from 0 to n minus 1)',
  url: 'https://leetcode.com/problems/happy-students/',
  complexity: 'O(n) time with a counting array of size n + 1.',
  examples: [
    { label: 'Two groups', input: '{"nums":[4,4,1,0,4,2]}' },
    { label: 'Single group', input: '{"nums":[2,3,0,1,4]}' },
  ],
}

export default function HappyStudents() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="students with value v" length={step.count.length} valueAt={i => step.count[i]} active={step.k >= 0 ? step.k : -1} />
    <output aria-label="Group check">{`group size k = ${step.k >= 0 ? step.k : 'none'}, below k = ${step.less}, ways = ${step.ways}`}</output>
  </>} renderReasoning={() => <>
    <p>If k students are selected, a selected student is happy only when its value is below k, and an unselected one only when its value is above k. So the selected set is forced: every student with a value below k.</p>
    <p>A size k works exactly when that forced set has k students and no student has the value k. Each valid k is one distinct way.</p>
  </>} />
}
