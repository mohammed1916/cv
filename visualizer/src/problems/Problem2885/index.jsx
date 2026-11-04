import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RenameColumnsView from './RenameColumnsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with students (rows holding id, first, last and age)',
  url: 'https://leetcode.com/problems/rename-columns/',
  complexity: 'O(c) header changes for c columns. A plain rename touches labels, so the values are not rewritten; this view shows up to 12 rows.',
  examples: [
    { label: 'Three students', input: '{"students":[{"id":11,"first":"Priya","last":"Nair","age":15},{"id":12,"first":"Tomas","last":"Ruiz","age":17},{"id":13,"first":"Lena","last":"Okafor","age":14}]}' },
    { label: 'Shuffled columns', input: '{"students":[{"age":19,"last":"Haddad","id":40,"first":"Omar"},{"age":20,"last":"Sato","id":41,"first":"Yuki"}]}' },
    { label: 'Empty table', input: '{"students":[]}' },
  ],
}

export default function RenameColumns() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <RenameColumnsView run={run} step={step} />} renderReasoning={() => <>
    <p>Renaming changes what a column is called, never what it holds. No row moves and no value is copied into a different slot.</p>
    <p>A mapping keyed by the old name is safer than listing four new names in order: if the table arrives with its columns shuffled, every label still lands on the right data. Try the shuffled example to see it.</p>
  </>} />
}
