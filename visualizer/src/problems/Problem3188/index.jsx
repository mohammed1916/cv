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
    { label: "Single student, one course", input: "{\"students\": [[1, \"Ola\", \"Physics\"]], \"courses\": [[501, \"Optics\", 3, \"Physics\", \"Yes\"]], \"enrollments\": [[1, 501, \"Fall\", \"A\", 4]]}" },
    { label: "Empty tables", input: "{\"students\": [], \"courses\": [], \"enrollments\": []}" },
    { label: "Student with no enrollments", input: "{\"students\": [[1, \"Ola\", \"Physics\"], [2, \"Bea\", \"Chemistry\"]], \"courses\": [[501, \"Optics\", 3, \"Physics\", \"Yes\"]], \"enrollments\": [[1, 501, \"Fall\", \"B\", 3]]}" },
    { label: "Long run: 8 students, 40 enrollments", input: "{\"students\": [[1, \"Student 1\", \"Physics\"], [2, \"Student 2\", \"Chemistry\"], [3, \"Student 3\", \"Physics\"], [4, \"Student 4\", \"Chemistry\"], [5, \"Student 5\", \"Physics\"], [6, \"Student 6\", \"Chemistry\"], [7, \"Student 7\", \"Physics\"], [8, \"Student 8\", \"Chemistry\"]], \"courses\": [[501, \"Optics\", 4, \"Physics\", \"Yes\"], [502, \"Thermo\", 3, \"Chemistry\", \"No\"], [503, \"Quantum\", 3, \"Physics\", \"No\"], [504, \"Organic\", 4, \"Chemistry\", \"No\"], [505, \"Kinetics\", 3, \"Physics\", \"Yes\"], [506, \"Genomes\", 3, \"Chemistry\", \"No\"], [507, \"Ecology\", 4, \"Physics\", \"No\"], [508, \"Enzymes\", 3, \"Chemistry\", \"No\"], [509, \"Mechanics\", 3, \"Physics\", \"Yes\"], [510, \"Ions\", 4, \"Chemistry\", \"No\"], [511, \"Cells\", 3, \"Physics\", \"No\"], [512, \"Fields\", 3, \"Chemistry\", \"No\"]], \"enrollments\": [[1, 504, \"Fall\", \"B\", 3], [1, 509, \"Spring\", \"C\", 2], [1, 502, \"Fall\", \"D\", 1], [1, 507, \"Spring\", \"F\", 0], [1, 512, \"Fall\", \"A\", 4], [2, 507, \"Fall\", \"C\", 2], [2, 512, \"Spring\", \"D\", 1], [2, 505, \"Fall\", \"F\", 0], [2, 510, \"Spring\", \"A\", 4], [2, 503, \"Fall\", \"B\", 3], [3, 510, \"Fall\", \"D\", 1], [3, 503, \"Spring\", \"F\", 0], [3, 508, \"Fall\", \"A\", 4], [3, 501, \"Spring\", \"B\", 3], [3, 506, \"Fall\", \"C\", 2], [4, 501, \"Fall\", \"F\", 0], [4, 506, \"Spring\", \"A\", 4], [4, 511, \"Fall\", \"B\", 3], [4, 504, \"Spring\", \"C\", 2], [4, 509, \"Fall\", \"D\", 1], [5, 504, \"Fall\", \"A\", 4], [5, 509, \"Spring\", \"B\", 3], [5, 502, \"Fall\", \"C\", 2], [5, 507, \"Spring\", \"D\", 1], [5, 512, \"Fall\", \"F\", 0], [6, 507, \"Fall\", \"B\", 3], [6, 512, \"Spring\", \"C\", 2], [6, 505, \"Fall\", \"D\", 1], [6, 510, \"Spring\", \"F\", 0], [6, 503, \"Fall\", \"A\", 4], [7, 510, \"Fall\", \"C\", 2], [7, 503, \"Spring\", \"D\", 1], [7, 508, \"Fall\", \"F\", 0], [7, 501, \"Spring\", \"A\", 4], [7, 506, \"Fall\", \"B\", 3], [8, 501, \"Fall\", \"D\", 1], [8, 506, \"Spring\", \"F\", 0], [8, 511, \"Fall\", \"A\", 4], [8, 504, \"Spring\", \"B\", 3], [8, 509, \"Fall\", \"C\", 2]]}" },
  ],
}

export default function FindTopScoringStudentsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <StudentFilterView step={step} />} renderReasoning={() => <>
    <p>The average covers every course a student took, so it must be computed before the join narrows the rows down to their major. A weak grade outside the major can lower the average without breaking any grade rule.</p>
    <p>The left join starts from the courses of the major, not from what the student took. A missing mandatory course then shows up as a row with a NULL grade, and an inner join would hide it.</p>
    <p>Retakes appear as extra rows. Each attempt must meet the grade rule, and a repeated elective still counts as one course.</p>
  </>} />
}
