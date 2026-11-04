import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import StudentFilterView from './StudentFilterView'
import { buildTrace, parseInput, code, python } from './algorithm'

const mixed = {
  students: [[7, 'Sana', 'History'], [1, 'Mira', 'Biology'], [2, 'Tomas', 'Biology'], [3, 'Ines', 'History'], [4, 'Kofi', 'History'], [5, 'Lena', 'Biology'], [6, 'Raj', 'History']],
  courses: [
    [201, 'Cells', 3, 'Biology', 'Yes'], [202, 'Genetics', 4, 'Biology', 'Yes'], [203, 'Ecology', 3, 'Biology', 'No'], [204, 'Botany', 3, 'Biology', 'No'], [205, 'Zoology', 3, 'Biology', 'No'],
    [301, 'Rome', 3, 'History', 'Yes'], [302, 'Archives', 4, 'History', 'Yes'], [303, 'Maps', 3, 'History', 'No'], [304, 'Trade', 3, 'History', 'No'],
  ],
  enrollments: [
    [7, 301, 'Fall', 'A', 4], [7, 302, 'Fall', 'A', 4], [7, 303, 'Spring', 'A', 4], [7, 304, 'Spring', 'B', 3],
    [1, 201, 'Fall', 'A', 4], [1, 202, 'Fall', 'A', 4], [1, 203, 'Spring', 'B', 3], [1, 205, 'Spring', 'A', 4], [1, 301, 'Summer', 'C', 2],
    [2, 201, 'Fall', 'A', 4], [2, 202, 'Fall', 'A', 4], [2, 203, 'Spring', 'A', 4], [2, 204, 'Spring', 'C', 2],
    [3, 301, 'Fall', 'A', 4], [3, 302, 'Fall', 'B', 3], [3, 303, 'Spring', 'A', 4], [3, 304, 'Spring', 'A', 4],
    [4, 301, 'Fall', 'A', 4], [4, 303, 'Spring', 'A', 4], [4, 304, 'Spring', 'B', 3],
    [5, 201, 'Fall', 'A', 4], [5, 202, 'Fall', 'A', 4], [5, 203, 'Spring', 'B', 3], [5, 204, 'Spring', 'B', 3], [5, 301, 'Summer', 'F', 0], [5, 302, 'Summer', 'F', 0], [5, 303, 'Summer', 'F', 0],
    [6, 301, 'Fall', 'A', 4], [6, 302, 'Fall', 'A', 4], [6, 303, 'Spring', 'B', 3],
  ],
}
const retakes = {
  students: [[1, 'Yara', 'Music'], [2, 'Omar', 'Music'], [3, 'Ada', 'Drama']],
  courses: [[401, 'Harmony', 3, 'Music', 'Yes'], [402, 'Jazz', 3, 'Music', 'No'], [403, 'Opera', 3, 'Music', 'No']],
  enrollments: [
    [1, 401, 'Fall', 'A', 4], [1, 402, 'Fall', 'B', 3], [1, 402, 'Spring', 'A', 4],
    [2, 401, 'Fall', 'A', 4], [2, 401, 'Spring', 'B', 3], [2, 402, 'Fall', 'A', 4], [2, 403, 'Fall', 'A', 4],
    [3, 401, 'Fall', 'A', 4],
  ],
}

const definition = {
  number: '3188',
  phases: [
    { id: 'load', label: 'Load', description: 'Read the three tables.' },
    { id: 'average', label: 'Average', description: 'Filter on average GPA across every enrollment.' },
    { id: 'join', label: 'Join', description: 'Pair the student with the courses of their major, keeping untaken ones.' },
    { id: 'row', label: 'Check rows', description: 'Judge each joined row against the grade rules.' },
    { id: 'having', label: 'Having', description: 'Apply the three group conditions.' },
    { id: 'done', label: 'Result', description: 'Order the qualifying ids.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with students [id, name, major], courses [id, name, credits, major, Yes or No], enrollments [student, course, semester, grade, GPA]',
  url: 'https://leetcode.com/problems/find-top-scoring-students-ii/',
  complexity: 'One grouping pass over the enrollments, then a join on the courses of each major: about O(e + s × c) without indexes. This page caps the tables at 8 students, 12 courses and 40 enrollments.',
  examples: [
    { label: 'Seven students', input: JSON.stringify(mixed) },
    { label: 'Retakes, no one qualifies', input: JSON.stringify(retakes) },
  ],
}

export default function FindTopScoringStudentsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <StudentFilterView step={step} />} renderReasoning={() => <>
    <p>The average covers every course a student took, so it must be computed before the join narrows the rows down to their major. A weak grade outside the major can lower the average without breaking any grade rule.</p>
    <p>The left join starts from the courses of the major, not from what the student took. A missing mandatory course then shows up as a row with a NULL grade, and an inner join would hide it.</p>
    <p>Retakes appear as extra rows. Each attempt must meet the grade rule, and a repeated elective still counts as one course.</p>
  </>} />
}
